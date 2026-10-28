import re
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
from jose import JWTError, jwt
from app.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8')[:72], hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8')[:72], salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

# PII & Confidential Data Masking
EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b')
PHONE_REGEX = re.compile(r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b')
API_KEY_REGEX = re.compile(r'(?i)\b(?:api[_-]?key|token|secret)\s*[:=]\s*["\']?([a-zA-Z0-9_\-]{16,})["\']?')

def mask_confidential_text(text: str) -> Tuple[str, Dict[str, str]]:
    """
    Masks emails, phone numbers, and potential API keys locally before any external transmission.
    Returns: (redacted_text, redaction_mapping)
    """
    if not settings.MASK_CONFIDENTIAL_DATA or not text:
        return text, {}

    mapping = {}
    counter = 1

    def replace_email(match):
        nonlocal counter
        placeholder = f"[REDACTED_EMAIL_{counter}]"
        mapping[placeholder] = match.group(0)
        counter += 1
        return placeholder

    def replace_phone(match):
        nonlocal counter
        placeholder = f"[REDACTED_PHONE_{counter}]"
        mapping[placeholder] = match.group(0)
        counter += 1
        return placeholder

    def replace_key(match):
        nonlocal counter
        placeholder = f"[REDACTED_KEY_{counter}]"
        val = match.group(1)
        full = match.group(0)
        mapping[placeholder] = val
        counter += 1
        return full.replace(val, placeholder)

    masked = EMAIL_REGEX.sub(replace_email, text)
    masked = PHONE_REGEX.sub(replace_phone, masked)
    masked = API_KEY_REGEX.sub(replace_key, masked)
    return masked, mapping

def restore_confidential_text(text: str, mapping: Dict[str, str]) -> str:
    restored = text
    for placeholder, original in mapping.items():
        restored = restored.replace(placeholder, original)
    return restored
