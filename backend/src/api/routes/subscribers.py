"""Subscriber routes for email collection."""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...models.subscriber import Subscriber

router = APIRouter()


class SubscribeRequest(BaseModel):
    email: str
    source: str = "audit_page"


@router.post("")
async def subscribe(req: SubscribeRequest, db: AsyncSession = Depends(get_db)):
    """Save a new email subscriber."""
    email = req.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(400, "Invalid email")

    # Check if already exists
    result = await db.execute(select(Subscriber).where(Subscriber.email == email))
    existing = result.scalar_one_or_none()
    if existing:
        return {"status": "already_subscribed", "email": email}

    subscriber = Subscriber(email=email, source=req.source)
    db.add(subscriber)
    await db.commit()
    return {"status": "subscribed", "email": email}


@router.get("")
async def list_subscribers(db: AsyncSession = Depends(get_db)):
    """List all subscribers (internal use)."""
    result = await db.execute(
        select(Subscriber).order_by(Subscriber.subscribed_at.desc())
    )
    records = result.scalars().all()
    return [
        {
            "id": r.id,
            "email": r.email,
            "source": r.source,
            "subscribed_at": r.subscribed_at.isoformat() if r.subscribed_at else None,
        }
        for r in records
    ]
