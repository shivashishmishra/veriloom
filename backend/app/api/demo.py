from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.demo_data.seeder import seed_demo_workspace

router = APIRouter(prefix="/demo", tags=["Demo Workspace"])

@router.post("/reset-seed")
def reset_demo_seed(db: Session = Depends(get_db)):
    org = seed_demo_workspace(db)
    return {
        "status": "SUCCESS",
        "organization": org.name,
        "badge": "DEMO WORKSPACE — SYNTHETIC SAMPLE DATA",
        "message": "NovaTech synthetic demo workspace successfully seeded with brand guidelines, pricing rules, terminology, and prepared drafts."
    }

@router.get("/status")
def get_demo_status():
    return {
        "is_demo_mode": True,
        "badge_text": "DEMO WORKSPACE — SYNTHETIC SAMPLE DATA",
        "accounts": [
            {"role": "Creator", "email": "creator@novatech.io", "name": "Alex Chen"},
            {"role": "Reviewer", "email": "reviewer@novatech.io", "name": "Morgan Rivera"},
            {"role": "Brand Admin", "email": "admin@novatech.io", "name": "Dr. Elena Vance"}
        ]
    }
