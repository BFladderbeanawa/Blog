from __future__ import annotations

import smtplib
from email.message import EmailMessage

from flask import current_app, url_for


def send_verification_email(user, verification_url: str) -> None:
    """Send email verification link to user."""
    if not current_app.config.get("MAIL_SERVER"):
        raise RuntimeError("Mail server settings are not configured.")

    message = EmailMessage()
    message["Subject"] = f"[{current_app.config['EVENT_NAME']}] 验证你的邮箱喵～"
    message["From"] = current_app.config.get("MAIL_DEFAULT_SENDER") or current_app.config.get("MAIL_USERNAME")
    message["To"] = user.email

    body = f"""你好 {user.username}！

感谢注册 {current_app.config['EVENT_NAME']}！

请点击下面的链接验证你的邮箱：
{verification_url}

验证成功后你就可以提交 flag 啦！

如果你没有注册过此账号，请忽略此邮件。

— NekoCTF 团队 🐱
"""
    message.set_content(body)

    server = current_app.config["MAIL_SERVER"]
    port = current_app.config["MAIL_PORT"]
    use_tls = current_app.config.get("MAIL_USE_TLS", True)

    with smtplib.SMTP(server, port) as smtp:
        if use_tls:
            smtp.starttls()
        username = current_app.config.get("MAIL_USERNAME")
        password = current_app.config.get("MAIL_PASSWORD")
        if username and password:
            smtp.login(username, password)
        smtp.send_message(message)


__all__ = ["send_verification_email"]
