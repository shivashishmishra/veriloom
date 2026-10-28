import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import (
    User, Organization, BrandRule, ApprovedFact, TerminologyRule,
    BrandColorPalette, BrandAsset, ContentSubmission, ContentRevision,
    Finding, SubmissionComment, AuditEvent, ComplianceCertificate
)
from app.demo_data.seeder import seed_demo_workspace

def init():
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    print("Seeding NovaTech synthetic demo workspace...")
    db = SessionLocal()
    try:
        org = seed_demo_workspace(db)
        print(f"Workspace '{org.name}' successfully seeded!")
        print(f"Users: {[u.email for u in db.query(User).all()]}")
        print(f"Rules count: {db.query(BrandRule).count()}")
        print(f"Facts count: {db.query(ApprovedFact).count()}")
        print(f"Submissions count: {db.query(ContentSubmission).count()}")
    finally:
        db.close()

if __name__ == "__main__":
    init()
