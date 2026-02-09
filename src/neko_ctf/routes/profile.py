from __future__ import annotations

from flask import abort, redirect, render_template, url_for
from flask_login import current_user, login_required
from sqlalchemy import func

from ..extensions import db
from ..models import Challenge, ChallengeFlag, Submission, User


def register_profile_routes(app) -> None:
    @app.route("/profile", endpoint="public.profile_me")
    @login_required
    def profile_me():
        return redirect(url_for("public.profile_view", username=current_user.username))

    @app.route("/profile/<username>", endpoint="public.profile_view")
    def profile_view(username: str):
        user = User.query.filter_by(username=username).first()
        if user is None:
            abort(404)

        is_self = current_user.is_authenticated and current_user.id == user.id

        score_row = (
            db.session.query(
                func.coalesce(func.sum(Submission.awarded_points), 0).label("score"),
                func.count(func.distinct(Submission.challenge_id)).label("solves"),
                func.max(Submission.created_at).label("last_submit"),
                func.min(Submission.created_at).label("first_solve"),
            )
            .filter(Submission.user_id == user.id, Submission.is_correct.is_(True))
            .one()
        )

        total_score = int(score_row.score or 0)
        solve_count = score_row.solves or 0
        last_submit = score_row.last_submit
        first_solve = score_row.first_solve

        total_submissions = Submission.query.filter_by(user_id=user.id).count()

        accuracy_ratio = None
        if total_submissions:
            accuracy_ratio = solve_count / total_submissions

        category_rows = (
            db.session.query(
                Challenge.category.label("category"),
                func.count(func.distinct(Challenge.id)).label("count"),
            )
            .join(Submission, Submission.challenge_id == Challenge.id)
            .filter(Submission.user_id == user.id, Submission.is_correct.is_(True))
            .group_by(Challenge.category)
            .order_by(func.count(func.distinct(Challenge.id)).desc())
            .all()
        )

        category_breakdown = [
            {
                "category": row.category,
                "count": row.count,
                "percentage": (row.count / solve_count * 100) if solve_count else 0,
            }
            for row in category_rows
        ]

        solved_rows = (
            db.session.query(Submission, Challenge, ChallengeFlag)
            .join(Challenge, Challenge.id == Submission.challenge_id)
            .outerjoin(ChallengeFlag, ChallengeFlag.id == Submission.challenge_flag_id)
            .filter(Submission.user_id == user.id, Submission.is_correct.is_(True))
            .order_by(Submission.created_at.desc())
            .all()
        )

        solved_map: dict[int, dict[str, object]] = {}
        for submission, challenge, flag in solved_rows:
            entry = solved_map.get(challenge.id)
            if entry is None:
                entry = {
                    "id": challenge.id,
                    "title": challenge.title,
                    "category": challenge.category,
                    "difficulty": challenge.difficulty,
                    "points": challenge.points,
                    "solved_at": submission.created_at,
                    "total_stages": len(challenge.flags),
                    "stage_ids": set(),
                    "latest_stage_label": flag.label if flag else "完整解题",
                }
                solved_map[challenge.id] = entry
            else:
                if submission.created_at > entry["solved_at"]:
                    entry["solved_at"] = submission.created_at
                    if flag:
                        entry["latest_stage_label"] = flag.label

            stage_ids: set = entry["stage_ids"]  # type: ignore[assignment]
            stage_ids.add(flag.id if flag else None)

        solved_challenges = []
        for entry in solved_map.values():
            stage_ids: set = entry.pop("stage_ids")  # type: ignore[assignment]
            total_stages = entry["total_stages"]  # type: ignore[index]
            solved_stage_count = 0
            if total_stages:
                solved_stage_count = len({sid for sid in stage_ids if sid is not None})
            elif stage_ids:
                solved_stage_count = 1

            stage_progress = None
            if total_stages:
                stage_progress = {
                    "solved": solved_stage_count,
                    "total": total_stages,
                    "is_complete": solved_stage_count >= total_stages,
                }

            entry["stage_progress"] = stage_progress
            
            # Only include challenges where all flags are solved
            if stage_progress is None or stage_progress["is_complete"]:
                solved_challenges.append(entry)

        solved_challenges.sort(key=lambda item: item["solved_at"], reverse=True)

        recent_rows = (
            db.session.query(Submission, Challenge)
            .join(Challenge, Challenge.id == Submission.challenge_id)
            .filter(Submission.user_id == user.id)
            .order_by(Submission.created_at.desc())
            .limit(8)
            .all()
        )

        recent_activity = [
            {
                "challenge_id": challenge.id,
                "title": challenge.title,
                "category": challenge.category,
                "points": submission.awarded_points if submission.is_correct else 0,
                "is_correct": submission.is_correct,
                "submitted_at": submission.created_at,
            }
            for submission, challenge in recent_rows
        ]

        leaderboard_rows = (
            db.session.query(
                User.id.label("user_id"),
                func.coalesce(func.sum(Submission.awarded_points), 0).label("score"),
                func.max(Submission.created_at).label("last_submit"),
            )
            .join(Submission, Submission.user_id == User.id)
            .filter(Submission.is_correct.is_(True))
            .group_by(User.id)
            .order_by(
                func.coalesce(func.sum(Submission.awarded_points), 0).desc(),
                func.max(Submission.created_at).asc(),
            )
            .all()
        )

        rank = None
        for idx, row in enumerate(leaderboard_rows, start=1):
            if row.user_id == user.id:
                rank = idx
                break

        profile_stats = {
            "score": total_score,
            "solves": solve_count,
            "last_submit": last_submit,
            "first_solve": first_solve,
            "total_submissions": total_submissions,
            "accuracy_percentage": round(accuracy_ratio * 100, 1) if accuracy_ratio is not None else None,
            "rank": rank,
        }

        return render_template(
            "profile.html",
            user=user,
            is_self=is_self,
            profile_stats=profile_stats,
            solved_challenges=solved_challenges,
            recent_activity=recent_activity,
            category_breakdown=category_breakdown,
        )


__all__ = ["register_profile_routes"]
