import pytest
import io
from fastapi import UploadFile
from app.parsers.document_parser import DocumentParser
from app.vision.color_extractor import ColorExtractor
from app.vision.delta_e import hex_to_rgb, rgb_to_hex, calculate_cie76_delta_e
from app.vision.wcag_contrast import WCAGChecker

def test_document_parser_markdown():
    md = "# Heading\n\nThis is a test paragraph with ![A descriptive logo](https://example.com/logo.png) and #1E3A8A color."
    paras = DocumentParser.parse_markdown(md)
    assert len(paras) == 2
    assert paras[1].metadata["images"][0]["alt"] == "A descriptive logo"
    assert "#1E3A8A" in paras[1].metadata["hex_colors"]

def test_document_parser_html():
    html = b"<html><body><p>Welcome to NovaTech</p><img src='pic.jpg' alt='NovaTech Header Banner'/><p>Second paragraph</p></body></html>"
    paras = DocumentParser.parse_document("test.html", html)
    assert len(paras) >= 2
    assert "NovaTech" in paras[0].text

def test_document_parser_text():
    raw = b"First section here.\n\nSecond section here with extra details."
    paras = DocumentParser.parse_document("notes.txt", raw)
    assert len(paras) == 2
    assert paras[0].text == "First section here."
    assert paras[1].text == "Second section here with extra details."

def test_wcag_contrast_standards():
    # White on navy: high contrast, passes AA & AAA
    white_on_navy = WCAGChecker.evaluate_contrast("#FFFFFF", "#1E3A8A", is_large_text=False)
    assert white_on_navy["passes"] is True
    assert white_on_navy["contrast_ratio"] >= 4.5

    # Light gray on white: fails AA normal text (ratio < 4.5)
    light_gray_on_white = WCAGChecker.evaluate_contrast("#AAAAAA", "#FFFFFF", is_large_text=False)
    assert light_gray_on_white["passes"] is False
    assert light_gray_on_white["contrast_ratio"] < 4.5

def test_svg_color_extraction():
    svg_data = b'<svg xmlns="http://www.w3.org/2000/svg"><rect fill="#1E3A8A"/><circle fill="#0D9488"/></svg>'
    colors = ColorExtractor.extract_from_svg_bytes(svg_data)
    assert len(colors) >= 2
    extracted_hexes = [rgb_to_hex(*c) for c in colors]
    assert "#1E3A8A" in extracted_hexes or "#1e3a8a" in extracted_hexes
