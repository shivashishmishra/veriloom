import pytest
from app.database import SessionLocal
from app.models.user import User
from app.models.submission import ContentSubmission, Finding
from app.workflow.approval_engine import ApprovalEngine
from app.workflow.audit import log_audit_event
from fastapi import HTTPException

def test_override_reason_mandatory():
    db = SessionLocal()
    try:
        user_rev = db.query(User).filter(User.role == "Reviewer").first()
        finding = db.query(Finding).first()
        assert user_rev is not None
        assert finding is not None

        # Attempt override with empty reason should fail
        with pytest.raises(HTTPException) as exc:
            ApprovalEngine.override_finding(db, finding, user_rev, "")
        assert exc.value.status_code == 400

        # Successful override with non-empty justification
        updated = ApprovalEngine.override_finding(db, finding, user_rev, "Approved exception per CMO legal memorandum.")
        assert updated.status == "Overridden"
        assert updated.override_reason == "Approved exception per CMO legal memorandum."
    finally:
        db.close()

def test_creator_cannot_approve_content():
    db = SessionLocal()
    try:
        creator = db.query(User).filter(User.role == "Creator").first()
        sub = db.query(ContentSubmission).first()
        
        # Creator cannot grant approval
        with pytest.raises(HTTPException) as exc:
            ApprovalEngine.transition_status(db, sub, "APPROVED", creator)
        assert exc.value.status_code == 403
    finally:
        db.close()
