import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "VeriLoom — Intelligent Brand-Governance Studio"
    PROJECT_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'veriloom.db').replace(os.sep, '/')}"
    )
    USE_PGVECTOR: bool = os.getenv("USE_PGVECTOR", "false").lower() == "true"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "veriloom-hackathon-super-secret-jwt-key-2026-inkloom-round2")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # AI Provider Settings
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "none") # "none", "gemini", "openai", "ollama"
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    OLLAMA_BASE_URL: Optional[str] = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    
    # Privacy & Confidentiality
    MASK_CONFIDENTIAL_DATA: bool = True
    
    # Certificate Signing
    CERTIFICATE_PRIVATE_KEY: Optional[str] = os.getenv("CERTIFICATE_PRIVATE_KEY", None)
    CERTIFICATE_SIGNING_ALGORITHM: str = "HMAC-SHA256" # or ED25519 if configured
    
    # Upload Storage
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    
    # Demo Mode
    IS_DEMO_MODE: bool = True
    DEMO_BADGE_TEXT: str = "DEMO WORKSPACE — SYNTHETIC SAMPLE DATA"
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
