import pytest
from app.database import SessionLocal
from app.models.user import User
from app.models.submission import ContentSubmission
from app.models.certificate import ComplianceCertificate
from app.certificates.cert_generator import CertificateGenerator
from fastapi import HTTPException

def test_certificate_signature_verification():
    db = SessionLocal()
    try:
        cert = db.query(ComplianceCertificate).first()
        assert cert is not None

        # Verify signature validity
        is_valid, msg = CertificateGenerator.verify_certificate(cert)
        assert is_valid is True
        assert "verified" in msg.lower()

        # Test tamper detection
        original_sig = cert.digital_signature
        cert.digital_signature = "TAMPERED_INVALID_SIG"
        is_valid_tampered, _ = CertificateGenerator.verify_certificate(cert)
        # restore
        cert.digital_signature = original_sig
    finally:
        db.close()

def test_unapproved_submission_cannot_receive_certificate():
    db = SessionLocal()
    try:
        reviewer = db.query(User).filter(User.role == "Reviewer").first()
        sub = db.query(ContentSubmission).filter(ContentSubmission.current_status != "APPROVED").first()
        assert sub is not None

        with pytest.raises(HTTPException) as exc:
            CertificateGenerator.issue_certificate(db, sub, reviewer)
        assert exc.value.status_code == 400
    finally:
        db.close()
