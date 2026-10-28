from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.vault import BrandColorPalette
from app.auth.dependencies import get_current_user
from app.vision.color_extractor import ColorExtractor
from app.vision.wcag_contrast import WCAGChecker

router = APIRouter(prefix="/visual", tags=["Visual Brand Auditor"])

ALLOWED_VISUAL_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.svg', '.webp'}
MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

@router.post("/audit")
async def audit_visual_asset(
    file: Optional[UploadFile] = File(None),
    foreground_hex: Optional[str] = Form(None),
    background_hex: Optional[str] = Form(None),
    is_large_text: bool = Form(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    palettes = db.query(BrandColorPalette).filter(
        BrandColorPalette.organization_id == current_user.organization_id
    ).all()

    result = {}

    # 1. Image / SVG Color Extraction & CIE76 Delta E Comparison
    if file:
        import os
        ext = os.path.splitext(file.filename or "")[1].lower()
        if ext not in ALLOWED_VISUAL_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported visual asset extension '{ext}'. Allowed: {', '.join(sorted(ALLOWED_VISUAL_EXTENSIONS))}"
            )

        file_bytes = await file.read()
        if len(file_bytes) > MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"Image exceeds maximum allowed size of 10 MB."
            )
        if len(file_bytes) == 0:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image file is empty (0 bytes)."
            )

        try:
            audit_data = ColorExtractor.audit_visual_colors(
                file_bytes=file_bytes,
                filename=file.filename,
                approved_palettes=palettes,
                tolerance_threshold=10.0
            )
            result["asset_audit"] = audit_data
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Visual asset processing error: {str(e)}")

    # 2. Direct WCAG Contrast Evaluation
    if foreground_hex and background_hex:
        try:
            contrast_data = WCAGChecker.evaluate_contrast(
                fg_hex=foreground_hex,
                bg_hex=background_hex,
                is_large_text=is_large_text
            )
            result["wcag_contrast"] = contrast_data
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"WCAG contrast calculation error: {str(e)}")

    if not file and not (foreground_hex and background_hex):
        raise HTTPException(status_code=400, detail="Provide an image file or foreground/background hex codes to audit.")

    return result
