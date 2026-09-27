from __future__ import annotations

import smtplib
from email.message import EmailMessage
from typing import Mapping

from flask import current_app


def send_submission_email(form_data: Mapping[str, str]) -> None:
    """Send submission form data to configured recipient."""
    if not current_app.config.get("MAIL_SERVER") or not current_app.config.get("MAIL_RECIPIENT"):
        raise RuntimeError("Mail server settings are not fully configured.")

    message = EmailMessage()
    subject_name = form_data.get("challenge_title") or form_data.get("team_name", "Unknown")
    message["Subject"] = f"[NekoCTF Submission] {subject_name}"
    message["From"] = current_app.config.get("MAIL_DEFAULT_SENDER") or current_app.config.get("MAIL_USERNAME")
    message["To"] = current_app.config["MAIL_RECIPIENT"]

    body = [
        "新题目提交信息:",
        f"团队 / 作者: {form_data.get('team_name', '未填写')}",
        f"联系邮箱: {form_data.get('contact_email', '未填写')}",
        f"题目标题: {form_data.get('challenge_title', '未填写')}",
        f"题目分类: {form_data.get('category', '未填写')}",
        f"预期难度: {form_data.get('difficulty', '未填写')}",
        f"预估解出队伍: {form_data.get('expected_solvers', '未填写')}",
        "",
        "题目详情:",
        form_data.get("message", "(未填写)") or "(未填写)",
    ]
    additional_notes = form_data.get("additional_notes")
    if additional_notes:
        body.extend(["", "附加说明:", additional_notes])
    message.set_content("\n".join(body))

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


__all__ = ["send_submission_email"]
