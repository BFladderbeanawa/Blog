import os


def _env_bool(key: str, default: bool) -> bool:
    value = os.environ.get(key)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


class Config:
    """Application configuration loaded from environment variables."""

    EVENT_NAME = os.environ.get("EVENT_NAME", "NekoCTF 2025")
    SECRET_KEY = os.environ.get("SECRET_KEY", "change-me-nekosecret")

    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or f"sqlite:///{os.path.join(BASE_DIR, 'neko_ctf.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    MAIL_SERVER = os.environ.get("MAIL_SERVER")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS = _env_bool("MAIL_USE_TLS", True)
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER") or MAIL_USERNAME
    MAIL_RECIPIENT = os.environ.get("MAIL_RECIPIENT") or MAIL_USERNAME

    ORGANIZER_EMAIL = os.environ.get("ORGANIZER_EMAIL", "organizers@nek0ctf.test")

    ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "nekoadmin")
    ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "nekoadminpass")
    ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@nek0ctf.test")

    SESSION_COOKIE_SECURE = _env_bool("SESSION_COOKIE_SECURE", False)
    REMEMBER_COOKIE_SECURE = _env_bool("REMEMBER_COOKIE_SECURE", False)
    SESSION_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = os.environ.get("SESSION_COOKIE_SAMESITE", "Lax")
    PREFERRED_URL_SCHEME = os.environ.get("PREFERRED_URL_SCHEME", "https")

    CACHE_DEFAULT_TIMEOUT = int(os.environ.get("CACHE_DEFAULT_TIMEOUT", 300))
    CACHE_KEY_PREFIX = os.environ.get("CACHE_KEY_PREFIX", "neko_ctf:")
    CACHE_REDIS_URL = os.environ.get("REDIS_URL")
    CACHE_TYPE = os.environ.get("CACHE_TYPE") or ("RedisCache" if CACHE_REDIS_URL else "SimpleCache")
    HOME_CACHE_TIMEOUT = int(os.environ.get("HOME_CACHE_TIMEOUT", CACHE_DEFAULT_TIMEOUT))
    LEADERBOARD_CACHE_TIMEOUT = int(os.environ.get("LEADERBOARD_CACHE_TIMEOUT", CACHE_DEFAULT_TIMEOUT))
