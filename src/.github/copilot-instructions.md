# NekoCTF 2025 Copilot Instructions

## Project Overview
Flask-based CTF (Capture The Flag) platform with neko (cat girl) theming. Supports multi-stage challenges, real-time leaderboards, admin panel, and Redis caching.

## Architecture & Key Concepts

### Application Factory Pattern
- Entry point: `neko_ctf:create_app()` (factory) or `neko_ctf:app` (singleton)
- Extensions initialized in `neko_ctf/extensions.py` and bound in `create_app()`
- Routes registered via module-specific functions in `neko_ctf/routes/__init__.py`
- Templates/static files live at project root, not in `neko_ctf/` package

### Multi-Stage Flag System
Challenges support **multiple flag stages** (e.g., user flag → root flag). Each `ChallengeFlag` has:
- `slug`: unique identifier per challenge (e.g., "user", "root")
- `points`: awarded independently
- `display_order`: controls presentation order
- Legacy challenges without stages get auto-backfilled with a single "legacy" stage

**Critical**: `Challenge.points` is a computed sum of all flag stages. Use `refresh_challenge_points()` after modifying flags.

### Security & Markdown Rendering
All user-facing Markdown (challenge descriptions, hints, announcements) passes through `render_markdown()`:
1. Converts Markdown to HTML via `markdown` library
2. Sanitizes with `bleach` (allowlist-based, blocks `<script>`, `javascript:` URIs)
3. Auto-adds `rel="nofollow noopener" target="_blank"` to external links

Admin forms store **raw Markdown**; templates call `.summary_html()` / `.description_html()` methods on models.

### Cache Invalidation Pattern
Home page and leaderboard are cached (Redis in prod, SimpleCache in dev). **Must invalidate** on:
- Admin edits (challenges, site content, announcements, highlights)
- Correct flag submissions
- Call `invalidate_public_cache()` from `neko_ctf.utils` to clear both `HOME_CACHE_KEY` and `LEADERBOARD_CACHE_KEY`

## Development Workflow

### Initial Setup
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Initialize database with seed data (resets tables if schema outdated)
$env:FLASK_APP = "neko_ctf:create_app"
flask bootstrap-data --with-reset

# Run dev server with auto-reload
flask run --reload
```

### Database Bootstrap Logic
`flask bootstrap-data` (`neko_ctf/bootstrap.py`):
1. **Auto-detects outdated schema**: If `challenges` table exists but lacks `points`/`flag_hash`/`summary` columns, drops all tables
2. Creates tables via `db.create_all()`
3. Seeds categories, difficulties, challenges (from `seed_data.py`)
4. Backfills flag stages for challenges created before multi-stage support
5. Creates default admin user from `ADMIN_USERNAME`/`ADMIN_PASSWORD` env vars

**When adding models**: Ensure `db.create_all()` includes them (import in `neko_ctf/__init__.py` or `models.py`).

### Configuration
All config in `config.py` reads from environment variables:
- `SECRET_KEY`: Flask session key (randomize in production!)
- `DATABASE_URL`: SQLAlchemy URI (defaults to SQLite in project root)
- `REDIS_URL`: Enables Redis caching (`CACHE_TYPE=RedisCache`)
- `CACHE_*_TIMEOUT`: Separate timeouts for home/leaderboard/default caches
- `SESSION_COOKIE_SECURE`: Set `true` for HTTPS-only cookies
- `ADMIN_*`: Bootstrap credentials
- `MAIL_*`: SMTP config for email notifications

### Testing
```powershell
pytest
```
Test client in `tests/test_routes.py` validates public/admin routes without running a server.

## Code Patterns & Conventions

### Route Registration
Routes are **not** decorated on standalone functions. Instead:
```python
def register_admin_routes(app):
    @app.route("/admin/challenges", endpoint="admin.admin_challenges")
    @admin_required
    def admin_challenges():
        # ...
```
Use `endpoint="namespace.action"` for `url_for()` calls. Import `admin_required` from `neko_ctf.auth` for admin-only views.

### Form Parsing Utilities
- `parse_int_field(value, default)`: Safe int parsing with fallback
- `parse_checkbox(value)`: Converts `"on"`/`"true"`/`"1"` to boolean
- `normalize_flag_slug(raw, fallback)`: Sanitizes flag slugs (lowercase, hyphens only)

### Admin CRUD Pattern
See `neko_ctf/routes/admin.py` for examples. Key steps:
1. Check `request.form.get("form_type")` to route multi-action forms
2. Validate required fields → flash error if missing
3. Query existing record or create new
4. Commit changes
5. Call `invalidate_public_cache()` if affects public views
6. Flash success message with 🐱 emoji (e.g., "题目已保存喵～")

### Highlight Cards (Home Page Stats)
Dynamic metrics configured in `HighlightCard` model. Computed in `neko_ctf/services/highlights.py`:
- `metric_key` maps to functions (e.g., `total_challenges` → `Challenge.query.count()`)
- Add new metrics by registering in `HIGHLIGHT_ALLOWED_KEYS` and `compute_highlight_value()`

### Email Submission (Challenge Authoring)
Optional feature for external challenge submissions. If `MAIL_SERVER` is configured, users can email proposals. Check `neko_ctf/services/email.py` for template.

## Production Deployment

### Linux Auto-Deploy Script
```bash
sudo bash scripts/install_production.sh
```
- Interactive wizard prompts for credentials/database if not set in env
- Generates `.env` and `.env.docker` with randomized `SECRET_KEY`
- Builds Docker image, starts `web` + `redis` services via docker-compose
- Runs `bootstrap_defaults()` inside container
- Configures systemd-like supervision (via Docker restart policies)

**Update existing deployment**:
```bash
cd /opt/neko_ctf
sudo docker compose pull
sudo docker compose build web
sudo docker compose up -d
sudo docker compose exec web python -c "from neko_ctf import create_app; from neko_ctf.bootstrap import bootstrap_defaults; bootstrap_defaults(create_app())"
```

### Manual Deployment (Gunicorn/Waitress)
```bash
gunicorn "neko_ctf:app" --bind 0.0.0.0:8000 --workers 3 --access-logfile -
```
Set `FLASK_ENV=production`, configure database, enable Redis, secure cookies (`SESSION_COOKIE_SECURE=true`).

## Common Tasks

### Adding a New Challenge Category/Difficulty
1. Add entry to `DEFAULT_CATEGORIES` or `DEFAULT_DIFFICULTIES` in `seed_data.py`
2. Run `flask bootstrap-data` (only seeds if table is empty; manual insert for existing DBs)
3. Or use admin UI at `/admin/challenges` to add via form

### Modifying Challenge Schema
1. Update `Challenge` model in `neko_ctf/models.py`
2. Bootstrap logic auto-drops tables if missing expected columns; add detection in `bootstrap_defaults()` if needed
3. For complex migrations, consider Alembic (not currently integrated)

### Adding a Custom Cache Key
1. Define key in `neko_ctf/cache_config.py` (e.g., `CUSTOM_CACHE_KEY = "neko_ctf:view:custom"`)
2. Use `@cache.cached(timeout=..., key_prefix=CUSTOM_CACHE_KEY)` on route
3. Invalidate in relevant mutation endpoints via `cache.delete(CUSTOM_CACHE_KEY)`

## Known Gotchas
- **Don't use `app.py` for new code**: It's a backward-compat shim; import from `neko_ctf` package
- **Flag validation**: `Challenge.verify_flag()` checks both `flag_hash` (legacy) and `ChallengeFlag` stages
- **Templates expect methods, not properties**: Use `challenge.summary_html()`, not `challenge.summary` (models return raw Markdown)
- **Cache race conditions**: High-concurrency scenarios may see stale leaderboard for ~300s; adjust `LEADERBOARD_CACHE_TIMEOUT` or use fine-grained invalidation
