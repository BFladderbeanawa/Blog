from __future__ import annotations

from pathlib import Path

import click
from flask import Flask

from config import Config

from .auth import register_user_loader
from .bootstrap import bootstrap_defaults
from .cache_config import configure_cache_settings
from .extensions import cache, db, login_manager
from .routes import register_routes


PACKAGE_ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = PACKAGE_ROOT.parent


def create_app(config_class: type[Config] = Config) -> Flask:
	app = Flask(
		__name__,
		template_folder=str(PROJECT_ROOT / "templates"),
		static_folder=str(PROJECT_ROOT / "static"),
	)
	app.config.from_object(config_class)

	_register_extensions(app)
	configure_cache_settings(app)
	register_routes(app)
	_register_context_processors(app)
	_register_cli_commands(app)

	return app


def _register_extensions(app: Flask) -> None:
	db.init_app(app)
	login_manager.init_app(app)
	login_manager.login_view = "public.login"
	login_manager.login_message_category = "warning"
	cache.init_app(app)
	register_user_loader()


def _register_context_processors(app: Flask) -> None:
	@app.context_processor
	def inject_defaults():
		return {
			"event_name": app.config.get("EVENT_NAME", "NekoCTF"),
		}


def _register_cli_commands(app: Flask) -> None:
	@app.cli.command("bootstrap-data")
	@click.option("--with-reset", is_flag=True, help="Drop existing tables before seeding data.")
	def bootstrap_data(with_reset: bool) -> None:
		"""Seed the database with default challenges, categories, and announcements."""

		with app.app_context():
			if with_reset:
				db.drop_all()
			bootstrap_defaults(app)
		click.secho("Database seed completed.", fg="green")


app = create_app()


__all__ = ["app", "create_app"]
