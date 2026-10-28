import io
import csv
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.vault import BrandRule, ApprovedFact, TerminologyRule, BrandColorPalette, BrandAsset
from app.schemas.vault import (
    BrandRuleCreate, BrandRuleUpdate, BrandRuleResponse,
    ApprovedFactCreate, ApprovedFactResponse,
    TerminologyRuleCreate, TerminologyRuleResponse,
    BrandColorPaletteCreate, BrandColorPaletteResponse,
    BrandAssetResponse
)
from app.auth.dependencies import get_current_user, require_role
from app.vision.delta_e import hex_to_rgb, rgb_to_lab
from app.workflow.audit import log_audit_event

router = APIRouter(prefix="/vault", tags=["Brand Truth Vault"])

@router.get("/rules", response_model=List[BrandRuleResponse])
def get_rules(
    category: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(BrandRule).filter(BrandRule.organization_id == current_user.organization_id)
    if category:
        query = query.filter(BrandRule.category.ilike(f"%{category}%"))
    if search:
        query = query.filter(
            (BrandRule.title.ilike(f"%{search}%")) |
            (BrandRule.rule_id.ilike(f"%{search}%")) |
            (BrandRule.exact_rule_text.ilike(f"%{search}%"))
        )
    return query.order_by(BrandRule.rule_id).all()

@router.post("/rules", response_model=BrandRuleResponse)
def create_rule(
    payload: BrandRuleCreate,
    current_user: User = Depends(require_role(["Brand Admin"])),
    db: Session = Depends(get_db)
):
    rule = BrandRule(
        organization_id=current_user.organization_id,
        rule_id=payload.rule_id.strip(),
        title=payload.title.strip(),
        category=payload.category.strip(),
        exact_rule_text=payload.exact_rule_text.strip(),
        source_document=payload.source_document,
        source_page=payload.source_page,
        severity=payload.severity,
        effective_from=payload.effective_from,
        expires_at=payload.expires_at,
        status=payload.status,
        version=1,
        created_by=current_user.full_name
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)

    log_audit_event(
        db=db,
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        action_type="RULE_CREATED",
        rule_id=rule.rule_id,
        outcome="SUCCESS",
        details={"title": rule.title, "category": rule.category}
    )
    return rule

@router.put("/rules/{rule_id}", response_model=BrandRuleResponse)
def update_rule(
    rule_id: str,
    payload: BrandRuleUpdate,
    current_user: User = Depends(require_role(["Brand Admin"])),
    db: Session = Depends(get_db)
):
    rule = db.query(BrandRule).filter(
        BrandRule.rule_id == rule_id,
        BrandRule.organization_id == current_user.organization_id
    ).first()
    if not rule:
        raise HTTPException(status_code=404, detail=f"Rule {rule_id} not found.")

    if payload.title:
        rule.title = payload.title
    if payload.exact_rule_text:
        rule.exact_rule_text = payload.exact_rule_text
        rule.version += 1 # Retain versioning integrity
    if payload.severity:
        rule.severity = payload.severity
    if payload.status:
        rule.status = payload.status
    if payload.source_document:
        rule.source_document = payload.source_document
    if payload.source_page is not None:
        rule.source_page = payload.source_page

    rule.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(rule)
    return rule

@router.delete("/rules/{rule_id}")
def archive_rule(
    rule_id: str,
    current_user: User = Depends(require_role(["Brand Admin"])),
    db: Session = Depends(get_db)
):
    rule = db.query(BrandRule).filter(
        BrandRule.rule_id == rule_id,
        BrandRule.organization_id == current_user.organization_id
    ).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found.")

    rule.status = "Archived"
    db.commit()
    return {"message": f"Rule {rule_id} safely archived."}

# Approved Facts
@router.get("/facts", response_model=List[ApprovedFactResponse])
def get_facts(
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(ApprovedFact).filter(ApprovedFact.organization_id == current_user.organization_id)
    if category:
        query = query.filter(ApprovedFact.category.ilike(f"%{category}%"))
    return query.order_by(ApprovedFact.fact_id).all()

@router.post("/facts", response_model=ApprovedFactResponse)
def create_fact(
    payload: ApprovedFactCreate,
    current_user: User = Depends(require_role(["Brand Admin"])),
    db: Session = Depends(get_db)
):
    fact = ApprovedFact(
        organization_id=current_user.organization_id,
        fact_id=payload.fact_id.strip(),
        claim_subject=payload.claim_subject.strip(),
        approved_value=payload.approved_value.strip(),
        category=payload.category,
        exact_passage=payload.exact_passage.strip(),
        source_document=payload.source_document,
        source_page=payload.source_page,
        effective_from=payload.effective_from,
        expires_at=payload.expires_at,
        status=payload.status,
        version=1
    )
    db.add(fact)
    db.commit()
    db.refresh(fact)
    return fact

# Terminology
@router.get("/terms", response_model=List[TerminologyRuleResponse])
def get_terms(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(TerminologyRule).filter(
        TerminologyRule.organization_id == current_user.organization_id
    ).order_by(TerminologyRule.term_id).all()

@router.post("/terms", response_model=TerminologyRuleResponse)
def create_term(
    payload: TerminologyRuleCreate,
    current_user: User = Depends(require_role(["Brand Admin"])),
    db: Session = Depends(get_db)
):
    term = TerminologyRule(
        organization_id=current_user.organization_id,
        term_id=payload.term_id.strip(),
        banned_term=payload.banned_term.strip(),
        preferred_term=payload.preferred_term.strip() if payload.preferred_term else None,
        case_sensitive=payload.case_sensitive,
        match_whole_word=payload.match_whole_word,
        reason=payload.reason,
        severity=payload.severity,
        status=payload.status
    )
    db.add(term)
    db.commit()
    db.refresh(term)
    return term

# Palettes
@router.get("/palettes", response_model=List[BrandColorPaletteResponse])
def get_palettes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(BrandColorPalette).filter(
        BrandColorPalette.organization_id == current_user.organization_id
    ).all()

@router.post("/palettes", response_model=BrandColorPaletteResponse)
def create_palette(
    payload: BrandColorPaletteCreate,
    current_user: User = Depends(require_role(["Brand Admin"])),
    db: Session = Depends(get_db)
):
    rgb = (payload.rgb_r, payload.rgb_g, payload.rgb_b)
    lab = rgb_to_lab(*rgb)
    pal = BrandColorPalette(
        organization_id=current_user.organization_id,
        color_id=payload.color_id,
        name=payload.name,
        hex_code=payload.hex_code.upper(),
        rgb_r=payload.rgb_r,
        rgb_g=payload.rgb_g,
        rgb_b=payload.rgb_b,
        lab_l=lab[0],
        lab_a=lab[1],
        lab_b=lab[2],
        role=payload.role,
        tolerance_delta_e=payload.tolerance_delta_e,
        is_active=payload.is_active
    )
    db.add(pal)
    db.commit()
    db.refresh(pal)
    return pal

# Structured CSV Import
@router.post("/import-csv")
async def import_csv_data(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["Brand Admin"])),
    db: Session = Depends(get_db)
):
    import os
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in {'.csv', '.txt'}:
        raise HTTPException(status_code=400, detail="Only CSV files (.csv, .txt) are supported for structured vault imports.")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="CSV file exceeds maximum allowed size of 5 MB.")
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded CSV file is empty (0 bytes).")

    try:
        text = content.decode('utf-8')
    except Exception:
        text = content.decode('latin-1')

    reader = csv.DictReader(io.StringIO(text))
    imported_count = 0

    for row in reader:
        item_type = row.get("type", "").lower()
        if item_type == "rule":
            r = BrandRule(
                organization_id=current_user.organization_id,
                rule_id=row.get("id", f"R-{imported_count+1}"),
                title=row.get("title", "Imported Rule"),
                category=row.get("category", "General"),
                exact_rule_text=row.get("text", ""),
                severity=row.get("severity", "Violation"),
                status="Active",
                version=1,
                created_by=current_user.full_name
            )
            db.add(r)
            imported_count += 1
        elif item_type == "fact":
            f = ApprovedFact(
                organization_id=current_user.organization_id,
                fact_id=row.get("id", f"FACT-{imported_count+1}"),
                claim_subject=row.get("title", "Imported Fact"),
                approved_value=row.get("text", ""),
                category=row.get("category", "Pricing"),
                exact_passage=row.get("text", ""),
                status="Active",
                version=1
            )
            db.add(f)
            imported_count += 1
        elif item_type == "term":
            t = TerminologyRule(
                organization_id=current_user.organization_id,
                term_id=row.get("id", f"TERM-{imported_count+1}"),
                banned_term=row.get("title", ""),
                preferred_term=row.get("text", ""),
                reason=row.get("reason", "CSV Import"),
                severity=row.get("severity", "Violation"),
                status="Active"
            )
            db.add(t)
            imported_count += 1

    db.commit()
    return {"message": f"Successfully imported {imported_count} record(s) into Brand Truth Vault."}
