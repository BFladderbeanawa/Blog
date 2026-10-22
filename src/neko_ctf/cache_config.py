HOME_CACHE_KEY: str = "neko_ctf:view:home"
LEADERBOARD_CACHE_KEY: str = "neko_ctf:view:leaderboard"
HOME_CACHE_TIMEOUT: int = 300
LEADERBOARD_CACHE_TIMEOUT: int = 300


def configure_cache_settings(app) -> None:
    global HOME_CACHE_KEY, LEADERBOARD_CACHE_KEY, HOME_CACHE_TIMEOUT, LEADERBOARD_CACHE_TIMEOUT

    prefix = app.config.get("CACHE_KEY_PREFIX", "neko_ctf:")
    HOME_CACHE_KEY = prefix + "view:home"
    LEADERBOARD_CACHE_KEY = prefix + "view:leaderboard"

    default_timeout = app.config.get("CACHE_DEFAULT_TIMEOUT", 300)
    HOME_CACHE_TIMEOUT = app.config.get("HOME_CACHE_TIMEOUT", default_timeout)
    LEADERBOARD_CACHE_TIMEOUT = app.config.get("LEADERBOARD_CACHE_TIMEOUT", default_timeout)
