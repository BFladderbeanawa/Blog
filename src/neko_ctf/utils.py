from __future__ import annotations

import re
from typing import Optional

from flask import current_app

from .cache_config import HOME_CACHE_KEY, LEADERBOARD_CACHE_KEY
from .extensions import cache


def invalidate_public_cache(*additional_keys: str) -> None:
    cache_keys = {HOME_CACHE_KEY, LEADERBOARD_CACHE_KEY}
    cache_keys.update(additional_keys)
    for key in cache_keys:
        cache.delete(key)


def parse_int_field(raw_value: Optional[str], default: int = 0) -> int:
    try:
        if raw_value is None or raw_value == "":
            return default
        return int(raw_value)
    except (TypeError, ValueError):
        return default


def parse_checkbox(value: Optional[str]) -> bool:
    return value is not None and value.lower() in {"on", "true", "1", "yes"}


def normalize_flag_slug(raw_value: Optional[str], fallback: str) -> str:
    base = (raw_value or "").strip().lower()
    if not base:
        base = fallback
    cleaned = re.sub(r"[^a-z0-9-_]", "-", base)
    cleaned = re.sub(r"-+", "-", cleaned).strip("-")
    return cleaned or fallback


def refresh_challenge_points(challenge) -> None:
    flags = getattr(challenge, "flags", None)
    if flags:
        challenge.points = sum(flag.points for flag in flags)


__all__ = [
    "invalidate_public_cache",
    "normalize_flag_slug",
    "parse_checkbox",
    "parse_int_field",
    "refresh_challenge_points",
]
