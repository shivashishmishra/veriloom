import pytest
from app.auth.security import get_password_hash, verify_password, create_access_token, decode_access_token, mask_confidential_text, restore_confidential_text

def test_password_hashing():
    pwd = "DemoPassword123!"
    hashed = get_password_hash(pwd)
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

def test_jwt_token_roundtrip():
    data = {"user_id": 42, "email": "test@novatech.io", "role": "Reviewer"}
    token = create_access_token(data)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["user_id"] == 42
    assert decoded["email"] == "test@novatech.io"
    assert decoded["role"] == "Reviewer"

def test_confidential_data_masking():
    sensitive_text = "Contact support at compliance@novatech.io or call +1 415-555-0199 for token api_key: 'sk_live_1234567890abcdef1234'."
    masked, mapping = mask_confidential_text(sensitive_text)
    assert "compliance@novatech.io" not in masked
    assert "+1 415-555-0199" not in masked
    assert "sk_live_1234567890abcdef1234" not in masked
    
    # Verify restoration
    restored = restore_confidential_text(masked, mapping)
    assert restored == sensitive_text
