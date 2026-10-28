import math
from typing import Tuple

def hex_to_rgb(hex_code: str) -> Tuple[int, int, int]:
    clean_hex = hex_code.strip().lstrip('#')
    if len(clean_hex) == 3:
        clean_hex = "".join(c * 2 for c in clean_hex)
    if len(clean_hex) != 6:
        raise ValueError(f"Invalid hex color code: {hex_code}")
    return tuple(int(clean_hex[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_hex(r: int, g: int, b: int) -> str:
    return f"#{r:02X}{g:02X}{b:02X}"

def rgb_to_lab(r: int, g: int, b: int) -> Tuple[float, float, float]:
    """
    Converts sRGB (0-255) to CIE L*a*b* using standard D65 illuminant.
    """
    # 1. Linearize sRGB
    def linearize(val: float) -> float:
        v = val / 255.0
        if v <= 0.04045:
            return v / 12.92
        else:
            return math.pow((v + 0.055) / 1.055, 2.4)

    r_lin = linearize(r)
    g_lin = linearize(g)
    b_lin = linearize(b)

    # 2. Convert to CIE XYZ (D65)
    x = r_lin * 0.4124564 + g_lin * 0.3575761 + b_lin * 0.1804375
    y = r_lin * 0.2126729 + g_lin * 0.7151522 + b_lin * 0.0721750
    z = r_lin * 0.0193339 + g_lin * 0.1191920 + b_lin * 0.9503041

    # Reference white point D65
    xn, yn, zn = 0.95047, 1.00000, 1.08883
    xr = x / xn
    yr = y / yn
    zr = z / zn

    def f(t: float) -> float:
        if t > 0.008856:
            return math.pow(t, 1.0 / 3.0)
        else:
            return (7.787 * t) + (16.0 / 116.0)

    fx = f(xr)
    fy = f(yr)
    fz = f(zr)

    l_star = (116.0 * fy) - 16.0
    a_star = 500.0 * (fx - fy)
    b_star = 200.0 * (fy - fz)

    return (round(l_star, 3), round(a_star, 3), round(b_star, 3))

def calculate_cie76_delta_e(lab1: Tuple[float, float, float], lab2: Tuple[float, float, float]) -> float:
    """
    Computes CIE76 Delta E color difference:
    Delta E = sqrt((L1 - L2)^2 + (a1 - a2)^2 + (b1 - b2)^2)
    """
    dl = lab1[0] - lab2[0]
    da = lab1[1] - lab2[1]
    db = lab1[2] - lab2[2]
    dist = math.sqrt(dl * dl + da * da + db * db)
    return round(dist, 2)
