from __future__ import annotations

import logging

from flask import current_app
from sqlalchemy import inspect

from seed_data import (
    DEFAULT_ANNOUNCEMENTS,
    DEFAULT_CATEGORIES,
    DEFAULT_CHALLENGES,
    DEFAULT_DIFFICULTIES,
    DEFAULT_EVENT_OVERVIEW,
    DEFAULT_HIGHLIGHT_CARDS,
    DEFAULT_SITE_SETTINGS,
)

from .extensions import cache, db
from .models import (
    Challenge,
    ChallengeCategory,
    ChallengeDifficulty,
    ChallengeFlag,
    HighlightCard,
    SiteAnnouncement,
    SiteEvent,
    SiteSetting,
    User,
)
from .utils import refresh_challenge_points

logger = logging.getLogger(__name__)


def bootstrap_defaults(app=None) -> None:
    app = app or current_app._get_current_object()
    if app is None:
        raise RuntimeError("Application context is required to bootstrap defaults.")

    with app.app_context():
        inspector = inspect(db.engine)
        table_names = set(inspector.get_table_names())
        needs_reset = False

        if "challenges" in table_names:
            challenge_columns = {col["name"] for col in inspector.get_columns("challenges")}
            if {"points", "flag_hash", "summary"} - challenge_columns:
                needs_reset = True

        if "users" in table_names:
            user_columns = {col["name"] for col in inspector.get_columns("users")}
            if "bonus_points" not in user_columns or "email_verified" not in user_columns:
                needs_reset = True

        if needs_reset:
            logger.info("Detected outdated schema, rebuilding database tables.")
            db.drop_all()

        db.create_all()

        admin_username = app.config.get("ADMIN_USERNAME")
        admin_email = app.config.get("ADMIN_EMAIL")
        admin_password = app.config.get("ADMIN_PASSWORD")

        admin_user = User.query.filter_by(username=admin_username).first()
        if admin_user is None:
            admin_user = User(
                username=admin_username,
                email=admin_email,
                is_admin=True,
            )
            admin_user.set_password(admin_password)
            db.session.add(admin_user)
            logger.info("Created default admin user '%s'", admin_username)

        if ChallengeCategory.query.count() == 0:
            for data in DEFAULT_CATEGORIES:
                category = ChallengeCategory(
                    value=data["value"],
                    label=data["label"],
                    description=data.get("description"),
                    display_order=data.get("display_order", 0),
                    is_active=True,
                )
                db.session.add(category)
            logger.info("Seeded default challenge categories")

        if ChallengeDifficulty.query.count() == 0:
            for data in DEFAULT_DIFFICULTIES:
                difficulty = ChallengeDifficulty(
                    value=data["value"],
                    label=data["label"],
                    description=data.get("description"),
                    display_order=data.get("display_order", 0),
                    is_active=True,
                )
                db.session.add(difficulty)
            logger.info("Seeded default challenge difficulties")

        if Challenge.query.count() == 0:
            for data in DEFAULT_CHALLENGES:
                stage_definitions = list(data.get("flags") or [])

                if stage_definitions:
                    primary_flag_value = stage_definitions[0].get("flag") or data.get("flag")
                else:
                    primary_flag_value = data.get("flag")

                challenge = Challenge(
                    title=data["title"],
                    category=data["category"],
                    difficulty=data["difficulty"],
                    summary=data["summary"],
                    description=data["content"],
                    points=data["points"],
                    is_visible=data.get("is_visible", True),
                )
                challenge.set_flag(primary_flag_value or "NekoCTF{seed_placeholder_flag}")
                db.session.add(challenge)
                db.session.flush()

                if not stage_definitions:
                    default_stage_flag = primary_flag_value or data.get("flag")
                    if default_stage_flag:
                        stage_definitions.append(
                            {
                                "slug": "stage-1",
                                "label": data.get("flag_label") or "Primary Flag",
                                "points": data.get("points", 0),
                                "flag": default_stage_flag,
                                "display_order": 1,
                            }
                        )

                total_stage_points = 0
                for idx, stage_data in enumerate(stage_definitions, start=1):
                    secret = stage_data.get("flag")
                    flag_hash_value = stage_data.get("flag_hash")
                    if not secret and not flag_hash_value:
                        continue

                    slug_raw = stage_data.get("slug") or f"stage-{idx}"
                    slug_clean = (slug_raw or "").strip().lower() or f"stage-{challenge.id}-{idx}"
                    points_value = stage_data.get("points")
                    if points_value is None:
                        points_value = data.get("points", 0)
                    try:
                        points_int = int(points_value)
                    except (TypeError, ValueError):
                        points_int = 0
                    if points_int < 0:
                        points_int = 0

                    display_order = stage_data.get("display_order") or idx

                    stage = ChallengeFlag(
                        challenge=challenge,
                        slug=slug_clean,
                        label=stage_data.get("label") or f"Stage {idx}",
                        points=points_int,
                        display_order=display_order,
                    )

                    if flag_hash_value:
                        stage.flag_hash = flag_hash_value
                    else:
                        stage.set_flag(secret)

                    db.session.add(stage)
                    total_stage_points += points_int

                if total_stage_points > 0:
                    challenge.points = total_stage_points

            logger.info("Seeded default challenges with flag stages")

        backfilled_legacy = False
        for challenge in Challenge.query.all():
            if not challenge.flags:
                legacy_stage = ChallengeFlag(
                    challenge=challenge,
                    slug=f"legacy-{challenge.id}",
                    label="Legacy Flag",
                    points=challenge.points,
                    display_order=1,
                )
                legacy_stage.flag_hash = challenge.flag_hash
                db.session.add(legacy_stage)
                backfilled_legacy = True

        if backfilled_legacy:
            logger.info("Backfilled flag stages for legacy challenges")

        if SiteAnnouncement.query.count() == 0:
            for data in DEFAULT_ANNOUNCEMENTS:
                announcement = SiteAnnouncement(
                    title=data["title"],
                    category=data["category"],
                    description=data["description"],
                    display_date=data["display_date"],
                    display_order=data.get("display_order", 0),
                    is_visible=True,
                )
                db.session.add(announcement)
            logger.info("Seeded default announcements")

        if HighlightCard.query.count() == 0:
            for data in DEFAULT_HIGHLIGHT_CARDS:
                highlight = HighlightCard(
                    label=data["label"],
                    metric_key=data["metric_key"],
                    note=data["note"],
                    display_order=data.get("display_order", 0),
                    is_visible=True,
                )
                db.session.add(highlight)
            logger.info("Seeded default highlight cards")

        if SiteEvent.query.count() == 0:
            event = SiteEvent(
                title=DEFAULT_EVENT_OVERVIEW["title"],
                date_range=DEFAULT_EVENT_OVERVIEW["date_range"],
                location=DEFAULT_EVENT_OVERVIEW["location"],
                cta_label=DEFAULT_EVENT_OVERVIEW["cta_label"],
                cta_link=DEFAULT_EVENT_OVERVIEW["cta_link"],
                cta_note=DEFAULT_EVENT_OVERVIEW.get("cta_note"),
            )
            db.session.add(event)
            logger.info("Seeded default event overview")

        for key, value in DEFAULT_SITE_SETTINGS.items():
            if db.session.get(SiteSetting, key) is None:
                db.session.add(SiteSetting(key=key, value=value))

        db.session.commit()
        cache.clear()


__all__ = ["bootstrap_defaults"]
