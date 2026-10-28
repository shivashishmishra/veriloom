import re
import io
from typing import List, Dict, Any, Tuple
from PIL import Image
from app.vision.delta_e import hex_to_rgb, rgb_to_hex, rgb_to_lab, calculate_cie76_delta_e

class ColorExtractor:
    @staticmethod
    def extract_from_image_bytes(image_bytes: bytes, max_colors: int = 5) -> List[Tuple[int, int, int]]:
        """
        Extracts dominant RGB colors from image using PIL quantization.
        """
        try:
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            # Resize image to thumbnail for fast processing
            img = img.resize((150, 150))
            # Quantize image to palette of max_colors
            quantized = img.quantize(colors=max_colors)
            palette = quantized.getpalette() # [r0, g0, b0, r1, g1, b1, ...]
            color_counts = quantized.getcolors() # [(count, index), ...]
            
            # Sort by frequency descending
            sorted_colors = sorted(color_counts, key=lambda x: x[0], reverse=True)
            rgb_colors = []
            for count, idx in sorted_colors[:max_colors]:
                r = palette[idx * 3]
                g = palette[idx * 3 + 1]
                b = palette[idx * 3 + 2]
                rgb_colors.append((r, g, b))
            return rgb_colors
        except Exception as e:
            raise ValueError(f"Color extraction failed: {str(e)}")

    @staticmethod
    def extract_from_svg_bytes(svg_bytes: bytes) -> List[Tuple[int, int, int]]:
        """
        Extracts hex and rgb colors from SVG markup attributes.
        """
        svg_text = svg_bytes.decode('utf-8', errors='ignore')
        hex_matches = re.findall(r'#(?:[0-9a-fA-F]{3}){1,2}\b', svg_text)
        rgb_matches = re.findall(r'rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)', svg_text)

        colors_set = set()
        for h in hex_matches:
            try:
                colors_set.add(hex_to_rgb(h))
            except Exception:
                continue

        for r, g, b in rgb_matches:
            colors_set.add((int(r), int(g), int(b)))

        return list(colors_set)[:6]

    @classmethod
    def audit_visual_colors(
        cls,
        file_bytes: bytes,
        filename: str,
        approved_palettes: List[Any],
        tolerance_threshold: float = 10.0
    ) -> Dict[str, Any]:
        """
        Extracts dominant colors from uploaded asset, compares to approved brand palette,
        and computes CIE76 Delta E distances.
        """
        is_svg = filename.lower().endswith('.svg')
        if is_svg:
            extracted_rgb = cls.extract_from_svg_bytes(file_bytes)
        else:
            extracted_rgb = cls.extract_from_image_bytes(file_bytes)

        swatches = []
        violations_count = 0

        for rgb in extracted_rgb:
            hex_val = rgb_to_hex(*rgb)
            extracted_lab = rgb_to_lab(*rgb)

            nearest_palette = None
            min_delta_e = float('inf')

            for pal in approved_palettes:
                if not pal.is_active:
                    continue
                pal_lab = (pal.lab_l, pal.lab_a, pal.lab_b)
                if None in pal_lab:
                    pal_rgb = (pal.rgb_r, pal.rgb_g, pal.rgb_b)
                    pal_lab = rgb_to_lab(*pal_rgb)
                
                dist = calculate_cie76_delta_e(extracted_lab, pal_lab)
                if dist < min_delta_e:
                    min_delta_e = dist
                    nearest_palette = pal

            is_on_brand = min_delta_e <= tolerance_threshold
            if not is_on_brand:
                violations_count += 1

            swatches.append({
                "extracted_hex": hex_val,
                "extracted_rgb": list(rgb),
                "nearest_brand_color": nearest_palette.name if nearest_palette else "Unknown",
                "nearest_brand_hex": nearest_palette.hex_code if nearest_palette else "#000000",
                "delta_e": min_delta_e,
                "tolerance": tolerance_threshold,
                "is_on_brand": is_on_brand,
                "status": "PASS" if is_on_brand else "FLAGGED"
            })

        return {
            "filename": filename,
            "total_extracted_colors": len(swatches),
            "unapproved_colors_count": violations_count,
            "overall_status": "PASS" if violations_count == 0 else "FAIL",
            "swatches": swatches,
            "threshold_used": tolerance_threshold,
            "note": "Differences with Delta E > 10.0 indicate noticeable visual deviation from the approved brand palette."
        }
