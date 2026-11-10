from __future__ import annotations

from neko_ctf import app, create_app
from neko_ctf.bootstrap import bootstrap_defaults as _bootstrap_defaults
from neko_ctf.extensions import db
from neko_ctf.models import (
    Challenge,
    ChallengeCategory,
    ChallengeDifficulty,
    ChallengeFlag,
    HighlightCard,
    SiteAnnouncement,
    SiteEvent,
    SiteSetting,
    Submission,
    User,
)


def bootstrap_defaults(app_instance=None):
    """Compatibility wrapper that seeds data using the default app instance."""
    return _bootstrap_defaults(app_instance or app)


__all__ = [
    "app",
    "create_app",
    "bootstrap_defaults",
    "db",
    "Challenge",
    "ChallengeCategory",
    "ChallengeDifficulty",
    "ChallengeFlag",
    "HighlightCard",
    "SiteAnnouncement",
    "SiteEvent",
    "SiteSetting",
    "Submission",
    "User",
]
