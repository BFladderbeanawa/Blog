from __future__ import annotations

from functools import wraps
from typing import Optional

from flask import abort
from flask_login import current_user, login_required

from .extensions import db, login_manager
from .models import User


def register_user_loader() -> None:
    @login_manager.user_loader
    def load_user(user_id: str | None) -> Optional[User]:
        if not user_id:
            return None
        return db.session.get(User, int(user_id))


def admin_required(view_func):
    @wraps(view_func)
    @login_required
    def wrapper(*args, **kwargs):
        if not current_user.is_admin:
            abort(403)
        return view_func(*args, **kwargs)

    return wrapper


__all__ = ["admin_required", "register_user_loader"]
