from __future__ import annotations

from typing import Callable, Dict, Iterable

from sqlalchemy import func

from ..extensions import db
from ..models import Challenge, Submission, User

HIGHLIGHT_VALUE_FACTORIES: Dict[str, Callable[[], int]] = {
    "visible_challenges": lambda: Challenge.query.filter_by(is_visible=True).count(),
    "total_players": lambda: User.query.count(),
    "total_submissions": lambda: Submission.query.count(),
    "total_solves": lambda: (
        db.session.query(Submission.user_id, Submission.challenge_id)
        .filter(Submission.is_correct.is_(True))
        .distinct()
        .count()
    ),
}

HIGHLIGHT_METRIC_CHOICES: Iterable[tuple[str, str]] = [
    ("visible_challenges", "公开赛题"),
    ("total_players", "注册选手"),
    ("total_submissions", "累计提交"),
    ("total_solves", "成功解题"),
]

HIGHLIGHT_ALLOWED_KEYS = {choice[0] for choice in HIGHLIGHT_METRIC_CHOICES}


def compute_highlight_value(metric_key: str) -> int:
    func_resolver = HIGHLIGHT_VALUE_FACTORIES.get(metric_key)
    if func_resolver is None:
        return 0
    try:
        return int(func_resolver() or 0)
    except Exception:  # pragma: no cover - defensive logging suppressed
        return 0


__all__ = [
    "HIGHLIGHT_ALLOWED_KEYS",
    "HIGHLIGHT_METRIC_CHOICES",
    "HIGHLIGHT_VALUE_FACTORIES",
    "compute_highlight_value",
]
