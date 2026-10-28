import pytest
from app.parsers.delta_hasher import DeltaHasher

def test_delta_paragraph_comparison():
    old_paras = [
        "Welcome to NovaTech Cloud.",
        "Pricing starts at $79/mo.",
        "Contact sales for enterprise demos."
    ]
    old_hashes = DeltaHasher.hash_paragraphs(old_paras)

    # Revision 2 fixes only paragraph 2
    new_paras = [
        "Welcome to NovaTech Cloud.",
        "Pricing starts at $99/mo.",
        "Contact sales for enterprise demos."
    ]
    new_hashes = DeltaHasher.hash_paragraphs(new_paras)

    comparison = DeltaHasher.compare_revisions(old_paras, new_paras, old_hashes, new_hashes)
    
    # Paras 0 and 2 are unchanged
    unchanged_indices = [item["new_index"] for item in comparison["unchanged"]]
    assert 0 in unchanged_indices
    assert 2 in unchanged_indices
    
    # Para 1 was modified
    assert 1 in comparison["modified"]
