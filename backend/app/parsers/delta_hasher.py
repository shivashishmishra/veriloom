import hashlib
import json
import difflib
from typing import List, Dict, Any, Tuple

class DeltaHasher:
    @staticmethod
    def compute_sha256(content: str) -> str:
        return hashlib.sha256(content.encode('utf-8')).hexdigest()

    @staticmethod
    def hash_paragraphs(paragraphs: List[str]) -> Dict[str, str]:
        """
        Returns a dictionary mapping paragraph index string to its SHA-256 hash.
        """
        result = {}
        for idx, para in enumerate(paragraphs):
            normalized = " ".join(para.strip().split())
            result[str(idx)] = hashlib.sha256(normalized.encode('utf-8')).hexdigest()
        return result

    @classmethod
    def compare_revisions(
        cls,
        old_paras: List[str],
        new_paras: List[str],
        old_hashes: Dict[str, str],
        new_hashes: Dict[str, str]
    ) -> Dict[str, Any]:
        """
        Compares two revisions at the paragraph level using SHA-256 hashes and difflib.
        Identifies:
        - unchanged_indices: new paragraph indices that are identical to old paragraphs
        - modified_indices: new paragraph indices that were changed
        - inserted_indices: new paragraph indices that were newly added
        - deleted_indices: old paragraph indices that were removed
        """
        matcher = difflib.SequenceMatcher(None, old_paras, new_paras)
        unchanged = []
        modified = []
        inserted = []
        deleted = []

        diff_blocks = []

        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == 'equal':
                for new_idx in range(j1, j2):
                    old_idx = i1 + (new_idx - j1)
                    unchanged.append({"new_index": new_idx, "old_index": old_idx})
                    diff_blocks.append({
                        "type": "equal",
                        "old_index": old_idx,
                        "new_index": new_idx,
                        "text": new_paras[new_idx]
                    })
            elif tag == 'replace':
                for new_idx in range(j1, j2):
                    modified.append(new_idx)
                diff_blocks.append({
                    "type": "modified",
                    "old_text": "\n".join(old_paras[i1:i2]),
                    "new_text": "\n".join(new_paras[j1:j2]),
                    "old_indices": list(range(i1, i2)),
                    "new_indices": list(range(j1, j2))
                })
            elif tag == 'insert':
                for new_idx in range(j1, j2):
                    inserted.append(new_idx)
                diff_blocks.append({
                    "type": "insert",
                    "new_text": "\n".join(new_paras[j1:j2]),
                    "new_indices": list(range(j1, j2))
                })
            elif tag == 'delete':
                for old_idx in range(i1, i2):
                    deleted.append(old_idx)
                diff_blocks.append({
                    "type": "delete",
                    "old_text": "\n".join(old_paras[i1:i2]),
                    "old_indices": list(range(i1, i2))
                })

        return {
            "unchanged": unchanged,
            "modified": modified,
            "inserted": inserted,
            "deleted": deleted,
            "diff_blocks": diff_blocks
        }
