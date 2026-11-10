#!/usr/bin/env bash

set -euo pipefail

#
# NekoCTF 2025 production installer (Docker edition)
#
# This script prepares a Debian/Ubuntu host for running the NekoCTF web app
# via Docker Compose:
#   1. Installs Docker Engine, compose plugin, and helper tools
#   2. Syncs the repository into the deployment directory
#   3. Generates or updates the application .env file
#   4. Emits docker-compose.yml and container env definitions
#   5. Builds the application image, boots the stack, and seeds the database
#
# Customise behaviour with environment variables before invoking, e.g.:
#   APP_DIR=/opt/neko_ctf APP_PORT=9000 bash scripts/install_production.sh
#
# The script assumes it is executed from inside a checked-out repository.
###

NON_INTERACTIVE=${NON_INTERACTIVE:-0}
SKIP_BOOTSTRAP=${SKIP_BOOTSTRAP:-0}

prompt_var() {
	local __var_name=$1
	local __prompt=$2
	local __default=$3
	local __current=${!__var_name:-}
	local __value

	if [[ -n "$__current" ]]; then
		__value="$__current"
	elif [[ "$NON_INTERACTIVE" -eq 1 ]]; then
		__value="$__default"
	else
		while true; do
			read -r -p "[?] $__prompt [$__default]: " __input || true
			__value="${__input:-$__default}"
			if [[ -n "$__value" ]]; then
				break
			fi
			echo "  -> 输入不能为空，请重新输入。"
		done
	fi

	printf -v "$__var_name" '%s' "$__value"
}

prompt_optional_var() {
	local __var_name=$1
	local __prompt=$2
	local __default=$3
	local __current=${!__var_name:-}
	local __value

	if [[ -n "$__current" ]]; then
		__value="$__current"
	elif [[ "$NON_INTERACTIVE" -eq 1 ]]; then
		__value="$__default"
	else
		read -r -p "[?] $__prompt [$__default]: " __input || true
		__value="${__input:-$__default}"
	fi

	printf -v "$__var_name" '%s' "$__value"
}

prompt_yes_no() {
	local __prompt=$1
	local __default=${2:-y}
	local __value

	if [[ "$NON_INTERACTIVE" -eq 1 ]]; then
		[[ "${__default,,}" == "y" ]] && return 0 || return 1
	fi

	while true; do
		read -r -p "[?] $__prompt [$__default]: " __value || true
		__value="${__value:-$__default}"
		case "${__value,,}" in
			y|yes)
			return 0
			;;
			n|no)
			return 1
			;;
		esac
		echo "  -> 请输入 y 或 n。"
	done
}

prompt_password() {
	local __var_name=$1
	local __prompt=$2
	local __min_length=${3:-12}
	local __current=${!__var_name:-}

	if [[ -n "$__current" ]]; then
		printf -v "$__var_name" '%s' "$__current"
		return
	fi

	if [[ "$NON_INTERACTIVE" -eq 1 ]]; then
		printf -v "$__var_name" '%s' "$(openssl rand -base64 24)"
		return
	fi

	while true; do
		read -rsp "[?] $__prompt: " __password || true
		echo
		read -rsp "[?] 请再次输入确认: " __confirm || true
		echo
		if [[ "$__password" != "$__confirm" ]]; then
			echo "  -> 两次输入不一致，请重新输入。"
			continue
		fi
		if (( ${#__password} < __min_length )); then
			echo "  -> 为了安全，请至少输入 $__min_length 个字符。"
			continue
		fi
		printf -v "$__var_name" '%s' "$__password"
		break
	done
}

prompt_optional_secret() {
	local __var_name=$1
	local __prompt=$2
	local __default=${3:-}
	local __current=${!__var_name:-}
	local __value

	if [[ -n "$__current" ]]; then
		printf -v "$__var_name" '%s' "$__current"
		return
	fi

	if [[ "$NON_INTERACTIVE" -eq 1 ]]; then
		printf -v "$__var_name" '%s' "$__default"
		return
	fi

	read -rsp "[?] $__prompt (可留空跳过): " __value || true
	echo
	if [[ -z "$__value" ]]; then
		__value="$__default"
	fi
	printf -v "$__var_name" '%s' "$__value"
}

escape_env_value() {
	local __value=$1
	__value=${__value//\/\\}
	__value=${__value//"/\"}
	printf '%s' "$__value"
}

upsert_env_var() {
	local __file=$1
	local __key=$2
	local __value=$3
	local __escaped
	__escaped=$(escape_env_value "$__value")

	if grep -q "^$__key=" "$__file"; then
		sed -i "s|^$__key=.*|$__key=\"$__escaped\"|" "$__file"
	else
		echo "$__key=\"$__escaped\"" >>"$__file"
	fi
}

ensure_env_var() {
	local __file=$1
	local __key=$2
	local __value=$3
	local __escaped

	if grep -q "^$__key=" "$__file"; then
		return
	fi

	__escaped=$(escape_env_value "$__value")
	echo "$__key=\"$__escaped\"" >>"$__file"
}

write_container_env() {
	local __source=$1
	local __dest=$2
	python3 <<'PY' "$__source" "$__dest"
import sys
from pathlib import Path

src = Path(sys.argv[1])
dest = Path(sys.argv[2])
entries = []

for line in src.read_text(encoding="utf-8").splitlines():
	stripped = line.strip()
	if not stripped or stripped.startswith("#"):
		continue
	if "=" not in stripped:
		continue
	key, value = stripped.split("=", 1)
	key = key.strip()
	value = value.strip().strip('"').strip("'")
	entries.append((key, value))

with dest.open("w", encoding="utf-8") as fh:
	for key, value in entries:
		fh.write(f"{key}={value}\n")
PY
}

if [[ $EUID -ne 0 ]]; then
	echo "[NekoCTF] 请以 root 权限运行（使用 sudo）。" >&2
	exit 1
fi

APT_PACKAGES=(docker.io docker-compose-plugin git rsync python3 python3-venv python3-pip openssl)

APP_DIR=${APP_DIR:-/opt/neko_ctf}
APP_PORT=${APP_PORT:-8000}
PROJECT_NAME=${PROJECT_NAME:-neko_ctf}
IMAGE_NAME=${IMAGE_NAME:-neko_ctf_web:latest}
COMPOSE_FILE=${COMPOSE_FILE:-$APP_DIR/docker-compose.yml}
ENV_FILE=${ENV_FILE:-$APP_DIR/.env}
CONTAINER_ENV_FILE=${CONTAINER_ENV_FILE:-$APP_DIR/.env.docker}
WORK_DIR=${WORK_DIR:-$APP_DIR/app}
GUNICORN_WORKERS=${GUNICORN_WORKERS:-3}
REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

install_prerequisites() {
	echo "[NekoCTF] Installing Docker runtime and helper packages..."
	apt-get update
	DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends "${APT_PACKAGES[@]}"

	if systemctl list-unit-files docker.service >/dev/null 2>&1; then
		systemctl enable --now docker
	fi

	if ! command -v docker >/dev/null 2>&1; then
		echo "[NekoCTF] docker 命令不可用，请检查安装日志。" >&2
		exit 1
	fi

	if docker compose version >/dev/null 2>&1; then
		DOCKER_COMPOSE_BIN=(docker compose)
	elif command -v docker-compose >/dev/null 2>&1; then
		echo "[NekoCTF] 检测到 legacy docker-compose，将继续使用。"
		DOCKER_COMPOSE_BIN=(docker-compose)
	else
		echo "[NekoCTF] 未找到 docker compose 插件，请确认安装 docker-compose-plugin 包。" >&2
		exit 1
	fi
}

sync_repository() {
	echo "[NekoCTF] Syncing repository into $WORK_DIR ..."
	mkdir -p "$WORK_DIR"
	rsync -a --delete --exclude "*.pyc" --exclude "__pycache__" --exclude ".git" --exclude ".venv" \
		"$REPO_ROOT"/ "$WORK_DIR"/
}

generate_env_file() {
	if [[ -f "$ENV_FILE" ]]; then
		echo "[NekoCTF] 检测到现有环境文件 $ENV_FILE，跳过生成可交互部分。"
		ensure_env_var "$ENV_FILE" "REDIS_URL" "${REDIS_URL:-redis://redis:6379/0}"
		ensure_env_var "$ENV_FILE" "CACHE_TYPE" "${CACHE_TYPE:-RedisCache}"
		ensure_env_var "$ENV_FILE" "CACHE_DEFAULT_TIMEOUT" "${CACHE_DEFAULT_TIMEOUT:-300}"
		ensure_env_var "$ENV_FILE" "HOME_CACHE_TIMEOUT" "${HOME_CACHE_TIMEOUT:-120}"
		ensure_env_var "$ENV_FILE" "LEADERBOARD_CACHE_TIMEOUT" "${LEADERBOARD_CACHE_TIMEOUT:-120}"
		ensure_env_var "$ENV_FILE" "CACHE_KEY_PREFIX" "${CACHE_KEY_PREFIX:-neko_ctf:}"
		ensure_env_var "$ENV_FILE" "SESSION_COOKIE_SECURE" "${SESSION_COOKIE_SECURE:-true}"
		ensure_env_var "$ENV_FILE" "REMEMBER_COOKIE_SECURE" "${REMEMBER_COOKIE_SECURE:-true}"
		ensure_env_var "$ENV_FILE" "GUNICORN_WORKERS" "$GUNICORN_WORKERS"
		return
	fi

	echo "[NekoCTF] 未检测到环境文件，将启动交互式部署向导。"
	if [[ "$NON_INTERACTIVE" -eq 1 ]]; then
		echo "[NekoCTF] NON_INTERACTIVE=1 已启用，将使用默认值或外部传入的环境变量。"
	else
		echo "[NekoCTF] 按提示填写关键信息，直接回车可接受括号内的默认值。"
	fi

	prompt_var EVENT_NAME "赛事显示名称" "${EVENT_NAME:-NekoCTF 2025}"
	prompt_var ORGANIZER_EMAIL "组织者联系邮箱" "${ORGANIZER_EMAIL:-organizers@nek0ctf.test}"
	prompt_var ADMIN_USERNAME "管理员用户名" "${ADMIN_USERNAME:-nekoadmin}"
	prompt_password ADMIN_PASSWORD "管理员密码 (至少 12 位)"
	organizer_domain=${ORGANIZER_EMAIL##*@}
	if [[ "$organizer_domain" == "$ORGANIZER_EMAIL" ]] || [[ -z "$organizer_domain" ]]; then
		organizer_domain_hint="nekoc.tf"
	else
		organizer_domain_hint="$organizer_domain"
	fi
	default_admin_email="${ADMIN_EMAIL:-admin@${organizer_domain_hint}}"
	prompt_optional_var ADMIN_EMAIL "管理员联系邮箱" "$default_admin_email"

	if prompt_yes_no "是否使用外部数据库（推荐 PostgreSQL/MySQL）?" "n"; then
		while true; do
			prompt_optional_var DATABASE_URL "请输入 SQLAlchemy 数据库连接串" "${DATABASE_URL:-}"
			if [[ -n "$DATABASE_URL" ]]; then
				break
			fi
			echo "  -> 连接串不能为空，请重新输入。"
		done
	else
		DATABASE_URL="sqlite:////data/neko_ctf.db"
	fi

	if [[ -z ${SECRET_KEY:-} ]]; then
		SECRET_KEY=$(openssl rand -hex 32)
		if [[ "$NON_INTERACTIVE" -ne 1 ]]; then
			echo "[NekoCTF] 已为 Flask 生成随机 SECRET_KEY。"
		fi
	fi

	MAIL_PORT=${MAIL_PORT:-587}
	MAIL_USE_TLS="true"
	MAIL_DEFAULT_SENDER=${MAIL_DEFAULT_SENDER:-}
	MAIL_RECIPIENT=${MAIL_RECIPIENT:-$ORGANIZER_EMAIL}
	if prompt_yes_no "是否立即配置 SMTP 邮件通道用于题目投稿通知?" "n"; then
		prompt_var MAIL_SERVER "SMTP 服务器地址" "${MAIL_SERVER:-smtp.example.com}"
		while true; do
			prompt_var MAIL_PORT "SMTP 端口" "$MAIL_PORT"
			if [[ "$MAIL_PORT" =~ ^[0-9]+$ ]]; then
				break
			fi
			echo "  -> 端口必须为数字。"
		done
		if prompt_yes_no "SMTP 是否启用 TLS" "y"; then
			MAIL_USE_TLS="true"
		else
			MAIL_USE_TLS="false"
		fi
		prompt_optional_var MAIL_USERNAME "SMTP 登录用户名 (可留空)" "${MAIL_USERNAME:-}"
		prompt_optional_secret MAIL_PASSWORD "SMTP 登录密码"
		if [[ -z "$MAIL_DEFAULT_SENDER" ]]; then
			if [[ -n "$MAIL_USERNAME" ]]; then
				MAIL_DEFAULT_SENDER="$MAIL_USERNAME"
			else
				MAIL_DEFAULT_SENDER="$ORGANIZER_EMAIL"
			fi
		fi
		prompt_optional_var MAIL_DEFAULT_SENDER "SMTP 发件人地址" "$MAIL_DEFAULT_SENDER"
		prompt_optional_var MAIL_RECIPIENT "投稿通知接收邮箱" "$MAIL_RECIPIENT"
	else
		MAIL_SERVER=""
		MAIL_PORT=${MAIL_PORT:-587}
		MAIL_USE_TLS="true"
		MAIL_USERNAME=""
		MAIL_PASSWORD=""
		MAIL_DEFAULT_SENDER=""
		MAIL_RECIPIENT="$MAIL_RECIPIENT"
	fi

	REDIS_URL=${REDIS_URL:-redis://redis:6379/0}
	CACHE_TYPE=${CACHE_TYPE:-RedisCache}
	CACHE_DEFAULT_TIMEOUT=${CACHE_DEFAULT_TIMEOUT:-300}
	HOME_CACHE_TIMEOUT=${HOME_CACHE_TIMEOUT:-120}
	LEADERBOARD_CACHE_TIMEOUT=${LEADERBOARD_CACHE_TIMEOUT:-120}
	CACHE_KEY_PREFIX=${CACHE_KEY_PREFIX:-neko_ctf:}

	SESSION_COOKIE_SECURE=${SESSION_COOKIE_SECURE:-true}
	REMEMBER_COOKIE_SECURE=${REMEMBER_COOKIE_SECURE:-true}

	cat >"$ENV_FILE" <<EOF
FLASK_ENV="production"
SECRET_KEY="$(escape_env_value "$SECRET_KEY")"
EVENT_NAME="$(escape_env_value "$EVENT_NAME")"
DATABASE_URL="$(escape_env_value "$DATABASE_URL")"
ORGANIZER_EMAIL="$(escape_env_value "$ORGANIZER_EMAIL")"
MAIL_SERVER="$(escape_env_value "$MAIL_SERVER")"
MAIL_PORT=$MAIL_PORT
MAIL_USE_TLS=$MAIL_USE_TLS
MAIL_USERNAME="$(escape_env_value "$MAIL_USERNAME")"
MAIL_PASSWORD="$(escape_env_value "$MAIL_PASSWORD")"
MAIL_DEFAULT_SENDER="$(escape_env_value "$MAIL_DEFAULT_SENDER")"
MAIL_RECIPIENT="$(escape_env_value "$MAIL_RECIPIENT")"
ADMIN_USERNAME="$(escape_env_value "$ADMIN_USERNAME")"
ADMIN_PASSWORD="$(escape_env_value "$ADMIN_PASSWORD")"
ADMIN_EMAIL="$(escape_env_value "$ADMIN_EMAIL")"
SESSION_COOKIE_SECURE=$SESSION_COOKIE_SECURE
REMEMBER_COOKIE_SECURE=$REMEMBER_COOKIE_SECURE
REDIS_URL="$(escape_env_value "$REDIS_URL")"
CACHE_TYPE=$CACHE_TYPE
CACHE_DEFAULT_TIMEOUT=$CACHE_DEFAULT_TIMEOUT
HOME_CACHE_TIMEOUT=$HOME_CACHE_TIMEOUT
LEADERBOARD_CACHE_TIMEOUT=$LEADERBOARD_CACHE_TIMEOUT
CACHE_KEY_PREFIX="$(escape_env_value "$CACHE_KEY_PREFIX")"
GUNICORN_WORKERS="$GUNICORN_WORKERS"
EOF
	chmod 640 "$ENV_FILE"
	chown root:root "$ENV_FILE"
	printf '[NekoCTF] 已生成 %s，请妥善保管凭据。\n' "$ENV_FILE"
}

write_compose_file() {
	local env_basename
	env_basename=$(basename "$CONTAINER_ENV_FILE")
	cat >"$COMPOSE_FILE" <<EOF
version: "3.9"

services:
  web:
    container_name: ${PROJECT_NAME}_web
    build:
      context: ./app
      dockerfile: Dockerfile
    image: ${IMAGE_NAME}
    env_file:
      - ${env_basename}
    ports:
      - "${APP_PORT}:8000"
    volumes:
      - sqlite_data:/data
    depends_on:
      redis:
        condition: service_started
    restart: unless-stopped
  redis:
    image: redis:7.2-alpine
    container_name: ${PROJECT_NAME}_redis
    command:
      - redis-server
      - --save
      - "900"
      - "1"
      - --loglevel
      - warning
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
  sqlite_data:
EOF
}

compose() {
	"${DOCKER_COMPOSE_BIN[@]}" -f "$COMPOSE_FILE" -p "$PROJECT_NAME" "$@"
}

bootstrap_database() {
	if [[ "$SKIP_BOOTSTRAP" -eq 1 ]]; then
		return
	fi
	echo "[NekoCTF] Running bootstrap_defaults() inside container..."
	compose run --rm web python -c 'from neko_ctf import create_app; from neko_ctf.bootstrap import bootstrap_defaults; bootstrap_defaults(create_app())' >/dev/null
}

summarise_install() {
	set -o allexport
	source "$ENV_FILE"
	set +o allexport

	db_summary="外部数据库 (${DATABASE_URL})"
	if [[ "${DATABASE_URL}" == sqlite:////* ]]; then
		db_summary="SQLite 数据卷 (${DATABASE_URL#sqlite:////})"
	fi

	if [[ -n "${MAIL_SERVER:-}" ]]; then
		smtp_summary="已配置 ${MAIL_SERVER}:${MAIL_PORT} (TLS=${MAIL_USE_TLS})"
	else
		smtp_summary="未配置 SMTP，将提示投稿者手动邮件，建议尽快补充"
	fi

	redis_summary="${REDIS_URL:-redis://redis:6379/0}"

	echo "[NekoCTF] 核心配置概览："
	printf '  • 管理员账号：%s\n' "${ADMIN_USERNAME:-未设置}"
	printf '  • 数据库：%s\n' "$db_summary"
	printf '  • Redis：%s\n' "$redis_summary"
	printf '  • 邮件通道：%s\n' "$smtp_summary"
	printf '  • Docker Compose 项目：%s\n' "$PROJECT_NAME"
	printf '  • 暴露端口：%s -> 8000\n' "$APP_PORT"
}

install_prerequisites
sync_repository
generate_env_file
write_container_env "$ENV_FILE" "$CONTAINER_ENV_FILE"
chmod 640 "$CONTAINER_ENV_FILE"
chown root:root "$CONTAINER_ENV_FILE"
write_compose_file

pushd "$APP_DIR" >/dev/null

compose config >/dev/null

echo "[NekoCTF] Building application image..."
compose build web

echo "[NekoCTF] Starting Docker stack..."
compose up -d

if ! compose ps >/dev/null 2>&1; then
	echo "[NekoCTF] docker compose ps 执行失败，请检查 Docker 服务。" >&2
	exit 1
fi

bootstrap_database

echo "[NekoCTF] 当前容器状态："
compose ps

popd >/dev/null

summarise_install

echo "[NekoCTF] 下一步建议："
printf '  1. 将 Nginx/Caddy 配置为反向代理，并为 %s 端口添加 HTTPS 终端。\n' "$APP_PORT"
printf '  2. 保护并备份 %s/.env，建议迁移密钥到受管秘密存储。\n' "$APP_DIR"
printf '  3. 配置日志采集，可使用 `docker compose logs -f web` 进行排错。\n'
printf '  4. 定期运行 `docker compose pull && docker compose up -d` 获取最新镜像。\n'
printf '  5. 使用 `docker compose exec web flask bootstrap-data --with-reset` 在需要时重置数据。\n'
