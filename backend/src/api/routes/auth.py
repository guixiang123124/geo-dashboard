"""
Authentication API routes.
"""

import secrets
import string
from datetime import timedelta
from typing import Annotated
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.core.config import settings
from src.core.database import get_db
from src.schemas.auth_schemas import (
    Token,
    UserCreate,
    UserResponse,
    UserUpdate,
    PasswordChange,
)
from src.services.auth_service import (
    authenticate_user,
    create_access_token,
    create_user,
    decode_access_token,
    get_user_by_email,
    get_user_by_id,
    get_password_hash,
    verify_password,
    update_last_login,
)
from src.models.user import User


router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    user_id = decode_access_token(token)
    if user_id is None:
        raise credentials_exception

    user = await get_user_by_id(db, user_id)
    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )

    return user


async def get_current_active_superuser(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """Get current user if they are a superuser."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough privileges"
        )
    return current_user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> User:
    """Register a new user."""
    # Check if user already exists
    existing_user = await get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    user = await create_user(
        db=db,
        email=user_in.email,
        password=user_in.password,
        full_name=user_in.full_name,
    )

    return user


@router.post("/login", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Login and get JWT access token."""
    user = await authenticate_user(db, form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )

    # Update last login
    await update_last_login(db, user)

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id,
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """Get current user profile."""
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_me(
    user_update: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db)
) -> User:
    """Update current user profile."""
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name

    if user_update.password is not None:
        current_user.hashed_password = get_password_hash(user_update.password)

    await db.commit()
    await db.refresh(current_user)

    return current_user


@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Change current user's password."""
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )

    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    await db.commit()

    return {"message": "Password changed successfully"}


@router.post("/logout")
async def logout() -> dict:
    """Logout (client should discard the token)."""
    return {"message": "Successfully logged out"}


@router.get("/oauth/{provider}")
async def oauth_redirect(provider: str) -> RedirectResponse:
    """Redirect to OAuth provider (google/apple)."""
    if provider not in ["google", "apple"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported OAuth provider"
        )

    if provider == "google":
        if not settings.GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Google OAuth not configured"
            )

        auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": f"{settings.OAUTH_REDIRECT_BASE}/api/v1/auth/oauth/google/callback",
            "scope": "openid email profile",
            "response_type": "code",
            "access_type": "offline",
            "prompt": "consent"
        }

    elif provider == "apple":
        if not settings.APPLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Apple OAuth not configured"
            )

        auth_url = "https://appleid.apple.com/auth/authorize"
        params = {
            "client_id": settings.APPLE_CLIENT_ID,
            "redirect_uri": f"{settings.OAUTH_REDIRECT_BASE}/api/v1/auth/oauth/apple/callback",
            "scope": "name email",
            "response_type": "code",
            "response_mode": "query"
        }

    redirect_url = f"{auth_url}?{urlencode(params)}"
    return RedirectResponse(url=redirect_url)


@router.get("/oauth/{provider}/callback")
async def oauth_callback(
    provider: str, 
    code: str,
    db: AsyncSession = Depends(get_db)
) -> RedirectResponse:
    """Handle OAuth callback, create/login user, redirect to frontend with token."""
    if provider not in ["google", "apple"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported OAuth provider"
        )

    try:
        # Exchange code for tokens and get user info
        if provider == "google":
            user_info = await _get_google_user_info(code)
        elif provider == "apple":
            user_info = await _get_apple_user_info(code)
        
        email = user_info.get("email")
        name = user_info.get("name")
        oauth_id = user_info.get("id")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by OAuth provider"
            )

        # Find or create user
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            # Create new OAuth user with random password
            random_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
            user = User(
                email=email,
                full_name=name,
                hashed_password=get_password_hash(random_password),
                oauth_provider=provider,
                oauth_id=oauth_id,
                is_active=True
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        else:
            # Update OAuth fields if not set
            if not user.oauth_provider:
                user.oauth_provider = provider
                user.oauth_id = oauth_id
                await db.commit()

        # Update last login
        await update_last_login(db, user)

        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            subject=user.id,
            expires_delta=access_token_expires
        )

        # Redirect to frontend with token
        frontend_url = f"{settings.FRONTEND_URL}/auth/callback?token={access_token}"
        return RedirectResponse(url=frontend_url)

    except Exception as e:
        # Redirect to frontend with error
        error_url = f"{settings.FRONTEND_URL}/auth/login?error=oauth_failed"
        return RedirectResponse(url=error_url)


async def _get_google_user_info(code: str) -> dict:
    """Exchange Google OAuth code for user info."""
    # Exchange code for access token
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": f"{settings.OAUTH_REDIRECT_BASE}/api/v1/auth/oauth/google/callback"
    }

    async with httpx.AsyncClient() as client:
        token_response = await client.post(token_url, data=token_data)
        token_response.raise_for_status()
        tokens = token_response.json()

        # Get user info
        user_info_url = f"https://www.googleapis.com/oauth2/v2/userinfo?access_token={tokens['access_token']}"
        user_response = await client.get(user_info_url)
        user_response.raise_for_status()
        user_info = user_response.json()

        return {
            "id": user_info.get("id"),
            "email": user_info.get("email"),
            "name": user_info.get("name")
        }


async def _get_apple_user_info(code: str) -> dict:
    """Exchange Apple OAuth code for user info."""
    # Note: Apple OAuth is more complex and requires JWT tokens
    # For now, we'll return a placeholder implementation
    # Full implementation would require JWT signing with Apple's private key
    
    # This is a simplified version - in production, you'd need to:
    # 1. Create a JWT client assertion signed with your Apple private key
    # 2. Exchange the code for tokens
    # 3. Decode the ID token to get user info
    
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Apple OAuth implementation pending"
    )
