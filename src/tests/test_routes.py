from pathlib import Path
import sys

import pytest

sys.path.append(str(Path(__file__).resolve().parents[1]))

from neko_ctf import create_app
from neko_ctf.bootstrap import bootstrap_defaults
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
    User,
)

flask_app = create_app()


@flask_app.route("/__trigger_internal_error")
def __trigger_internal_error():  # pragma: no cover - test-only helper
    raise RuntimeError("intentional test failure")


@pytest.fixture
def client():
    flask_app.config.update({
        "TESTING": True,
        "SECRET_KEY": "test-key",
        "MAIL_SERVER": None,
        "MAIL_RECIPIENT": None,
        "ADMIN_USERNAME": "testadmin",
        "ADMIN_PASSWORD": "testpass",
        "ADMIN_EMAIL": "testadmin@example.com",
        "CACHE_TYPE": "SimpleCache",
        "CACHE_REDIS_URL": None,
        "PROPAGATE_EXCEPTIONS": False,
    })

    with flask_app.app_context():
        db.session.remove()
        db.drop_all()
        bootstrap_defaults()

    with flask_app.test_client() as client:
        yield client

    with flask_app.app_context():
        db.session.remove()
        db.drop_all()
        bootstrap_defaults()


def test_homepage_ok(client):
    resp = client.get("/")
    assert resp.status_code == 200
    assert "NekoCTF" in resp.get_data(as_text=True)


def test_challenges_page_ok(client):
    resp = client.get("/challenges")
    assert resp.status_code == 200
    body = resp.get_data(as_text=True)
    assert "题目预览" in body
    assert "Nyan Overflow" in body
    assert "经典的栈溢出预告" in body


def test_challenges_page_empty_message(client):
    with flask_app.app_context():
        Challenge.query.delete()
        db.session.commit()

    resp = client.get("/challenges")
    assert resp.status_code == 200
    assert "暂时还没有公开题目" in resp.get_data(as_text=True)


def test_submit_page_get(client):
    resp = client.get("/submit")
    assert resp.status_code == 200
    body = resp.get_data(as_text=True)
    assert "分享你的原创题目" in body
    assert "在线投稿" in body


def test_submit_form_fallback(client):
    resp = client.post(
        "/submit",
        data={
            "team_name": "TestCats",
            "contact_email": "me@example.com",
            "message": "Here is our awesome challenge.",
        },
        follow_redirects=True,
    )
    body = resp.get_data(as_text=True)
    assert resp.status_code == 200
    assert "邮件服务暂未配置成功" in body


def test_admin_requires_login(client):
    resp = client.get("/admin/challenges")
    # Flask-Login redirects to login page
    assert resp.status_code == 302
    assert "/login" in resp.headers["Location"]


def test_admin_login_and_create_challenge(client):
    # Login with seeded admin credentials
    resp = client.post(
        "/login",
        data={"username": "testadmin", "password": "testpass"},
        follow_redirects=True,
    )
    assert resp.status_code == 200
    assert "欢迎回来" in resp.get_data(as_text=True)

    # Access new challenge page
    resp = client.get("/admin/challenges/new")
    assert resp.status_code == 200
    assert "创建新题目" in resp.get_data(as_text=True)

    resp = client.post(
        "/admin/challenges/new",
        data={
            "title": "Test Challenge",
            "category": "Misc",
            "difficulty": "Medium",
            "summary": "Short summary for testing challenge.",
            "content": "Testing admin create with full description.",
            "flag": "NekoCTF{admin_generated_flag}",
            "flag_label": "用户 Flag",
            "flag_slug": "user",
            "flag_points": "500",
            "is_visible": "on",
        },
        follow_redirects=True,
    )

    assert resp.status_code == 200
    assert "新的题目已发布" in resp.get_data(as_text=True)

    with flask_app.app_context():
        challenge = Challenge.query.filter_by(title="Test Challenge").first()
        assert challenge is not None
        challenge_id = challenge.id

    detail = client.get(f"/challenges/{challenge_id}")
    assert detail.status_code == 200
    detail_body = detail.get_data(as_text=True)
    assert "Short summary for testing challenge." in detail_body
    assert "Testing admin create with full description." in detail_body


def test_admin_site_content_management(client):
    # Login as admin first
    resp = client.post(
        "/login",
        data={"username": "testadmin", "password": "testpass"},
        follow_redirects=True,
    )
    assert resp.status_code == 200

    # Visit site studio page
    resp = client.get("/admin/site")
    body = resp.get_data(as_text=True)
    assert resp.status_code == 200
    assert "首页与站点内容管理" in body

    # Update event information
    resp = client.post(
        "/admin/site",
        data={
            "form_type": "event_update",
            "title": "超级喵星赛",
            "date_range": "2025.12.01 - 12.03",
            "location": "上海线下 + 线上",
            "cta_label": "立即报名",
            "cta_link": "/register",
            "cta_note": "报名即可领取喵星礼包。",
        },
        follow_redirects=True,
    )
    assert resp.status_code == 200
    assert "活动信息已更新" in resp.get_data(as_text=True)

    # Create a brand-new announcement
    resp = client.post(
        "/admin/site",
        data={
            "form_type": "announcement_create",
            "title": "巡回沙龙预告",
            "category": "活动",
            "description": "新一轮喵星沙龙将在 12 月启动。",
            "display_date": "2025.11.20",
            "display_order": "15",
            "is_visible": "on",
        },
        follow_redirects=True,
    )
    assert resp.status_code == 200
    assert "新的首页动态已创建" in resp.get_data(as_text=True)

    # Create highlight card
    resp = client.post(
        "/admin/site",
        data={
            "form_type": "highlight_create",
            "label": "参赛战队",
            "metric_key": "total_players",
            "note": "最新注册战队数量",
            "display_order": "12",
            "is_visible": "on",
        },
        follow_redirects=True,
    )
    assert resp.status_code == 200
    assert "新的数据高光已创建" in resp.get_data(as_text=True)

    # Update homepage textual settings
    resp = client.post(
        "/admin/site",
        data={
            "form_type": "settings_update",
            "leaderboard_placeholder_primary": "星际先锋",
            "leaderboard_placeholder_secondary": "银河候补",
            "leaderboard_tagline": "完成挑战即可点亮荣耀榜单。",
            "contact_email": "partnership@nekoctf.test",
        },
        follow_redirects=True,
    )
    assert resp.status_code == 200
    assert "首页文案已保存" in resp.get_data(as_text=True)

    with flask_app.app_context():
        event = SiteEvent.query.order_by(SiteEvent.id.asc()).first()
        assert event is not None
        assert event.title == "超级喵星赛"
        announcement = SiteAnnouncement.query.filter_by(title="巡回沙龙预告").first()
        assert announcement is not None and announcement.is_visible
        highlight = HighlightCard.query.filter_by(label="参赛战队").first()
        assert highlight is not None and highlight.metric_key == "total_players"
        assert SiteSetting.get_value("home.leaderboard.placeholder_primary") == "星际先锋"

    # Homepage should now display updated tagline and email
    resp = client.get("/")
    home_html = resp.get_data(as_text=True)
    assert "完成挑战即可点亮荣耀榜单" in home_html
    assert "partnership@nekoctf.test" in home_html


def _login_admin(client):
    return client.post(
        "/login",
        data={"username": "testadmin", "password": "testpass"},
        follow_redirects=True,
    )


def _verify_user_email(username: str) -> None:
    with flask_app.app_context():
        user = User.query.filter_by(username=username).first()
        assert user is not None, f"User '{username}' not found for verification"
        user.email_verified = True
        user.verification_token = None
        db.session.commit()


def test_admin_user_management_page(client):
    resp = _login_admin(client)
    assert resp.status_code == 200

    resp = client.get("/admin/users")
    assert resp.status_code == 200
    body = resp.get_data(as_text=True)
    assert "战队与管理员" in body
    assert "后台用户管理" in body


def test_admin_edit_user_bonus_and_password(client):
    _login_admin(client)

    with flask_app.app_context():
        user = User(username="player1", email="player1@example.com")
        user.set_password("originalpass")
        db.session.add(user)
        db.session.commit()
        user_id = user.id

    resp = client.post(
        f"/admin/users/{user_id}/edit",
        data={
            "username": "player-one",
            "email": "player-one@example.com",
            "bonus_points": "120",
            "new_password": "newsecret1",
            "confirm_password": "newsecret1",
        },
        follow_redirects=True,
    )
    body = resp.get_data(as_text=True)
    assert resp.status_code == 200
    assert "用户资料已更新" in body

    with flask_app.app_context():
        updated = db.session.get(User, user_id)
        assert updated.username == "player-one"
        assert updated.email == "player-one@example.com"
        assert updated.bonus_points == 120
        assert updated.check_password("newsecret1")


def test_admin_delete_user(client):
    _login_admin(client)

    with flask_app.app_context():
        user = User(username="tempdel", email="tempdel@example.com")
        user.set_password("tempdelpass")
        db.session.add(user)
        db.session.commit()
        user_id = user.id

    resp = client.post(
        f"/admin/users/{user_id}/delete",
        follow_redirects=True,
    )
    body = resp.get_data(as_text=True)
    assert resp.status_code == 200
    assert "用户已删除" in body

    with flask_app.app_context():
        assert db.session.get(User, user_id) is None


def test_register_and_login_flow(client):
    username = "playercat"
    password = "secure123!"
    resp = client.post(
        "/register",
        data={
            "username": username,
            "email": "player@example.com",
            "password": password,
            "confirm_password": password,
        },
        follow_redirects=True,
    )
    body = resp.get_data(as_text=True)
    assert resp.status_code == 200
    assert "注册成功" in body

    resp = client.get("/logout", follow_redirects=True)
    assert "你已安全退出" in resp.get_data(as_text=True)

    resp = client.post(
        "/login",
        data={"username": username, "password": password},
        follow_redirects=True,
    )
    assert resp.status_code == 200
    assert "欢迎回来" in resp.get_data(as_text=True)


def test_flag_submission_flow(client):
    username = "solver"
    password = "flag12345"
    client.post(
        "/register",
        data={
            "username": username,
            "email": "solver@example.com",
            "password": password,
            "confirm_password": password,
        },
        follow_redirects=True,
    )

    _verify_user_email(username)

    with flask_app.app_context():
        challenge = Challenge(
            title="Multi-Stage Test",
            category="Web",
            difficulty="Medium",
            summary="Two-phase flag test.",
            description="Validate multi-stage submission flow.",
            points=400,
            is_visible=True,
        )
        challenge.set_flag("NekoCTF{stage_fallback}")
        db.session.add(challenge)
        db.session.flush()

        stage_user = ChallengeFlag(
            challenge=challenge,
            slug="user",
            label="User Flag",
            points=150,
            display_order=1,
        )
        stage_user.set_flag("NekoCTF{alpha_stage}")

        stage_root = ChallengeFlag(
            challenge=challenge,
            slug="root",
            label="Root Flag",
            points=250,
            display_order=2,
        )
        stage_root.set_flag("NekoCTF{omega_stage}")

        db.session.add_all([stage_user, stage_root])
        challenge.points = stage_user.points + stage_root.points
        db.session.commit()

        challenge_id = challenge.id
        user_stage_flag = "NekoCTF{alpha_stage}"
        root_stage_flag = "NekoCTF{omega_stage}"
        user_stage_points = stage_user.points
        total_points = challenge.points

    resp = client.post(
        f"/challenges/{challenge_id}",
        data={"flag": "wrong_flag"},
        follow_redirects=True,
    )
    assert "flag 不正确" in resp.get_data(as_text=True)

    resp = client.post(
        f"/challenges/{challenge_id}",
        data={"flag": user_stage_flag},
        follow_redirects=True,
    )
    body = resp.get_data(as_text=True)
    assert "成功解锁 User Flag" in body
    assert f"获得 {user_stage_points} 分" in body

    resp = client.post(
        f"/challenges/{challenge_id}",
        data={"flag": user_stage_flag},
        follow_redirects=True,
    )
    assert "你已经解锁 User Flag" in resp.get_data(as_text=True)

    detail_after_first = client.get(f"/challenges/{challenge_id}")
    detail_body = detail_after_first.get_data(as_text=True)
    assert "已完成 1/2 个阶段" in detail_body
    assert "再接再厉喵！你已完成 1/2 个阶段" in detail_body

    listing_partial = client.get("/challenges")
    assert "进阶 1/2" in listing_partial.get_data(as_text=True)

    resp = client.post(
        f"/challenges/{challenge_id}",
        data={"flag": root_stage_flag},
        follow_redirects=True,
    )
    assert "成功解锁 Root Flag" in resp.get_data(as_text=True)

    resp = client.get("/leaderboard")
    leaderboard_body = resp.get_data(as_text=True)
    assert username in leaderboard_body
    assert "已解" in client.get("/challenges").get_data(as_text=True)
    assert str(total_points) in leaderboard_body
    row_fragment = leaderboard_body.split(f">{username}</a>")[-1].split("</tr>", 1)[0]
    assert "<td>1</td>" in row_fragment

    profile_page = client.get(f"/profile/{username}")
    profile_body = profile_page.get_data(as_text=True)
    assert "解题 1 次" in profile_body
    assert "所有 2 阶段已完成" in profile_body


def test_admin_adds_hint_and_player_sees_it(client):
    client.post(
        "/login",
        data={"username": "testadmin", "password": "testpass"},
        follow_redirects=True,
    )

    with flask_app.app_context():
        challenge = Challenge.query.first()
        challenge_id = challenge.id

    resp = client.post(
        f"/admin/challenges/{challenge_id}/hints",
        data={
            "title": "喵系线索",
            "content": "试试查看 robots.txt",
            "order": "1",
        },
        follow_redirects=True,
    )

    assert resp.status_code == 200
    assert "新的提示已添加" in resp.get_data(as_text=True)

    detail = client.get(f"/challenges/{challenge_id}")
    assert detail.status_code == 200
    body = detail.get_data(as_text=True)
    assert "试试查看 robots.txt" in body


def test_markdown_rendering_sanitized(client):
    with flask_app.app_context():
        challenge = Challenge.query.first()
        challenge.summary = "**Bold intro** with [link](https://example.com)"
        challenge.description = (
            "## Heading\n\nSome code:\n```python\nprint('hi')\n```\n"
            "<script>alert('bad')</script><a href=\"javascript:alert(1)\">xss</a>"
        )
        db.session.commit()
        challenge_id = challenge.id

    detail = client.get(f"/challenges/{challenge_id}")
    assert detail.status_code == 200
    body = detail.get_data(as_text=True)
    assert "<strong>Bold intro</strong>" in body
    assert "<h2>Heading" in body
    assert "print('hi')" in body
    assert "<script>alert('bad')</script>" not in body
    assert "javascript:alert" not in body

    listing = client.get("/challenges")
    listing_body = listing.get_data(as_text=True)
    assert "<strong>Bold intro" in listing_body
    assert "javascript:alert" not in listing_body


def test_custom_404_page(client):
    resp = client.get("/this-page-does-not-exist")
    assert resp.status_code == 404
    body = resp.get_data(as_text=True)
    assert "页面走丢了喵～" in body
    assert "返回喵城主页" in body


def test_internal_server_error_page(client):
    resp = client.get("/__trigger_internal_error")
    assert resp.status_code == 500
    body = resp.get_data(as_text=True)
    assert "服务器有点晕喵" in body
    assert "联系组织者" in body
