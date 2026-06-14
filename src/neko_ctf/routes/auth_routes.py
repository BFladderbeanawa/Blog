from __future__ import annotations

import logging

from flask import flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required, login_user, logout_user

from ..extensions import db
from ..models import User
from ..services.verification_email import send_verification_email
from ..utils import invalidate_public_cache

logger = logging.getLogger(__name__)


def register_auth_routes(app) -> None:
    @app.route("/register", methods=["GET", "POST"], endpoint="public.register")
    def register():
        if current_user.is_authenticated:
            flash("你已经登录喵～", "info")
            return redirect(url_for("public.challenges"))

        if request.method == "POST":
            username = request.form.get("username", "").strip()
            email = request.form.get("email", "").strip().lower()
            password = request.form.get("password", "")
            confirm = request.form.get("confirm_password", "")

            if not username or not email or not password:
                flash("请完整填写注册信息喵～", "error")
            elif password != confirm:
                flash("两次输入的密码不一致喵～", "error")
            elif User.query.filter((User.username == username) | (User.email == email)).first():
                flash("用户名或邮箱已被注册喵～", "error")
            else:
                user = User(username=username, email=email, is_admin=False)
                user.set_password(password)
                token = user.generate_verification_token()
                db.session.add(user)
                db.session.commit()
                invalidate_public_cache()
                
                # Try to send verification email
                try:
                    verification_url = url_for(
                        "public.verify_email",
                        token=token,
                        _external=True,
                    )
                    send_verification_email(user, verification_url)
                    flash("注册成功！请查收验证邮件激活账号喵～", "success")
                except Exception as exc:
                    logger.warning("Failed to send verification email: %s", exc)
                    flash("注册成功，但验证邮件发送失败。请联系管理员激活账号喵～", "warning")
                
                login_user(user)
                return redirect(url_for("public.challenges"))

        return render_template("register.html")

    @app.route("/login", methods=["GET", "POST"], endpoint="public.login")
    def login():
        if current_user.is_authenticated:
            flash("你已经登录喵～", "warning")
            return redirect(url_for("public.challenges"))

        if request.method == "POST":
            username = request.form.get("username", "").strip()
            password = request.form.get("password", "")

            user = User.query.filter_by(username=username).first()
            if user and user.check_password(password):
                login_user(user)
                flash("欢迎回来，猫耳黑客！", "success")
                next_path = request.args.get("next")
                default_target = url_for(
                    "admin.admin_challenges" if user.is_admin else "public.challenges"
                )
                return redirect(next_path or default_target)

            flash("用户名或密码错误喵～", "error")

        return render_template("login.html")

    @app.route("/logout", endpoint="public.logout")
    @login_required
    def logout():
        logout_user()
        flash("你已安全退出喵～", "success")
        return redirect(url_for("public.home"))

    @app.route("/verify-email/<token>", endpoint="public.verify_email")
    def verify_email(token: str):
        user = User.query.filter_by(verification_token=token).first()
        if user is None:
            flash("验证链接无效或已过期喵～", "error")
            return redirect(url_for("public.home"))
        
        if user.email_verified:
            flash("邮箱已经验证过啦喵～", "info")
            return redirect(url_for("public.challenges"))
        
        user.verify_email()
        db.session.commit()
        flash("邮箱验证成功！现在可以提交 flag 啦喵～", "success")
        return redirect(url_for("public.challenges"))

    @app.route("/resend-verification", endpoint="public.resend_verification")
    @login_required
    def resend_verification():
        if current_user.email_verified:
            flash("邮箱已经验证过啦喵～", "info")
            return redirect(url_for("public.challenges"))
        
        try:
            if not current_user.verification_token:
                current_user.generate_verification_token()
                db.session.commit()
            
            verification_url = url_for(
                "public.verify_email",
                token=current_user.verification_token,
                _external=True,
            )
            send_verification_email(current_user, verification_url)
            flash("验证邮件已重新发送，请查收喵～", "success")
        except Exception as exc:
            logger.warning("Failed to resend verification email: %s", exc)
            flash("验证邮件发送失败，请稍后重试或联系管理员喵～", "error")
        
        return redirect(url_for("public.challenges"))


__all__ = ["register_auth_routes"]
