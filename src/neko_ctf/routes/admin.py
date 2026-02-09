from __future__ import annotations

import logging

from flask import abort, current_app, flash, redirect, render_template, request, url_for
from flask_login import current_user
from sqlalchemy import func, case

from seed_data import (
    DEFAULT_EVENT_OVERVIEW,
    DEFAULT_SITE_SETTINGS,
)

from ..auth import admin_required
from ..extensions import db
from ..models import (
    Challenge,
    ChallengeCategory,
    ChallengeDifficulty,
    ChallengeFlag,
    ChallengeHint,
    HighlightCard,
    Submission,
    SiteAnnouncement,
    SiteEvent,
    SiteSetting,
    User,
)
from ..services.highlights import HIGHLIGHT_ALLOWED_KEYS, HIGHLIGHT_METRIC_CHOICES
from ..utils import (
    invalidate_public_cache,
    normalize_flag_slug,
    parse_checkbox,
    parse_int_field,
    refresh_challenge_points,
)

logger = logging.getLogger(__name__)


def register_admin_routes(app) -> None:
    @app.route("/admin", endpoint="admin.admin_dashboard")
    @admin_required
    def admin_dashboard():
        return redirect(url_for("admin.admin_challenges"))

    @app.route("/admin/site", methods=["GET", "POST"], endpoint="admin.site_content")
    @admin_required
    def admin_site():
        if request.method == "POST":
            form_type = request.form.get("form_type", "").strip()
            try:
                if form_type == "event_update":
                    title = request.form.get("title", "").strip()
                    date_range = request.form.get("date_range", "").strip()
                    location = request.form.get("location", "").strip()
                    cta_label = request.form.get("cta_label", "").strip()
                    cta_link = request.form.get("cta_link", "").strip()
                    cta_note = request.form.get("cta_note", "").strip()

                    if not title or not date_range or not location or not cta_label or not cta_link:
                        flash("请完整填写活动信息喵～", "error")
                    else:
                        event = SiteEvent.query.order_by(SiteEvent.id.asc()).first()
                        if event is None:
                            event = SiteEvent(
                                title=title,
                                date_range=date_range,
                                location=location,
                                cta_label=cta_label,
                                cta_link=cta_link,
                                cta_note=cta_note or None,
                            )
                            db.session.add(event)
                        else:
                            event.title = title
                            event.date_range = date_range
                            event.location = location
                            event.cta_label = cta_label
                            event.cta_link = cta_link
                            event.cta_note = cta_note or None
                        db.session.commit()
                        invalidate_public_cache()
                        flash("活动信息已更新喵～", "success")

                elif form_type == "settings_update":
                    leaderboard_primary = request.form.get("leaderboard_placeholder_primary", "").strip()
                    leaderboard_secondary = request.form.get("leaderboard_placeholder_secondary", "").strip()
                    leaderboard_tagline = request.form.get("leaderboard_tagline", "").strip()
                    contact_email = request.form.get("contact_email", "").strip()

                    if leaderboard_primary:
                        SiteSetting.set_value("home.leaderboard.placeholder_primary", leaderboard_primary)
                    if leaderboard_secondary:
                        SiteSetting.set_value("home.leaderboard.placeholder_secondary", leaderboard_secondary)
                    if leaderboard_tagline:
                        SiteSetting.set_value("home.leaderboard.tagline", leaderboard_tagline)
                    if contact_email:
                        SiteSetting.set_value("home.contact.cta_email", contact_email)
                    db.session.commit()
                    invalidate_public_cache()
                    flash("首页文案已保存喵～", "success")

                elif form_type == "announcement_create":
                    title = request.form.get("title", "").strip()
                    category = request.form.get("category", "").strip()
                    description = request.form.get("description", "").strip()
                    display_date = request.form.get("display_date", "").strip()
                    display_order = parse_int_field(request.form.get("display_order"), 0)
                    is_visible = parse_checkbox(request.form.get("is_visible"))

                    if not title or not category or not description or not display_date:
                        flash("请完整填写公告内容喵～", "error")
                    else:
                        announcement = SiteAnnouncement(
                            title=title,
                            category=category,
                            description=description,
                            display_date=display_date,
                            display_order=display_order,
                            is_visible=is_visible,
                        )
                        db.session.add(announcement)
                        db.session.commit()
                        invalidate_public_cache()
                        flash("新的首页动态已创建喵～", "success")

                elif form_type == "announcement_update":
                    announcement_id = request.form.get("announcement_id")
                    announcement = SiteAnnouncement.query.filter_by(id=announcement_id).first()
                    if announcement is None:
                        flash("未找到指定的公告喵～", "error")
                    else:
                        announcement.title = request.form.get("title", "").strip()
                        announcement.category = request.form.get("category", "").strip()
                        announcement.description = request.form.get("description", "").strip()
                        announcement.display_date = request.form.get("display_date", "").strip()
                        announcement.display_order = parse_int_field(
                            request.form.get("display_order"),
                            announcement.display_order,
                        )
                        announcement.is_visible = parse_checkbox(request.form.get("is_visible"))
                        if (
                            not announcement.title
                            or not announcement.category
                            or not announcement.description
                            or not announcement.display_date
                        ):
                            flash("请完整填写公告内容喵～", "error")
                        else:
                            db.session.commit()
                            invalidate_public_cache()
                            flash("公告内容已更新喵～", "success")

                elif form_type == "announcement_delete":
                    announcement_id = request.form.get("announcement_id")
                    announcement = SiteAnnouncement.query.filter_by(id=announcement_id).first()
                    if announcement is None:
                        flash("未找到指定的公告喵～", "error")
                    else:
                        db.session.delete(announcement)
                        db.session.commit()
                        invalidate_public_cache()
                        flash("公告已删除喵～", "success")

                elif form_type == "highlight_create":
                    label = request.form.get("label", "").strip()
                    metric_key = request.form.get("metric_key", "").strip()
                    note = request.form.get("note", "").strip()
                    display_order = parse_int_field(request.form.get("display_order"), 0)
                    is_visible = parse_checkbox(request.form.get("is_visible"))

                    if not label or metric_key not in HIGHLIGHT_ALLOWED_KEYS or not note:
                        flash("请检查高光卡片信息是否完整喵～", "error")
                    else:
                        highlight = HighlightCard(
                            label=label,
                            metric_key=metric_key,
                            note=note,
                            display_order=display_order,
                            is_visible=is_visible,
                        )
                        db.session.add(highlight)
                        db.session.commit()
                        invalidate_public_cache()
                        flash("新的数据高光已创建喵～", "success")

                elif form_type == "highlight_update":
                    highlight_id = request.form.get("highlight_id")
                    highlight = HighlightCard.query.filter_by(id=highlight_id).first()
                    if highlight is None:
                        flash("未找到指定的高光卡片喵～", "error")
                    else:
                        metric_key = request.form.get("metric_key", "").strip()
                        highlight.label = request.form.get("label", "").strip()
                        if metric_key in HIGHLIGHT_ALLOWED_KEYS:
                            highlight.metric_key = metric_key
                        highlight.note = request.form.get("note", "").strip()
                        highlight.display_order = parse_int_field(
                            request.form.get("display_order"),
                            highlight.display_order,
                        )
                        highlight.is_visible = parse_checkbox(request.form.get("is_visible"))
                        if not highlight.label or not highlight.note:
                            flash("请填写完整的高光卡片信息喵～", "error")
                        else:
                            db.session.commit()
                            invalidate_public_cache()
                            flash("数据高光已更新喵～", "success")

                elif form_type == "highlight_delete":
                    highlight_id = request.form.get("highlight_id")
                    highlight = HighlightCard.query.filter_by(id=highlight_id).first()
                    if highlight is None:
                        flash("未找到指定的高光卡片喵～", "error")
                    else:
                        db.session.delete(highlight)
                        db.session.commit()
                        invalidate_public_cache()
                        flash("高光卡片已删除喵～", "success")

                elif form_type == "category_create":
                    value = request.form.get("value", "").strip()
                    label = request.form.get("label", "").strip()
                    description = request.form.get("description", "").strip()
                    display_order = parse_int_field(request.form.get("display_order"), 0)
                    is_active = parse_checkbox(request.form.get("is_active"))

                    if not value or not label:
                        flash("请填写有效的分类标识和名称喵～", "error")
                    elif ChallengeCategory.query.filter_by(value=value).first():
                        flash("该分类标识已存在喵～", "error")
                    else:
                        category = ChallengeCategory(
                            value=value,
                            label=label,
                            description=description or None,
                            display_order=display_order,
                            is_active=is_active,
                        )
                        db.session.add(category)
                        db.session.commit()
                        invalidate_public_cache()
                        flash("新的题目分类已创建喵～", "success")

                elif form_type == "category_update":
                    category_id = request.form.get("category_id")
                    category = ChallengeCategory.query.filter_by(id=category_id).first()
                    if category is None:
                        flash("未找到指定分类喵～", "error")
                    else:
                        value = request.form.get("value", "").strip()
                        label = request.form.get("label", "").strip()
                        description = request.form.get("description", "").strip()
                        display_order = parse_int_field(
                            request.form.get("display_order"),
                            category.display_order,
                        )
                        is_active = parse_checkbox(request.form.get("is_active"))

                        if not value or not label:
                            flash("请填写有效的分类标识和名称喵～", "error")
                        elif (
                            ChallengeCategory.query.filter(
                                ChallengeCategory.value == value,
                                ChallengeCategory.id != category.id,
                            ).first()
                            is not None
                        ):
                            flash("该分类标识已存在喵～", "error")
                        else:
                            category.value = value
                            category.label = label
                            category.description = description or None
                            category.display_order = display_order
                            category.is_active = is_active
                            db.session.commit()
                            invalidate_public_cache()
                            flash("分类信息已更新喵～", "success")

                elif form_type == "difficulty_create":
                    value = request.form.get("value", "").strip()
                    label = request.form.get("label", "").strip()
                    description = request.form.get("description", "").strip()
                    display_order = parse_int_field(request.form.get("display_order"), 0)
                    is_active = parse_checkbox(request.form.get("is_active"))

                    if not value or not label:
                        flash("请填写有效的难度标识和名称喵～", "error")
                    elif ChallengeDifficulty.query.filter_by(value=value).first():
                        flash("该难度标识已存在喵～", "error")
                    else:
                        difficulty = ChallengeDifficulty(
                            value=value,
                            label=label,
                            description=description or None,
                            display_order=display_order,
                            is_active=is_active,
                        )
                        db.session.add(difficulty)
                        db.session.commit()
                        invalidate_public_cache()
                        flash("新的难度级别已创建喵～", "success")

                elif form_type == "difficulty_update":
                    difficulty_id = request.form.get("difficulty_id")
                    difficulty = ChallengeDifficulty.query.filter_by(id=difficulty_id).first()
                    if difficulty is None:
                        flash("未找到指定难度喵～", "error")
                    else:
                        value = request.form.get("value", "").strip()
                        label = request.form.get("label", "").strip()
                        description = request.form.get("description", "").strip()
                        display_order = parse_int_field(
                            request.form.get("display_order"),
                            difficulty.display_order,
                        )
                        is_active = parse_checkbox(request.form.get("is_active"))

                        if not value or not label:
                            flash("请填写有效的难度标识和名称喵～", "error")
                        elif (
                            ChallengeDifficulty.query.filter(
                                ChallengeDifficulty.value == value,
                                ChallengeDifficulty.id != difficulty.id,
                            ).first()
                            is not None
                        ):
                            flash("该难度标识已存在喵～", "error")
                        else:
                            difficulty.value = value
                            difficulty.label = label
                            difficulty.description = description or None
                            difficulty.display_order = display_order
                            difficulty.is_active = is_active
                            db.session.commit()
                            invalidate_public_cache()
                            flash("难度信息已更新喵～", "success")

                else:
                    flash("未知的操作类型喵～", "error")

            except Exception as exc:  # pragma: no cover - defensive logging for admin actions
                db.session.rollback()
                logger.exception("Failed to handle admin site form '%s': %s", form_type, exc)
                flash("操作失败，请稍后重试喵～", "error")

            return redirect(url_for("admin.site_content"))

        event = SiteEvent.query.order_by(SiteEvent.id.asc()).first()
        if event is None:
            event = SiteEvent(
                title=DEFAULT_EVENT_OVERVIEW["title"],
                date_range=DEFAULT_EVENT_OVERVIEW["date_range"],
                location=DEFAULT_EVENT_OVERVIEW["location"],
                cta_label=DEFAULT_EVENT_OVERVIEW["cta_label"],
                cta_link=DEFAULT_EVENT_OVERVIEW["cta_link"],
                cta_note=DEFAULT_EVENT_OVERVIEW.get("cta_note"),
            )

        announcements = (
            SiteAnnouncement.query.order_by(
                SiteAnnouncement.display_order.desc(),
                SiteAnnouncement.id.desc(),
            ).all()
        )

        highlight_cards = (
            HighlightCard.query.order_by(HighlightCard.display_order.asc(), HighlightCard.id.asc()).all()
        )

        categories = (
            ChallengeCategory.query.order_by(
                ChallengeCategory.display_order.desc(), ChallengeCategory.id.asc()
            ).all()
        )

        difficulties = (
            ChallengeDifficulty.query.order_by(
                ChallengeDifficulty.display_order.desc(), ChallengeDifficulty.id.asc()
            ).all()
        )

        settings = {
            "leaderboard_placeholder_primary": SiteSetting.get_value(
                "home.leaderboard.placeholder_primary",
                DEFAULT_SITE_SETTINGS["home.leaderboard.placeholder_primary"],
            ),
            "leaderboard_placeholder_secondary": SiteSetting.get_value(
                "home.leaderboard.placeholder_secondary",
                DEFAULT_SITE_SETTINGS["home.leaderboard.placeholder_secondary"],
            ),
            "leaderboard_tagline": SiteSetting.get_value(
                "home.leaderboard.tagline",
                DEFAULT_SITE_SETTINGS["home.leaderboard.tagline"],
            ),
            "contact_email": SiteSetting.get_value(
                "home.contact.cta_email",
                DEFAULT_SITE_SETTINGS["home.contact.cta_email"],
            ),
        }

        return render_template(
            "admin/site_content.html",
            event_name=current_app.config["EVENT_NAME"],
            event=event,
            announcements=announcements,
            highlight_cards=highlight_cards,
            metric_choices=HIGHLIGHT_METRIC_CHOICES,
            metric_label_map={value: label for value, label in HIGHLIGHT_METRIC_CHOICES},
            settings=settings,
            categories=categories,
            difficulties=difficulties,
        )

    @app.route("/admin/challenges", endpoint="admin.admin_challenges")
    @admin_required
    def admin_challenges():
        all_challenges = Challenge.query.order_by(Challenge.id.asc()).all()
        return render_template(
            "admin/challenges.html",
            event_name=current_app.config["EVENT_NAME"],
            challenges=all_challenges,
        )

    @app.route("/admin/challenges/new", methods=["GET", "POST"], endpoint="admin.new_challenge")
    @admin_required
    def new_challenge():
        categories = (
            ChallengeCategory.query.order_by(
                ChallengeCategory.display_order.desc(), ChallengeCategory.id.asc()
            ).all()
        )
        difficulties = (
            ChallengeDifficulty.query.order_by(
                ChallengeDifficulty.display_order.desc(), ChallengeDifficulty.id.asc()
            ).all()
        )

        active_categories = [cat for cat in categories if cat.is_active]
        active_difficulties = [level for level in difficulties if level.is_active]

        category_values = {cat.value for cat in active_categories}
        difficulty_values = {level.value for level in active_difficulties}

        if request.method == "POST":
            title = request.form.get("title", "").strip()
            category = request.form.get("category", "").strip()
            difficulty = request.form.get("difficulty", "").strip()
            summary = request.form.get("summary", "").strip()
            content = request.form.get("content", "").strip()
            is_visible = parse_checkbox(request.form.get("is_visible"))

            if not title or not category or not difficulty or not summary or not content:
                flash("请填写完整题目信息喵～", "error")
                return redirect(url_for("admin.new_challenge"))

            if category not in category_values:
                flash("请选择有效的分类喵～", "error")
                return redirect(url_for("admin.new_challenge"))

            if difficulty not in difficulty_values:
                flash("请选择有效的难度喵～", "error")
                return redirect(url_for("admin.new_challenge"))

            new_challenge = Challenge(
                title=title,
                category=category,
                difficulty=difficulty,
                summary=summary,
                description=content,
                points=0,  # Will be auto-calculated from flags
                is_visible=is_visible,
            )
            db.session.add(new_challenge)
            db.session.commit()
            invalidate_public_cache()
            flash("题目基础信息已保存喵～，现在去添加 Flag 阶段吧！", "success")
            return redirect(url_for("admin.manage_challenge_flags", challenge_id=new_challenge.id))

        return render_template(
            "admin/new_challenge.html",
            event_name=current_app.config["EVENT_NAME"],
            category_choices=active_categories,
            difficulty_choices=active_difficulties,
        )

    @app.route(
        "/admin/challenges/<int:challenge_id>/edit",
        methods=["GET", "POST"],
        endpoint="admin.edit_challenge",
    )
    @admin_required
    def edit_challenge(challenge_id: int):
        challenge = db.session.get(Challenge, challenge_id)
        if challenge is None:
            abort(404)

        categories = (
            ChallengeCategory.query.order_by(
                ChallengeCategory.display_order.desc(), ChallengeCategory.id.asc()
            ).all()
        )
        difficulties = (
            ChallengeDifficulty.query.order_by(
                ChallengeDifficulty.display_order.desc(), ChallengeDifficulty.id.asc()
            ).all()
        )

        active_categories = [cat for cat in categories if cat.is_active]
        active_difficulties = [level for level in difficulties if level.is_active]

        category_values = {cat.value for cat in active_categories}
        difficulty_values = {level.value for level in active_difficulties}

        category_choices = list(active_categories)
        if challenge.category and all(cat.value != challenge.category for cat in category_choices):
            current_category = next((cat for cat in categories if cat.value == challenge.category), None)
            if current_category:
                category_choices.append(current_category)

        difficulty_choices = list(active_difficulties)
        if challenge.difficulty and all(level.value != challenge.difficulty for level in difficulty_choices):
            current_difficulty = next((level for level in difficulties if level.value == challenge.difficulty), None)
            if current_difficulty:
                difficulty_choices.append(current_difficulty)

        if request.method == "POST":
            title = request.form.get("title", "").strip()
            category = request.form.get("category", "").strip()
            difficulty = request.form.get("difficulty", "").strip()
            summary = request.form.get("summary", "").strip()
            content = request.form.get("content", "").strip()
            is_visible = parse_checkbox(request.form.get("is_visible"))

            if not title or not category or not difficulty or not summary or not content:
                flash("请填写完整题目信息喵～", "error")
                return redirect(url_for("admin.edit_challenge", challenge_id=challenge.id))

            if category not in category_values and category != challenge.category:
                flash("请选择有效的分类喵～", "error")
                return redirect(url_for("admin.edit_challenge", challenge_id=challenge.id))

            if difficulty not in difficulty_values and difficulty != challenge.difficulty:
                flash("请选择有效的难度喵～", "error")
                return redirect(url_for("admin.edit_challenge", challenge_id=challenge.id))

            challenge.title = title
            challenge.category = category
            challenge.difficulty = difficulty
            challenge.summary = summary
            challenge.description = content
            challenge.is_visible = is_visible
            # Points are auto-calculated from flags
            refresh_challenge_points(challenge)
            db.session.commit()
            invalidate_public_cache()
            flash("题目信息已更新喵～", "success")
            return redirect(url_for("admin.admin_challenges"))

        return render_template(
            "admin/edit_challenge.html",
            event_name=current_app.config["EVENT_NAME"],
            challenge=challenge,
            category_choices=category_choices,
            difficulty_choices=difficulty_choices,
        )

    @app.route(
        "/admin/challenges/<int:challenge_id>/hints",
        methods=["GET", "POST"],
        endpoint="admin.manage_challenge_hints",
    )
    @admin_required
    def manage_challenge_hints(challenge_id: int):
        challenge = db.session.get(Challenge, challenge_id)
        if challenge is None:
            abort(404)

        if request.method == "POST":
            title = request.form.get("title", "").strip()
            content = request.form.get("content", "").strip()
            order_value = request.form.get("order", "").strip()

            if not content:
                flash("提示内容不能为空喵～", "error")
                return redirect(url_for("admin.manage_challenge_hints", challenge_id=challenge.id))

            try:
                order = int(order_value) if order_value else None
            except ValueError:
                order = None

            if order is None:
                max_order = (
                    db.session.query(func.coalesce(func.max(ChallengeHint.order), 0))
                    .filter(ChallengeHint.challenge_id == challenge.id)
                    .scalar()
                )
                order = max_order + 1

            hint = ChallengeHint(
                challenge_id=challenge.id,
                title=title or None,
                content=content,
                order=order,
            )
            db.session.add(hint)
            db.session.commit()
            flash("新的提示已添加喵～", "success")
            return redirect(url_for("admin.manage_challenge_hints", challenge_id=challenge.id))

        hints = (
            ChallengeHint.query.filter_by(challenge_id=challenge.id)
            .order_by(ChallengeHint.order.asc(), ChallengeHint.id.asc())
            .all()
        )

        return render_template(
            "admin/hints.html",
            event_name=current_app.config["EVENT_NAME"],
            challenge=challenge,
            hints=hints,
        )

    @app.route(
        "/admin/challenges/<int:challenge_id>/flags",
        methods=["GET", "POST"],
        endpoint="admin.manage_challenge_flags",
    )
    @admin_required
    def manage_challenge_flags(challenge_id: int):
        challenge = db.session.get(Challenge, challenge_id)
        if challenge is None:
            abort(404)

        if request.method == "POST":
            action = request.form.get("action", "create").strip()
            try:
                if action == "create":
                    slug = normalize_flag_slug(
                        request.form.get("slug"),
                        f"stage-{len(challenge.flags) + 1}",
                    )
                    label = request.form.get("label", "").strip() or "新的阶段"
                    flag_secret = request.form.get("flag", "").strip()
                    points = parse_int_field(request.form.get("points"), 0)
                    display_order = parse_int_field(
                        request.form.get("display_order"),
                        len(challenge.flags) + 1,
                    )

                    if not flag_secret:
                        flash("请填写 flag 内容喵～", "error")
                    elif ChallengeFlag.query.filter_by(challenge_id=challenge.id, slug=slug).first():
                        flash("阶段标识已存在喵～", "error")
                    else:
                        stage = ChallengeFlag(
                            challenge_id=challenge.id,
                            slug=slug,
                            label=label,
                            points=points if points > 0 else 0,
                            display_order=display_order,
                        )
                        stage.set_flag(flag_secret)
                        db.session.add(stage)
                        db.session.flush()
                        refresh_challenge_points(challenge)
                        db.session.commit()
                        invalidate_public_cache()
                        flash("新的 flag 阶段已创建喵～", "success")

                elif action == "update":
                    flag_id = parse_int_field(request.form.get("flag_id"), 0)
                    stage = ChallengeFlag.query.filter_by(id=flag_id, challenge_id=challenge.id).first()
                    if stage is None:
                        flash("未找到指定 flag 阶段喵～", "error")
                    else:
                        slug = normalize_flag_slug(request.form.get("slug"), stage.slug)
                        if slug != stage.slug and ChallengeFlag.query.filter_by(
                            challenge_id=challenge.id,
                            slug=slug,
                        ).first():
                            flash("阶段标识已存在喵～", "error")
                        else:
                            stage.slug = slug
                            stage.label = request.form.get("label", "").strip() or stage.label
                            stage.points = parse_int_field(
                                request.form.get("points"),
                                stage.points,
                            )
                            stage.display_order = parse_int_field(
                                request.form.get("display_order"),
                                stage.display_order,
                            )
                            new_secret = request.form.get("flag", "").strip()
                            if new_secret:
                                stage.set_flag(new_secret)
                            refresh_challenge_points(challenge)
                            db.session.commit()
                            invalidate_public_cache()
                            flash("Flag 阶段已更新喵～", "success")

                elif action == "delete":
                    flag_id = parse_int_field(request.form.get("flag_id"), 0)
                    stage = ChallengeFlag.query.filter_by(id=flag_id, challenge_id=challenge.id).first()
                    if stage is None:
                        flash("未找到指定 flag 阶段喵～", "error")
                    elif len(challenge.flags) <= 1:
                        flash("至少保留一个 flag 阶段喵～", "error")
                    else:
                        db.session.delete(stage)
                        db.session.flush()
                        refresh_challenge_points(challenge)
                        db.session.commit()
                        invalidate_public_cache()
                        flash("Flag 阶段已删除喵～", "success")

                else:
                    flash("未知的操作类型喵～", "error")

            except Exception as exc:  # pragma: no cover - admin safeguard
                db.session.rollback()
                logger.exception("Failed to manage challenge flags for challenge %s: %s", challenge_id, exc)
                flash("操作失败，请稍后重试喵～", "error")

            return redirect(url_for("admin.manage_challenge_flags", challenge_id=challenge.id))

        stages = (
            ChallengeFlag.query.filter_by(challenge_id=challenge.id)
            .order_by(ChallengeFlag.display_order.asc(), ChallengeFlag.id.asc())
            .all()
        )

        return render_template(
            "admin/flags.html",
            event_name=current_app.config["EVENT_NAME"],
            challenge=challenge,
            stages=stages,
        )

    @app.route(
        "/admin/challenges/<int:challenge_id>/hints/<int:hint_id>/delete",
        methods=["POST"],
        endpoint="admin.delete_challenge_hint",
    )
    @admin_required
    def delete_challenge_hint(challenge_id: int, hint_id: int):
        challenge = db.session.get(Challenge, challenge_id)
        if challenge is None:
            abort(404)

        hint = ChallengeHint.query.filter_by(id=hint_id, challenge_id=challenge.id).first()
        if hint is None:
            abort(404)

        db.session.delete(hint)
        db.session.commit()
        flash("提示已删除喵～", "success")
        return redirect(url_for("admin.manage_challenge_hints", challenge_id=challenge.id))

    @app.route(
        "/admin/challenges/<int:challenge_id>/delete",
        methods=["POST"],
        endpoint="admin.delete_challenge",
    )
    @admin_required
    def delete_challenge(challenge_id: int):
        challenge = db.session.get(Challenge, challenge_id)
        if challenge is None:
            abort(404)

        db.session.delete(challenge)
        db.session.commit()
        invalidate_public_cache()
        flash("题目已删除喵～", "success")
        return redirect(url_for("admin.admin_challenges"))

    @app.route("/admin/users", methods=["GET"], endpoint="admin.admin_users")
    @admin_required
    def admin_users():
        awarded_expr = func.coalesce(
            func.sum(
                case(
                    (Submission.is_correct.is_(True), func.coalesce(Submission.awarded_points, 0)),
                    else_=0,
                )
            ),
            0,
        )
        score_expr = awarded_expr + func.coalesce(User.bonus_points, 0)
        solves_expr = func.coalesce(
            func.count(
                func.distinct(
                    case((Submission.is_correct.is_(True), Submission.challenge_id))
                )
            ),
            0,
        )
        last_submit_expr = func.max(
            case((Submission.is_correct.is_(True), Submission.created_at))
        )

        user_rows = (
            db.session.query(
                User,
                awarded_expr.label("awarded_points"),
                score_expr.label("total_points"),
                solves_expr.label("solve_count"),
                last_submit_expr.label("last_submit"),
            )
            .outerjoin(Submission, Submission.user_id == User.id)
            .group_by(User.id)
            .order_by(User.id.asc())
            .all()
        )

        users_payload = []
        active_count = 0
        for user, awarded_points, total_points, solve_count, last_submit in user_rows:
            base_points = int(awarded_points or 0)
            total_score = int(total_points or 0)
            if total_score > 0:
                active_count += 1
            users_payload.append(
                {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_admin": user.is_admin,
                    "bonus_points": int(user.bonus_points or 0),
                    "awarded_points": base_points,
                    "total_points": total_score,
                    "solve_count": int(solve_count or 0),
                    "last_submit": last_submit,
                }
            )

        summary = {
            "total_users": len(users_payload),
            "admin_count": sum(1 for payload in users_payload if payload["is_admin"]),
            "bonus_count": sum(1 for payload in users_payload if payload["bonus_points"] > 0),
            "active_count": active_count,
        }

        return render_template(
            "admin/users.html",
            event_name=current_app.config["EVENT_NAME"],
            users=users_payload,
            summary=summary,
        )

    @app.route("/admin/users/<int:user_id>/edit", methods=["GET", "POST"], endpoint="admin.edit_user")
    @admin_required
    def edit_user(user_id: int):
        user = db.session.get(User, user_id)
        if user is None:
            abort(404)

        if request.method == "POST":
            username = request.form.get("username", "").strip()
            email = request.form.get("email", "").strip()
            bonus_points = parse_int_field(request.form.get("bonus_points"), user.bonus_points)
            if bonus_points < 0:
                bonus_points = 0
            is_admin_flag = parse_checkbox(request.form.get("is_admin"))
            email_verified_flag = parse_checkbox(request.form.get("email_verified"))

            if not username or not email:
                flash("请填写完整的用户信息喵～", "error")
                return redirect(url_for("admin.edit_user", user_id=user.id))

            username_conflict = User.query.filter(User.username == username, User.id != user.id).first()
            if username_conflict is not None:
                flash("用户名已被使用喵～", "error")
                return redirect(url_for("admin.edit_user", user_id=user.id))

            email_conflict = User.query.filter(User.email == email, User.id != user.id).first()
            if email_conflict is not None:
                flash("邮箱已被使用喵～", "error")
                return redirect(url_for("admin.edit_user", user_id=user.id))

            if user.is_admin and not is_admin_flag:
                remaining_admins = User.query.filter(User.is_admin.is_(True), User.id != user.id).count()
                if remaining_admins == 0:
                    flash("至少保留一位管理员喵～", "error")
                    return redirect(url_for("admin.edit_user", user_id=user.id))

            new_password = request.form.get("new_password", "")
            confirm_password = request.form.get("confirm_password", "")
            if new_password or confirm_password:
                if new_password != confirm_password:
                    flash("两次输入的密码不一致喵～", "error")
                    return redirect(url_for("admin.edit_user", user_id=user.id))
                if len(new_password) < 8:
                    flash("新密码至少需要 8 位喵～", "error")
                    return redirect(url_for("admin.edit_user", user_id=user.id))

            user.username = username
            user.email = email
            user.is_admin = is_admin_flag
            user.email_verified = email_verified_flag
            user.bonus_points = bonus_points
            if new_password:
                user.set_password(new_password)

            db.session.commit()
            invalidate_public_cache()
            flash("用户资料已更新喵～", "success")
            return redirect(url_for("admin.edit_user", user_id=user.id))

        stats_row = (
            db.session.query(
                func.coalesce(func.sum(func.coalesce(Submission.awarded_points, 0)), 0),
                func.count(func.distinct(Submission.challenge_id)),
                func.max(Submission.created_at),
            )
            .filter(Submission.user_id == user.id, Submission.is_correct.is_(True))
            .one()
        )

        awarded_points = int(stats_row[0] or 0)
        solve_count = int(stats_row[1] or 0)
        last_submit = stats_row[2]

        stats = {
            "awarded_points": awarded_points,
            "bonus_points": int(user.bonus_points or 0),
            "total_points": awarded_points + int(user.bonus_points or 0),
            "solve_count": solve_count,
            "last_submit": last_submit,
        }

        return render_template(
            "admin/edit_user.html",
            event_name=current_app.config["EVENT_NAME"],
            user=user,
            stats=stats,
        )

    @app.route("/admin/users/<int:user_id>/delete", methods=["POST"], endpoint="admin.delete_user")
    @admin_required
    def delete_user(user_id: int):
        user = db.session.get(User, user_id)
        if user is None:
            abort(404)

        if user.id == current_user.id:
            flash("不能删除当前登录账号喵～", "error")
            return redirect(url_for("admin.admin_users"))

        if user.is_admin:
            remaining_admins = User.query.filter(User.is_admin.is_(True), User.id != user.id).count()
            if remaining_admins == 0:
                flash("至少保留一位管理员喵～", "error")
                return redirect(url_for("admin.admin_users"))

        db.session.delete(user)
        db.session.commit()
        invalidate_public_cache()
        flash("用户已删除喵～", "success")
        return redirect(url_for("admin.admin_users"))


__all__ = ["register_admin_routes"]
