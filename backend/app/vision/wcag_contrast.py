import math
from typing import Tuple, Dict, Any, Optional

def calculate_relative_luminance(r: int, g: int, b: int) -> float:
    """
    Computes WCAG 2.2 relative luminance for sRGB colors.
    """
    def channel_luminance(val: int) -> float:
        s = val / 255.0
        if s <= 0.04045:
            return s / 12.92
        else:
            return math.pow((s + 0.055) / 1.055, 2.4)

    r_lum = channel_luminance(r)
    g_lum = channel_luminance(g)
    b_lum = channel_luminance(b)

    return 0.2126 * r_lum + 0.7152 * g_lum + 0.0722 * b_lum

def calculate_contrast_ratio(rgb1: Tuple[int, int, int], rgb2: Tuple[int, int, int]) -> float:
    """
    Computes WCAG 2.2 contrast ratio between two sRGB colors:
    CR = (L1 + 0.05) / (L2 + 0.05) where L1 is lighter, L2 is darker.
    Returns ratio rounded to 2 decimal places (e.g. 4.54).
    """
    lum1 = calculate_relative_luminance(*rgb1)
    lum2 = calculate_relative_luminance(*rgb2)

    l_max = max(lum1, lum2)
    l_min = min(lum1, lum2)

    ratio = (l_max + 0.05) / (l_min + 0.05)
    return round(ratio, 2)

class WCAGChecker:
    NORMAL_TEXT_MIN_RATIO = 4.5
    LARGE_TEXT_MIN_RATIO = 3.0

    @classmethod
    def evaluate_contrast(
        cls,
        fg_hex: str,
        bg_hex: str,
        is_large_text: bool = False
    ) -> Dict[str, Any]:
        from app.vision.delta_e import hex_to_rgb
        fg_rgb = hex_to_rgb(fg_hex)
        bg_rgb = hex_to_rgb(bg_hex)

        ratio = calculate_contrast_ratio(fg_rgb, bg_rgb)
        required_ratio = cls.LARGE_TEXT_MIN_RATIO if is_large_text else cls.NORMAL_TEXT_MIN_RATIO
        passes = ratio >= required_ratio

        return {
            "foreground_hex": fg_hex,
            "background_hex": bg_hex,
            "contrast_ratio": ratio,
            "required_ratio": required_ratio,
            "is_large_text": is_large_text,
            "passes": passes,
            "recommendation": (
                "Passes WCAG 2.2 contrast standard." if passes
                else f"Fails WCAG 2.2 AA standard. Measured ratio {ratio}:1 is below required {required_ratio}:1. Adjust text or background luminosity."
            )
        }

    @staticmethod
    def check_alt_text(alt_text: Optional[str], asset_name: str) -> Dict[str, Any]:
        """
        WCAG 2.2 Guideline 1.1.1 (Non-text Content):
        Images must have descriptive non-empty alternative text.
        """
        clean_alt = (alt_text or "").strip()
        if not clean_alt:
            return {
                "passes": False,
                "severity": "Violation",
                "explanation": f"WCAG 2.2 Criterion 1.1.1 Non-text Content: Missing alternative text for visual asset '{asset_name}'. Screen readers cannot interpret this image without descriptive alt text.",
                "rule_clause_id": "WCAG-1.1.1-ALT",
                "suggested_fix": f"Add descriptive alt text summarizing '{asset_name}'"
            }
        elif clean_alt.lower() in ["image", "picture", "logo", "photo", "graphic"]:
            return {
                "passes": False,
                "severity": "Warning",
                "explanation": f"WCAG 2.2 Criterion 1.1.1: Alt text '{clean_alt}' is generic and unhelpful. Provide specific contextual description.",
                "rule_clause_id": "WCAG-1.1.1-ALT-QUALITY",
                "suggested_fix": f"Provide meaningful description of '{asset_name}'"
            }
        return {
            "passes": True,
            "severity": "Info",
            "explanation": f"Descriptive alt text verified: '{clean_alt}'"
        }
