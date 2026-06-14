from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash

from .extensions import db
from .markdown import render_markdown


class User(db.Model, UserMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    bonus_points = db.Column(db.Integer, default=0, nullable=False)
    email_verified = db.Column(db.Boolean, default=False, nullable=False)
    verification_token = db.Column(db.String(255), nullable=True)

    submissions = db.relationship("Submission", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, raw_password: str) -> None:
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password: str) -> bool:
        return check_password_hash(self.password_hash, raw_password)

    def total_score(self) -> int:
        correct_points = sum((submission.awarded_points or 0) for submission in self.submissions if submission.is_correct)
        return correct_points + (self.bonus_points or 0)

    def generate_verification_token(self) -> str:
        import secrets
        self.verification_token = secrets.token_urlsafe(32)
        return self.verification_token

    def verify_email(self) -> None:
        self.email_verified = True
        self.verification_token = None


class Challenge(db.Model):
    __tablename__ = "challenges"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(80), nullable=False)
    difficulty = db.Column(db.String(40), nullable=False)
    summary = db.Column(db.Text, nullable=False, default="")
    description = db.Column(db.Text, nullable=False)
    is_visible = db.Column(db.Boolean, default=True, nullable=False)
    points = db.Column(db.Integer, default=100, nullable=False)
    flag_hash = db.Column(db.String(255), nullable=True)  # Legacy field, now using ChallengeFlag table

    submissions = db.relationship("Submission", back_populates="challenge", cascade="all, delete-orphan")
    hints = db.relationship(
        "ChallengeHint",
        back_populates="challenge",
        cascade="all, delete-orphan",
        order_by="ChallengeHint.order",
    )
    flags = db.relationship(
        "ChallengeFlag",
        back_populates="challenge",
        cascade="all, delete-orphan",
        order_by="ChallengeFlag.display_order",
    )

    def set_flag(self, flag: str) -> None:
        self.flag_hash = generate_password_hash(flag.strip())

    def match_flag(self, flag: str) -> Optional["ChallengeFlag"]:
        if not flag:
            return None
        stripped = flag.strip()

        for stage in self.flags:
            if stage.check_flag(stripped):
                return stage

        return None

    def verify_flag(self, flag: str) -> bool:
        matched = self.match_flag(flag)
        if matched is not None:
            return True

        if self.flag_hash and flag:
            return check_password_hash(self.flag_hash, flag.strip())

        return False

    def summary_html(self) -> str:
        return render_markdown(self.summary)

    def description_html(self) -> str:
        return render_markdown(self.description)


class ChallengeFlag(db.Model):
    __tablename__ = "challenge_flags"

    id = db.Column(db.Integer, primary_key=True)
    challenge_id = db.Column(db.Integer, db.ForeignKey("challenges.id"), nullable=False)
    slug = db.Column(db.String(64), nullable=False)
    label = db.Column(db.String(120), nullable=False)
    points = db.Column(db.Integer, nullable=False, default=100)
    display_order = db.Column(db.Integer, nullable=False, default=1)
    flag_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    challenge = db.relationship("Challenge", back_populates="flags")

    __table_args__ = (
        db.UniqueConstraint("challenge_id", "slug", name="uq_challenge_flag_slug"),
    )

    def set_flag(self, raw_flag: str) -> None:
        self.flag_hash = generate_password_hash(raw_flag.strip())

    def check_flag(self, raw_flag: str) -> bool:
        if not raw_flag:
            return False
        return check_password_hash(self.flag_hash, raw_flag.strip())


class Submission(db.Model):
    __tablename__ = "submissions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    challenge_id = db.Column(db.Integer, db.ForeignKey("challenges.id"), nullable=False)
    flag_submitted = db.Column(db.Text, nullable=False)
    is_correct = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    challenge_flag_id = db.Column(db.Integer, db.ForeignKey("challenge_flags.id"), nullable=True)
    awarded_points = db.Column(db.Integer, nullable=True)

    user = db.relationship("User", back_populates="submissions")
    challenge = db.relationship("Challenge", back_populates="submissions")
    challenge_flag = db.relationship("ChallengeFlag")


class ChallengeHint(db.Model):
    __tablename__ = "challenge_hints"

    id = db.Column(db.Integer, primary_key=True)
    challenge_id = db.Column(db.Integer, db.ForeignKey("challenges.id"), nullable=False)
    title = db.Column(db.String(120), nullable=True)
    content = db.Column(db.Text, nullable=False)
    order = db.Column(db.Integer, nullable=False, default=1)

    challenge = db.relationship("Challenge", back_populates="hints")

    def content_html(self) -> str:
        return render_markdown(self.content)


class ChallengeCategory(db.Model):
    __tablename__ = "challenge_categories"

    id = db.Column(db.Integer, primary_key=True)
    value = db.Column(db.String(80), unique=True, nullable=False)
    label = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    display_order = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)


class ChallengeDifficulty(db.Model):
    __tablename__ = "challenge_difficulties"

    id = db.Column(db.Integer, primary_key=True)
    value = db.Column(db.String(80), unique=True, nullable=False)
    label = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    display_order = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)


class SiteSetting(db.Model):
    __tablename__ = "site_settings"

    key = db.Column(db.String(128), primary_key=True)
    value = db.Column(db.Text, nullable=False)
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    @staticmethod
    def get_value(key: str, default: Optional[str] = None) -> Optional[str]:
        entry = db.session.get(SiteSetting, key)
        return entry.value if entry else default

    @staticmethod
    def set_value(key: str, value: str) -> None:
        entry = db.session.get(SiteSetting, key)
        if entry:
            entry.value = value
        else:
            entry = SiteSetting(key=key, value=value)
            db.session.add(entry)


class SiteAnnouncement(db.Model):
    __tablename__ = "site_announcements"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(80), nullable=False)
    description = db.Column(db.Text, nullable=False)
    display_date = db.Column(db.String(40), nullable=False)
    display_order = db.Column(db.Integer, default=0, nullable=False)
    is_visible = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class HighlightCard(db.Model):
    __tablename__ = "highlight_cards"

    id = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.String(120), nullable=False)
    metric_key = db.Column(db.String(80), nullable=False)
    note = db.Column(db.String(160), nullable=False)
    display_order = db.Column(db.Integer, default=0, nullable=False)
    is_visible = db.Column(db.Boolean, default=True, nullable=False)


class SiteEvent(db.Model):
    __tablename__ = "site_event"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    date_range = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    cta_label = db.Column(db.String(120), nullable=False)
    cta_link = db.Column(db.String(255), nullable=False)
    cta_note = db.Column(db.String(255), nullable=True)
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


__all__ = [
    "Challenge",
    "ChallengeCategory",
    "ChallengeDifficulty",
    "ChallengeFlag",
    "ChallengeHint",
    "HighlightCard",
    "SiteAnnouncement",
    "SiteEvent",
    "SiteSetting",
    "Submission",
    "User",
]
