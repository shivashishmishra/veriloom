import pytest
from app.vision.delta_e import hex_to_rgb, rgb_to_lab, calculate_cie76_delta_e
from app.vision.wcag_contrast import calculate_relative_luminance, calculate_contrast_ratio, WCAGChecker

def test_relative_luminance():
    # Pure white (255,255,255) luminance is 1.0
    lum_white = calculate_relative_luminance(255, 255, 255)
    assert abs(lum_white - 1.0) < 0.001

    # Pure black (0,0,0) luminance is 0.0
    lum_black = calculate_relative_luminance(0, 0, 0)
    assert abs(lum_black - 0.0) < 0.001

def test_contrast_ratio_wcag():
    # Black on White is 21:1
    cr_bw = calculate_contrast_ratio((0, 0, 0), (255, 255, 255))
    assert cr_bw == 21.0

    # White on White is 1:1
    cr_ww = calculate_contrast_ratio((255, 255, 255), (255, 255, 255))
    assert cr_ww == 1.0

    # Low contrast pair: light gray #CCCCCC (204, 204, 204) on white #FFFFFF
    cr_gray = calculate_contrast_ratio((204, 204, 204), (255, 255, 255))
    assert cr_gray < 4.5
    eval_res = WCAGChecker.evaluate_contrast("#CCCCCC", "#FFFFFF", is_large_text=False)
    assert eval_res["passes"] is False

def test_delta_e_color_distance():
    # Exact match Delta E is 0
    lab1 = rgb_to_lab(29, 61, 212)
    dist = calculate_cie76_delta_e(lab1, lab1)
    assert dist == 0.0

    # Very distinct colors: Blue vs Red
    lab_blue = rgb_to_lab(0, 0, 255)
    lab_red = rgb_to_lab(255, 0, 0)
    dist_high = calculate_cie76_delta_e(lab_blue, lab_red)
    assert dist_high > 10.0 # Well beyond the 10.0 threshold

def test_alt_text_verification():
    # Missing alt text
    res_empty = WCAGChecker.check_alt_text("", "Architecture Diagram")
    assert res_empty["passes"] is False

    # Descriptive alt text
    res_good = WCAGChecker.check_alt_text("Detailed network architecture diagram showing encrypted TLS clusters", "Architecture Diagram")
    assert res_good["passes"] is True
