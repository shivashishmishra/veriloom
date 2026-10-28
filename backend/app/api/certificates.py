import json
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.submission import ContentSubmission
from app.models.certificate import ComplianceCertificate
from app.schemas.certificate import CertificateResponse, VerifyCertificateResponse
from app.auth.dependencies import get_current_user
from app.certificates.cert_generator import CertificateGenerator

router = APIRouter(prefix="/certificates", tags=["Compliance Certificates"])

@router.post("/issue/{submission_id}", response_model=CertificateResponse)
def issue_compliance_certificate(
    submission_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = db.query(ContentSubmission).filter(
        ContentSubmission.id == submission_id,
        ContentSubmission.organization_id == current_user.organization_id
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found.")

    cert = CertificateGenerator.issue_certificate(db, sub, current_user)
    
    return {
        "id": cert.id,
        "certificate_code": cert.certificate_code,
        "submission_id": cert.submission_id,
        "revision_id": cert.revision_id,
        "content_title": cert.content_title,
        "source_file_sha256": cert.source_file_sha256,
        "vault_version": cert.vault_version,
        "approver_id": cert.approver_id,
        "approver_name": cert.approver_name,
        "approver_role": cert.approver_role,
        "approval_timestamp": cert.approval_timestamp,
        "issued_at": cert.issued_at,
        "findings_summary": json.loads(cert.findings_summary),
        "signature_algorithm": cert.signature_algorithm,
        "digital_signature": cert.digital_signature,
        "verification_hash": cert.verification_hash,
        "is_verified": cert.is_verified
    }

@router.get("/{submission_id}", response_model=CertificateResponse)
def get_certificate(
    submission_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cert = db.query(ComplianceCertificate).filter(
        ComplianceCertificate.submission_id == submission_id
    ).first()
    if not cert:
        raise HTTPException(status_code=404, detail="No compliance certificate found for this submission.")

    return {
        "id": cert.id,
        "certificate_code": cert.certificate_code,
        "submission_id": cert.submission_id,
        "revision_id": cert.revision_id,
        "content_title": cert.content_title,
        "source_file_sha256": cert.source_file_sha256,
        "vault_version": cert.vault_version,
        "approver_id": cert.approver_id,
        "approver_name": cert.approver_name,
        "approver_role": cert.approver_role,
        "approval_timestamp": cert.approval_timestamp,
        "issued_at": cert.issued_at,
        "findings_summary": json.loads(cert.findings_summary),
        "signature_algorithm": cert.signature_algorithm,
        "digital_signature": cert.digital_signature,
        "verification_hash": cert.verification_hash,
        "is_verified": cert.is_verified
    }

@router.get("/{submission_id}/pdf")
def download_pdf_certificate(
    submission_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cert = db.query(ComplianceCertificate).filter(
        ComplianceCertificate.submission_id == submission_id
    ).first()
    if not cert:
        raise HTTPException(status_code=404, detail="No compliance certificate found for this submission.")

    pdf_bytes = CertificateGenerator.generate_pdf_report(cert)
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=VeriLoom_Certificate_{cert.certificate_code}.pdf"
        }
    )

@router.post("/verify", response_model=VerifyCertificateResponse)
def verify_certificate_authenticity(
    certificate_code: str,
    db: Session = Depends(get_db)
):
    cert = db.query(ComplianceCertificate).filter(
        ComplianceCertificate.certificate_code == certificate_code.strip()
    ).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate code not found in registry.")

    is_valid, msg = CertificateGenerator.verify_certificate(cert)
    return {
        "is_valid": is_valid,
        "certificate_code": cert.certificate_code,
        "content_title": cert.content_title,
        "approver_name": cert.approver_name,
        "issued_at": cert.issued_at,
        "source_file_sha256": cert.source_file_sha256,
        "verification_message": msg
    }
