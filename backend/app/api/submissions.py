import json
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.submission import ContentSubmission, ContentRevision, Finding, SubmissionComment
from app.schemas.submission import (
    ContentSubmissionCreate, ContentSubmissionResponse,
    ContentRevisionResponse, SubmissionCommentCreate, SubmissionCommentResponse
)
from app.auth.dependencies import get_current_user
from app.parsers.document_parser import DocumentParser
from app.parsers.delta_hasher import DeltaHasher
from app.workflow.audit import log_audit_event

router = APIRouter(prefix="/submissions", tags=["Content Submissions"])

@router.get("", response_model=List[ContentSubmissionResponse])
def list_submissions(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(ContentSubmission).filter(
        ContentSubmission.organization_id == current_user.organization_id
    )
    if status_filter:
        query = query.filter(ContentSubmission.current_status == status_filter)
    
    subs = query.order_by(ContentSubmission.updated_at.desc()).all()
    # Enrich creator & reviewer names
    res = []
    for s in subs:
        resp = ContentSubmissionResponse.from_orm(s)
        resp.creator_name = s.creator.full_name if s.creator else None
        resp.assigned_reviewer_name = s.assigned_reviewer.full_name if s.assigned_reviewer else None
        res.append(resp)
    return res

@router.post("", response_model=ContentSubmissionResponse)
def create_submission(
    payload: ContentSubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    clean_text = payload.initial_content.strip()
    if not clean_text:
        raise HTTPException(status_code=400, detail="Initial content cannot be blank.")

    sub = ContentSubmission(
        organization_id=current_user.organization_id,
        creator_id=current_user.id,
        title=payload.title.strip(),
        content_type=payload.content_type,
        current_status="DRAFT"
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)

    # Initial Revision 1
    sha256 = DeltaHasher.compute_sha256(clean_text)
    paras = [p.strip() for p in clean_text.split("\n\n") if p.strip()]
    hashes = DeltaHasher.hash_paragraphs(paras)

    rev = ContentRevision(
        submission_id=sub.id,
        revision_number=1,
        raw_content=clean_text,
        file_sha256=sha256,
        paragraph_hashes=json.dumps(hashes),
        created_by_id=current_user.id
    )
    db.add(rev)
    db.commit()
    db.refresh(sub)

    log_audit_event(
        db=db,
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        action_type="SUBMISSION_CREATED",
        submission_id=sub.id,
        revision_id=rev.id,
        outcome="DRAFT_CREATED",
        details={"title": sub.title}
    )

    resp = ContentSubmissionResponse.from_orm(sub)
    resp.creator_name = current_user.full_name
    return resp

@router.get("/{submission_id}", response_model=ContentSubmissionResponse)
def get_submission_by_id(
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

    resp = ContentSubmissionResponse.from_orm(sub)
    resp.creator_name = sub.creator.full_name if sub.creator else None
    resp.assigned_reviewer_name = sub.assigned_reviewer.full_name if sub.assigned_reviewer else None
    return resp

@router.post("/{submission_id}/upload-document", response_model=ContentSubmissionResponse)
async def upload_document(
    submission_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = db.query(ContentSubmission).filter(
        ContentSubmission.id == submission_id,
        ContentSubmission.organization_id == current_user.organization_id
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found.")

    content_bytes = await file.read()
    try:
        parsed_paras = DocumentParser.parse_document(file.filename, content_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Document parsing failed: {str(e)}")

    extracted_text = "\n\n".join(p.text for p in parsed_paras)
    next_rev_num = len(sub.revisions) + 1

    sha256 = DeltaHasher.compute_sha256(extracted_text)
    hashes = DeltaHasher.hash_paragraphs([p.text for p in parsed_paras])

    rev = ContentRevision(
        submission_id=sub.id,
        revision_number=next_rev_num,
        raw_content=extracted_text,
        file_sha256=sha256,
        paragraph_hashes=json.dumps(hashes),
        created_by_id=current_user.id
    )
    db.add(rev)
    sub.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(sub)

    log_audit_event(
        db=db,
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        action_type="DOCUMENT_UPLOADED",
        submission_id=sub.id,
        revision_id=rev.id,
        details={"filename": file.filename, "paragraphs": len(parsed_paras)}
    )

    resp = ContentSubmissionResponse.from_orm(sub)
    resp.creator_name = sub.creator.full_name if sub.creator else None
    return resp

@router.post("/{submission_id}/revisions", response_model=ContentSubmissionResponse)
def save_revision(
    submission_id: int,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = db.query(ContentSubmission).filter(
        ContentSubmission.id == submission_id,
        ContentSubmission.organization_id == current_user.organization_id
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found.")

    raw_content = payload.get("raw_content", "").strip()
    if not raw_content:
        raise HTTPException(status_code=400, detail="Revision content cannot be blank.")

    next_rev_num = len(sub.revisions) + 1
    sha256 = DeltaHasher.compute_sha256(raw_content)
    paras = [p.strip() for p in raw_content.split("\n\n") if p.strip()]
    hashes = DeltaHasher.hash_paragraphs(paras)

    rev = ContentRevision(
        submission_id=sub.id,
        revision_number=next_rev_num,
        raw_content=raw_content,
        file_sha256=sha256,
        paragraph_hashes=json.dumps(hashes),
        created_by_id=current_user.id
    )
    db.add(rev)
    sub.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(sub)

    resp = ContentSubmissionResponse.from_orm(sub)
    resp.creator_name = sub.creator.full_name if sub.creator else None
    return resp

@router.post("/{submission_id}/comments", response_model=SubmissionCommentResponse)
def add_comment(
    submission_id: int,
    payload: SubmissionCommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = db.query(ContentSubmission).filter(
        ContentSubmission.id == submission_id,
        ContentSubmission.organization_id == current_user.organization_id
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found.")

    comment = SubmissionComment(
        submission_id=sub.id,
        revision_id=payload.revision_id,
        finding_id=payload.finding_id,
        author_id=current_user.id,
        comment_text=payload.comment_text.strip()
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    resp = SubmissionCommentResponse.from_orm(comment)
    resp.author_name = current_user.full_name
    return resp
