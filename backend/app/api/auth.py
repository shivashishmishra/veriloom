from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, Organization
from app.auth.security import verify_password, get_password_hash, create_access_token
from app.schemas.auth import Token, UserLogin, UserCreate, UserResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"user_id": user.id, "email": user.email, "role": user.role, "organization_id": user.organization_id}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "organization_id": user.organization_id,
        "organization_name": user.organization.name if user.organization else "NovaTech",
        "is_demo": user.organization.is_demo if user.organization else False
    }

@router.post("/login", response_model=Token)
def login_json(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    access_token = create_access_token(
        data={"user_id": user.id, "email": user.email, "role": user.role, "organization_id": user.organization_id}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "organization_id": user.organization_id,
        "organization_name": user.organization.name if user.organization else "NovaTech",
        "is_demo": user.organization.is_demo if user.organization else False
    }

@router.post("/demo-switch/{role}", response_model=Token)
def fast_demo_login(role: str, db: Session = Depends(get_db)):
    """
    Convenient judge demo entrypoint for fast testing of the 3 roles:
    'creator', 'reviewer', 'admin'
    """
    email_map = {
        "creator": "creator@novatech.io",
        "reviewer": "reviewer@novatech.io",
        "admin": "admin@novatech.io",
        "brand admin": "admin@novatech.io"
    }
    target_email = email_map.get(role.lower().strip())
    if not target_email:
        raise HTTPException(status_code=400, detail=f"Invalid demo role '{role}'. Options: creator, reviewer, admin")

    user = db.query(User).filter(User.email == target_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Demo account not found. Please initialize demo workspace.")

    access_token = create_access_token(
        data={"user_id": user.id, "email": user.email, "role": user.role, "organization_id": user.organization_id}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "organization_id": user.organization_id,
        "organization_name": user.organization.name if user.organization else "NovaTech AI Solutions",
        "is_demo": True
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
