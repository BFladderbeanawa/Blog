from __future__ import annotations

from . import admin, auth_routes, profile, public


def register_routes(app) -> None:
    auth_routes.register_auth_routes(app)
    profile.register_profile_routes(app)
    public.register_public_routes(app)
    admin.register_admin_routes(app)


__all__ = ["register_routes"]
