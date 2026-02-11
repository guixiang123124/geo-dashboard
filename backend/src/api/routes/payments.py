"""
Stripe payment integration — checkout sessions, webhooks, subscription status.
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


class CheckoutRequest(BaseModel):
    price_id: str
    success_url: str
    cancel_url: str


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


@router.post("/create-checkout-session", response_model=CheckoutResponse)
async def create_checkout_session(req: CheckoutRequest):
    """Create a Stripe Checkout Session for a subscription."""
    from ...core.config import settings

    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Stripe is not configured")

    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY

    # Resolve plan aliases to actual Stripe price IDs
    price_map = {
        "pro": settings.STRIPE_PRICE_PRO,
        "enterprise": settings.STRIPE_PRICE_ENTERPRISE,
    }
    resolved_price = price_map.get(req.price_id, req.price_id)
    if not resolved_price:
        raise HTTPException(status_code=400, detail=f"Price not configured for plan: {req.price_id}")

    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            payment_method_types=["card"],
            line_items=[{"price": resolved_price, "quantity": 1}],
            success_url=req.success_url,
            cancel_url=req.cancel_url,
        )
        return CheckoutResponse(checkout_url=session.url, session_id=session.id)
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events. Requires raw body for signature verification."""
    from ...core.config import settings

    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if settings.STRIPE_WEBHOOK_SECRET and sig_header:
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            raise HTTPException(status_code=400, detail="Invalid signature")
    else:
        # For development without webhook secret
        import json
        event = json.loads(payload)

    event_type = event.get("type") if isinstance(event, dict) else event.type
    data = event.get("data", {}).get("object", {}) if isinstance(event, dict) else event.data.object

    if event_type == "checkout.session.completed":
        customer_id = getattr(data, 'customer', data.get('customer', ''))
        customer_email = getattr(data, 'customer_email', data.get('customer_email', ''))
        print(f"[Stripe] Checkout completed: customer={customer_id}, email={customer_email}")
        
        # Link Stripe customer to our user
        if customer_email:
            await _update_user_subscription(customer_email, customer_id=customer_id)

    elif event_type in (
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
    ):
        sub_status = getattr(data, "status", data.get("status", "unknown"))
        customer_id = getattr(data, "customer", data.get("customer", ""))
        
        # Determine plan from price ID
        items = getattr(data, "items", data.get("items", {}))
        plan = _resolve_plan_name(items)
        
        print(f"[Stripe] Subscription {event_type}: status={sub_status}, plan={plan}")
        
        if customer_id:
            await _update_user_subscription(
                None,
                customer_id=customer_id,
                status=sub_status if event_type != "customer.subscription.deleted" else "canceled",
                plan=plan
            )

    elif event_type == "invoice.payment_failed":
        customer_id = getattr(data, "customer", data.get("customer", ""))
        print(f"[Stripe] Payment failed: customer={customer_id}")
        if customer_id:
            await _update_user_subscription(None, customer_id=customer_id, status="past_due")

    return {"status": "ok"}


def _resolve_plan_name(items) -> str:
    """Resolve Stripe price ID to plan name."""
    from ...core.config import settings
    
    try:
        if hasattr(items, 'data'):
            price_id = items.data[0].price.id if items.data else None
        elif isinstance(items, dict):
            data_list = items.get("data", [])
            price_id = data_list[0].get("price", {}).get("id") if data_list else None
        else:
            return "unknown"
        
        if price_id == settings.STRIPE_PRICE_PRO:
            return "pro"
        elif price_id == settings.STRIPE_PRICE_ENTERPRISE:
            return "enterprise"
        return "unknown"
    except Exception:
        return "unknown"


async def _update_user_subscription(
    email: str = None,
    customer_id: str = None,
    status: str = None,
    plan: str = None,
):
    """Update user subscription fields in database."""
    from src.core.database import _get_session_factory
    from src.models.user import User
    
    try:
        async with _get_session_factory()() as db:
            user = None
            if customer_id:
                stmt = select(User).where(User.stripe_customer_id == customer_id)
                result = await db.execute(stmt)
                user = result.scalar_one_or_none()
            
            if not user and email:
                stmt = select(User).where(User.email == email)
                result = await db.execute(stmt)
                user = result.scalar_one_or_none()
            
            if not user:
                print(f"[Stripe] User not found: email={email}, customer={customer_id}")
                return
            
            if customer_id and not user.stripe_customer_id:
                user.stripe_customer_id = customer_id
            if status:
                user.subscription_status = status
            if plan and plan != "unknown":
                user.subscription_plan = plan
            
            await db.commit()
            print(f"[Stripe] Updated user {user.email}: status={status}, plan={plan}")
    except Exception as e:
        print(f"[Stripe] Error updating user: {e}")


@router.get("/subscription-status")
async def subscription_status(customer_id: Optional[str] = None, email: Optional[str] = None):
    """Check subscription status by customer ID or email."""
    from ...core.config import settings

    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Stripe is not configured")

    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY

    try:
        if customer_id:
            subscriptions = stripe.Subscription.list(customer=customer_id, limit=1)
        elif email:
            customers = stripe.Customer.list(email=email, limit=1)
            if not customers.data:
                return {"status": "free", "plan": None}
            subscriptions = stripe.Subscription.list(customer=customers.data[0].id, limit=1)
        else:
            raise HTTPException(status_code=400, detail="Provide customer_id or email")

        if not subscriptions.data:
            return {"status": "free", "plan": None}

        sub = subscriptions.data[0]
        return {
            "status": sub.status,
            "plan": sub.items.data[0].price.id if sub.items.data else None,
            "current_period_end": sub.current_period_end,
            "cancel_at_period_end": sub.cancel_at_period_end,
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
