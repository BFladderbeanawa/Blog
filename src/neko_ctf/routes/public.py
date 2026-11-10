from __future__ import annotations

import logging

from flask import abort, current_app, flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required
from sqlalchemy import func, case, nulls_last

from seed_data import DEFAULT_EVENT_OVERVIEW

from ..cache_config import (
    HOME_CACHE_KEY,
    HOME_CACHE_TIMEOUT,
    LEADERBOARD_CACHE_KEY,
    LEADERBOARD_CACHE_TIMEOUT,
)
from ..extensions import cache, db
from ..models import (
    Challenge,
    ChallengeCategory,
    ChallengeFlag,
    ChallengeHint,
    HighlightCard,
    SiteAnnouncement,
    SiteEvent,
    SiteSetting,
    Submission,
    User,
)
from ..services.email import send_submission_email
from ..services.highlights import compute_highlight_value
from ..utils import invalidate_public_cache

logger = logging.getLogger(__name__)


def register_public_routes(app) -> None:
    @app.route("/", endpoint="public.home")
    @cache.cached(timeout=HOME_CACHE_TIMEOUT, key_prefix=HOME_CACHE_KEY)
    def home():
        highlight_cards = (
            HighlightCard.query.filter_by(is_visible=True)
            .order_by(HighlightCard.display_order.asc(), HighlightCard.id.asc())
            .all()
        )

        highlight_stats = [
            {
                "label": card.label,
                "note": card.note,
                "value": compute_highlight_value(card.metric_key),
            }
            for card in highlight_cards
        ]

        awarded_sum = func.coalesce(
            func.sum(
                case(
                    (Submission.is_correct.is_(True), func.coalesce(Submission.awarded_points, 0)),
                    else_=0,
                )
            ),
            0,
        )
        score_expr = awarded_sum + func.coalesce(User.bonus_points, 0)
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

        top_rows = (
            db.session.query(
                User.username.label("username"),
                score_expr.label("score"),
                solves_expr.label("solves"),
                last_submit_expr.label("last_submit"),
            )
            .outerjoin(Submission, Submission.user_id == User.id)
            .group_by(User.id)
            .order_by(score_expr.desc(), nulls_last(last_submit_expr.asc()), User.username.asc())
            .limit(3)
            .all()
        )

        top_players = []
        for row in top_rows:
            score_value = int(row.score or 0)
            if score_value <= 0:
                continue
            top_players.append(
                {
                    "username": row.username,
                    "score": score_value,
                    "solves": int(row.solves or 0),
                    "has_profile": True,
                }
            )

        if not top_players:
            placeholder_primary = SiteSetting.get_value(
                "home.leaderboard.placeholder_primary",
                "等待登场",
            )
            placeholder_secondary = SiteSetting.get_value(
                "home.leaderboard.placeholder_secondary",
                "期待你的加入",
            )
            top_players = [
                {"username": placeholder_primary, "score": 0, "solves": 0, "has_profile": False},
                {"username": placeholder_secondary, "score": 0, "solves": 0, "has_profile": False},
            ]

        categories = (
            ChallengeCategory.query.filter_by(is_active=True)
            .order_by(ChallengeCategory.display_order.desc(), ChallengeCategory.id.asc())
            .all()
        )

        category_counts = {
            row.category: row.count
            for row in (
                db.session.query(
                    Challenge.category.label("category"),
                    func.count(Challenge.id).label("count"),
                )
                .filter(Challenge.is_visible.is_(True))
                .group_by(Challenge.category)
                .all()
            )
        }

        featured_categories = []
        for category in categories:
            featured_categories.append(
                {
                    "category": category.label,
                    "value": category.value,
                    "count": category_counts.get(category.value, 0),
                    "description": category.description,
                }
            )
            if len(featured_categories) == 4:
                break

        event_overview = SiteEvent.query.order_by(SiteEvent.id.asc()).first()
        if event_overview is None:
            event_overview = SiteEvent(
                title=DEFAULT_EVENT_OVERVIEW["title"],
                date_range=DEFAULT_EVENT_OVERVIEW["date_range"],
                location=DEFAULT_EVENT_OVERVIEW["location"],
                cta_label=DEFAULT_EVENT_OVERVIEW["cta_label"],
                cta_link=DEFAULT_EVENT_OVERVIEW["cta_link"],
                cta_note=DEFAULT_EVENT_OVERVIEW.get("cta_note"),
            )

        news_items = (
            SiteAnnouncement.query.filter_by(is_visible=True)
            .order_by(SiteAnnouncement.display_order.desc(), SiteAnnouncement.id.desc())
            .all()
        )

        news_payload = [
            {
                "title": item.title,
                "category": item.category,
                "description": item.description,
                "date": item.display_date,
            }
            for item in news_items
        ]

        leaderboard_tagline = SiteSetting.get_value(
            "home.leaderboard.tagline",
            "想要上榜？完成任意题目即可累计积分，登录后台查看详细成绩。",
        )
        contact_email = SiteSetting.get_value("home.contact.cta_email", "hi@nekoctf.com")

        return render_template(
            "index.html",
            event_name=current_app.config["EVENT_NAME"],
            highlight_stats=highlight_stats,
            top_players=top_players,
            featured_categories=featured_categories,
            event_overview=event_overview,
            news_items=news_payload,
            leaderboard_tagline=leaderboard_tagline,
            contact_email=contact_email,
        )

    @app.route("/about", endpoint="public.about")
    def about():
        return render_template(
            "about.html",
            event_name=current_app.config["EVENT_NAME"],
        )

    @app.route("/leaderboard", endpoint="public.leaderboard")
    @cache.cached(timeout=LEADERBOARD_CACHE_TIMEOUT, key_prefix=LEADERBOARD_CACHE_KEY)
    def leaderboard():
        awarded_sum = func.coalesce(
            func.sum(
                case(
                    (Submission.is_correct.is_(True), func.coalesce(Submission.awarded_points, 0)),
                    else_=0,
                )
            ),
            0,
        )
        score_expr = awarded_sum + func.coalesce(User.bonus_points, 0)
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

        rows = (
            db.session.query(
                User.username.label("team"),
                score_expr.label("score"),
                last_submit_expr.label("last_submit"),
                solves_expr.label("solves"),
            )
            .outerjoin(Submission, Submission.user_id == User.id)
            .group_by(User.id)
            .order_by(score_expr.desc(), nulls_last(last_submit_expr.asc()), User.username.asc())
        )

        leaderboard_data = []
        for row in rows:
            score_value = int(row.score or 0)
            leaderboard_data.append(
                {
                    "team": row.team,
                    "score": score_value,
                    "solves": int(row.solves or 0),
                    "last_submit": row.last_submit.strftime("%Y-%m-%d %H:%M") if row.last_submit else "--",
                }
            )

        return render_template(
            "leaderboard.html",
            event_name=current_app.config["EVENT_NAME"],
            leaderboard=leaderboard_data,
        )

    @app.route("/challenges", endpoint="public.challenges")
    def challenges():
        visible_challenges = Challenge.query.filter_by(is_visible=True).order_by(Challenge.id.asc()).all()
        user_progress: dict[int, dict[str, object]] = {}
        if current_user.is_authenticated:
            solved_submissions = Submission.query.filter_by(user_id=current_user.id, is_correct=True).all()
            for submission in solved_submissions:
                entry = user_progress.setdefault(
                    submission.challenge_id,
                    {"stage_ids": set(), "legacy": False},
                )
                if submission.challenge_flag_id:
                    entry["stage_ids"].add(submission.challenge_flag_id)
                else:
                    entry["legacy"] = True

            for entry in user_progress.values():
                stage_ids = entry.get("stage_ids", set())
                if isinstance(stage_ids, set):
                    solved_count = len(stage_ids)
                    entry["stage_ids"] = list(stage_ids)
                else:
                    solved_count = len(stage_ids or [])
                entry["solved_count"] = solved_count

        return render_template(
            "challenges.html",
            event_name=current_app.config["EVENT_NAME"],
            challenges=visible_challenges,
            user_progress=user_progress,
        )

    @app.route("/submit", methods=["GET", "POST"], endpoint="public.submit")
    def submit():
        if request.method == "POST":
            team_name = request.form.get("team_name", "").strip()
            contact_email = request.form.get("contact_email", "").strip()
            message = request.form.get("message", "").strip()

            if not team_name or not contact_email or not message:
                flash("请填写完整的提交信息喵～", "error")
                return redirect(url_for("public.submit"))

            submission_payload = {
                "team_name": team_name,
                "contact_email": contact_email,
                "message": message,
            }

            try:
                send_submission_email(submission_payload)
                flash("我们已经收到你的题目提交，感谢你的贡献喵！", "success")
            except Exception as exc:  # pragma: no cover - defensive fallback
                logger.warning("Email sending failed, falling back to manual instructions: %s", exc)
                organizer_email = current_app.config.get("ORGANIZER_EMAIL")
                flash(
                    f"邮件服务暂未配置成功，请直接发送题目到 {organizer_email}，非常感谢喵！",
                    "warning",
                )

            return redirect(url_for("public.submit"))

        organizer_email = current_app.config.get("ORGANIZER_EMAIL")
        mailto_link = f"mailto:{organizer_email}?subject=NekoCTF%202025%20%E9%A2%98%E7%9B%AE%E6%8F%90%E4%BA%A4"

        return render_template(
            "submit.html",
            event_name=current_app.config["EVENT_NAME"],
            organizer_email=organizer_email,
            mailto_link=mailto_link,
        )

    @app.route("/challenges/<int:challenge_id>", methods=["GET", "POST"], endpoint="public.challenge_detail")
    def challenge_detail(challenge_id: int):
        challenge = db.session.get(Challenge, challenge_id)
        if challenge is None:
            abort(404)

        if not challenge.is_visible and (not current_user.is_authenticated or not current_user.is_admin):
            abort(404)

        solved_stage_ids: set[int] = set()
        legacy_solved = False
        if current_user.is_authenticated:
            solved_rows = (
                Submission.query.filter_by(
                    user_id=current_user.id,
                    challenge_id=challenge.id,
                    is_correct=True,
                )
                .with_entities(Submission.challenge_flag_id)
                .all()
            )
            for row in solved_rows:
                if row.challenge_flag_id is None:
                    legacy_solved = True
                else:
                    solved_stage_ids.add(row.challenge_flag_id)

        total_stage_count = len(challenge.flags)
        solved_stage_count = len(solved_stage_ids)
        solved = solved_stage_count == total_stage_count if total_stage_count else legacy_solved

        stage_progress = {
            "total_count": total_stage_count,
            "solved_count": solved_stage_count,
            "has_partial": total_stage_count > 0 and 0 < solved_stage_count < total_stage_count,
        }

        if request.method == "POST":
            if not current_user.is_authenticated:
                flash("请先登录后再提交 flag 喵～", "warning")
                return redirect(
                    url_for(
                        "public.login",
                        next=url_for("public.challenge_detail", challenge_id=challenge.id),
                    )
                )
            
            if not current_user.email_verified and not current_user.is_admin:
                flash("请先验证邮箱后再提交 flag 喵～", "warning")
                return redirect(url_for("public.challenge_detail", challenge_id=challenge.id))

            flag = request.form.get("flag", "").strip()
            if not flag:
                flash("请填写 flag 喵～", "error")
                return redirect(url_for("public.challenge_detail", challenge_id=challenge.id))

            matched_stage = challenge.match_flag(flag)

            if matched_stage is not None:
                already_stage = Submission.query.filter_by(
                    user_id=current_user.id,
                    challenge_id=challenge.id,
                    challenge_flag_id=matched_stage.id,
                    is_correct=True,
                ).first()

                if already_stage:
                    flash(f"你已经解锁 {matched_stage.label} 喵，继续探索其它阶段吧！", "info")
                    return redirect(url_for("public.challenge_detail", challenge_id=challenge.id))

                submission = Submission(
                    user_id=current_user.id,
                    challenge_id=challenge.id,
                    flag_submitted=flag,
                    is_correct=True,
                    challenge_flag_id=matched_stage.id,
                    awarded_points=matched_stage.points,
                )
                db.session.add(submission)
                db.session.commit()
                invalidate_public_cache()

                stage_prefix = (
                    f"成功解锁 {matched_stage.label}" if total_stage_count > 1 else f"成功解决 {challenge.title}"
                )
                flash(
                    f"恭喜喵！{stage_prefix}，获得 {matched_stage.points} 分。",
                    "success",
                )
                return redirect(url_for("public.challenge_detail", challenge_id=challenge.id))

            is_correct = challenge.verify_flag(flag)

            if is_correct and legacy_solved:
                flash("你已经完成这道题目啦，继续挑战其它题目喵～", "info")
                return redirect(url_for("public.challenge_detail", challenge_id=challenge.id))

            submission = Submission(
                user_id=current_user.id,
                challenge_id=challenge.id,
                flag_submitted=flag,
                is_correct=is_correct,
                awarded_points=challenge.points if is_correct else None,
            )
            db.session.add(submission)
            db.session.commit()

            if is_correct:
                invalidate_public_cache()
                flash(f"恭喜喵！成功解决 {challenge.title}，获得 {challenge.points} 分。", "success")
            else:
                flash("flag 不正确，再试一次喵～", "error")

            return redirect(url_for("public.challenge_detail", challenge_id=challenge.id))

        hints = (
            ChallengeHint.query.filter_by(challenge_id=challenge.id)
            .order_by(ChallengeHint.order.asc(), ChallengeHint.id.asc())
            .all()
        )

        return render_template(
            "challenge_detail.html",
            event_name=current_app.config["EVENT_NAME"],
            challenge=challenge,
            solved=solved,
            solved_stage_ids=solved_stage_ids,
            flags=challenge.flags,
            stage_progress=stage_progress,
            legacy_solved=legacy_solved,
            hints=hints,
        )

    def _render_error_page(
        status_code: int,
        *,
        title: str,
        message: str,
        detail: str | None = None,
        suggestions: list[str] | None = None,
        extra_links: list[dict[str, str]] | None = None,
    ):
        support_email = (
            current_app.config.get("SUPPORT_EMAIL")
            or current_app.config.get("ORGANIZER_EMAIL")
            or current_app.config.get("ADMIN_EMAIL")
        )

        return (
            render_template(
                "errors/error.html",
                event_name=current_app.config["EVENT_NAME"],
                status_code=status_code,
                title=title,
                message=message,
                detail=detail,
                suggestions=list(suggestions or ()),
                extra_links=list(extra_links or ()),
                support_email=support_email,
                request_path=request.path,
            ),
            status_code,
        )
    
    @app.errorhandler(404)
    def handle_not_found(error):
        description = getattr(error, "description", None)
        return _render_error_page(
            404,
            title="页面走丢了喵～",
            message="我们在二次元和三次元之间找了好几圈，还是没发现这个地址。",
            detail=description,
            suggestions=[
                "检查一下链接是否有小爪子打错了",
                "回到主页重新选择入口",
                "前往题目列表继续练级",
            ],
            extra_links=[
                {"href": url_for("public.home"), "label": "返回喵城主页"},
                {"href": url_for("public.challenges"), "label": "探索题目列表"},
                {"href": url_for("public.leaderboard"), "label": "看看排行榜"},
            ],
        )

    @app.errorhandler(500)
    def handle_internal_error(error):  # pragma: no cover - exercised during tests
        description = getattr(error, "description", None)
        return _render_error_page(
            500,
            title="服务器有点晕喵…",
            message="后台小喵正努力修复，请稍候再试。",
            detail=description,
            suggestions=[
                "稍等片刻再刷新一次",
                "把遇到的问题告诉组织者",
            ],
            extra_links=[
                {"href": url_for("public.home"), "label": "返回主页"},
                {"href": url_for("public.about"), "label": "了解赛事详情"},
            ],
        )

    @app.errorhandler(403)
    def handle_forbidden(error):
        description = getattr(error, "description", None)
        return _render_error_page(
            403,
            title="这里需要管理喵牌",
            message="你似乎还没有访问这个页面的权限。",
            detail=description,
            suggestions=[
                "确认账号是否已登录",
                "如需管理权限请联系组织者",
            ],
            extra_links=[
                {"href": url_for("public.login"), "label": "前往登录"},
                {"href": url_for("public.register"), "label": "注册参赛帐号"},
            ],
        )


__all__ = ["register_public_routes"]
