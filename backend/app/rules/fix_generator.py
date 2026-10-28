from typing import Tuple

class FixGenerator:
    @staticmethod
    def apply_span_fix(
        full_content: str,
        span_start: int,
        span_end: int,
        replacement_text: str
    ) -> Tuple[str, bool]:
        """
        Applies a precise, intent-preserving replacement to a flagged text span.
        Guarantees that surrounding content and unaffected paragraphs are preserved intact.
        Returns: (new_content, success)
        """
        if span_start < 0 or span_end > len(full_content) or span_start > span_end:
            return full_content, False

        new_content = full_content[:span_start] + replacement_text + full_content[span_end:]
        return new_content, True
