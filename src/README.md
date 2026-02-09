# NekoCTF 2025 官方站点

欢迎来到 NekoCTF 的第一届赛事官网！本站基于 Flask 构建，提供二次元风格主页、题目介绍预览、动态排行榜、玩家登录与 flag 提交入口，以及后台题库管理与邮件制题提交功能，帮助战队快速了解赛事氛围并参与到题目共创中。

## ✨ 功能一览

- **霓虹二次元主页**：猫娘主题视觉与动态元素，凸显 NekoCTF 品牌调性。
- **题目介绍页**：所有公开题目从数据库动态渲染，列表侧重展示精简题目简介。
- **排行榜页**：自动按解题得分、最后提交时间实时排序。
- **玩家系统**：支持战队注册 / 登录，显示个人解题进度。
- **题目详情 + Flag 提交**：独立详情页内区分题目简介与完整内容，并提供 flag 提交表单。
- **提示系统**：管理员可为题目配置多条提示，选手在详情页按顺序查看。
- **富文本题面**：题目简介与内容支持 Markdown（含代码块、表格），在前台渲染为经过清洗的安全 HTML。

## 🐧 Linux 一键生产部署脚本（推荐）

适用于 Debian / Ubuntu 服务器，可一次性完成依赖安装、部署目录构建、虚拟环境、数据库初始化与 systemd 服务配置。首次运行会启动交互式向导，引导你填写管理员账号、数据库连接、SMTP 通知等关键信息。请确保脚本在仓库根目录运行：

```bash
sudo bash scripts/install_production.sh
```

默认会：

- 安装 Docker Engine、docker compose 插件及基础工具（`git`, `rsync`, `python3`, `openssl`）
- 将仓库同步到 `/opt/neko_ctf/app`（可通过 `APP_DIR` 覆盖）
- 引导生成 `/opt/neko_ctf/.env`（同时派生 `.env.docker`）：随机化 `SECRET_KEY`，确认管理员账号/密码、数据库连接、SMTP 与缓存配置
- 生成 `docker-compose.yml`，构建 `neko_ctf_web` 镜像并启动 `web`、`redis` 服务栈
- 在容器内部执行 `bootstrap_defaults()` 初始化数据库，随后输出部署摘要与检查清单

脚本会在 `.env` 中生成（或补齐）`REDIS_URL`、`CACHE_TYPE=RedisCache`、Cookie 安全选项等变量，并同步生成供容器读取的 `.env.docker`。若已有配置文件，缺失项会自动追加默认值。生产环境建议将敏感变量迁移到受管秘密存储。

自定义示例：

```bash
APP_DIR=/srv/neko_ctf \
APP_PORT=9000 \
IMAGE_NAME=registry.example.com/neko_ctf:prod \
GUNICORN_WORKERS=4 \
sudo bash scripts/install_production.sh
```

首次部署后可再次审阅 `/opt/neko_ctf/.env`（及 `.env.docker`），确认凭据与连接串无误，然后执行：

```bash
cd /opt/neko_ctf
sudo docker compose ps
sudo docker compose logs -f web
```

更新线上版本时可再次运行脚本，或参考脚本末尾输出的命令块：

```bash
sudo -i <<'SH'
set -euo pipefail
APP_DIR=${APP_DIR:-/opt/neko_ctf}
cd "$APP_DIR"
docker compose pull
docker compose build web
docker compose up -d
docker compose exec web python -c "from neko_ctf import create_app; from neko_ctf.bootstrap import bootstrap_defaults; bootstrap_defaults(create_app())"
SH
```

> 提示：可使用 `docker compose logs -f web` 查看应用输出，需要持久化日志时建议在主机或集中式日志平台中追加采集策略。

> 自动化场景可设置 `NON_INTERACTIVE=1` 并提前通过环境变量覆盖所有提示项（如 `ADMIN_PASSWORD`、`DATABASE_URL` 等），脚本将跳过向导但仍会生成安全默认值（缺失变量会随机化后写入 `.env`）。

## 🚀 快速开始

```pwsh
# 创建并激活虚拟环境（可选但推荐）
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 安装依赖
pip install -r requirements.txt

# 配置 Flask 应用工厂并初始化数据库（首次运行或结构变更后执行）
$env:FLASK_APP = "neko_ctf:create_app"
flask bootstrap-data --with-reset
# 或使用兼容命令： python -c "from app import bootstrap_defaults; bootstrap_defaults()"

# 运行开发服务器
flask run --reload
```

浏览器访问 `http://127.0.0.1:5000` 即可查看网站。

## ⚡ Redis 缓存

项目内置 [Flask-Caching](https://flask-caching.readthedocs.io/) 支持，默认在本地开发环境使用内存缓存（`SimpleCache`）。若希望体验与生产一致的性能，可按照以下步骤启用 Redis：

1. 安装并启动 Redis 服务（例如在 macOS 上使用 `brew install redis`，在 Ubuntu 上使用 `sudo apt install redis-server`）。
2. 设置环境变量 `REDIS_URL` 指向实例地址，例如 `redis://127.0.0.1:6379/0`。
3. （可选）设置 `CACHE_TYPE=RedisCache` 或自定义超时时间（`CACHE_DEFAULT_TIMEOUT`、`HOME_CACHE_TIMEOUT`、`LEADERBOARD_CACHE_TIMEOUT`）。

启用后首页和排行榜将被自动缓存，并在管理员更新内容或选手提交 flag 时即时失效，确保兼顾性能与实时性。

## 📬 邮件提交通道配置（可选）

默认情况下，题目提交表单会尝试通过 SMTP 将内容发送到组织者邮箱。如果尚未配置，将自动提示参赛者使用组织者邮箱手动发送。

| 环境变量 | 说明 |
| --- | --- |
| `EVENT_NAME` | 活动名称，默认 `NekoCTF 2025` |
| `SECRET_KEY` | Flask 会话密钥，生产环境务必自定义 |
| `DATABASE_URL` | SQLAlchemy 数据库连接串，默认使用项目根目录下的 `neko_ctf.db` |
| `MAIL_SERVER` | SMTP 服务器地址，如 `smtp.gmail.com` |
| `MAIL_PORT` | SMTP 端口，默认 `587` |
| `MAIL_USE_TLS` | 是否启用 TLS，默认 `true` |
| `MAIL_USERNAME` | SMTP 登录用户名 |
| `MAIL_PASSWORD` | SMTP 登录密码或应用专用密码 |
| `MAIL_DEFAULT_SENDER` | 邮件发送人地址，默认使用用户名 |
| `MAIL_RECIPIENT` | 接收题目的组织者邮箱，默认使用用户名 |
| `ORGANIZER_EMAIL` | 页面展示的组织者邮箱，默认 `organizers@nek0ctf.test` |
| `ADMIN_USERNAME` | 默认管理员用户名，默认 `nekoadmin` |
| `ADMIN_PASSWORD` | 默认管理员密码，默认 `nekoadminpass` |
| `ADMIN_EMAIL` | 默认管理员邮箱，用于展示和联系 |
| `REDIS_URL` | Redis 连接 URI，配置后自动启用 Redis 缓存，如 `redis://127.0.0.1:6379/0` |
| `CACHE_TYPE` | Flask-Caching 缓存类型，默认为检测 `REDIS_URL` 后决定，生产建议设为 `RedisCache` |
| `CACHE_DEFAULT_TIMEOUT` | 缓存默认过期秒数，默认 `300` |
| `HOME_CACHE_TIMEOUT` | 首页缓存过期秒数，默认同 `CACHE_DEFAULT_TIMEOUT` |
| `LEADERBOARD_CACHE_TIMEOUT` | 排行榜缓存过期秒数，默认同 `CACHE_DEFAULT_TIMEOUT` |
| `CACHE_KEY_PREFIX` | 缓存键前缀，默认 `neko_ctf:` |

配置完成后，可以通过以下命令导出（示例 PowerShell）：

```pwsh
$env:MAIL_SERVER = "smtp.example.com"
$env:MAIL_PORT = "587"
$env:MAIL_USERNAME = "nora@example.com"
$env:MAIL_PASSWORD = "app-password"
$env:MAIL_RECIPIENT = "organizers@nek0ctf.test"
$env:ORGANIZER_EMAIL = "organizers@nek0ctf.test"
$env:ADMIN_USERNAME = "ichika"
$env:ADMIN_PASSWORD = "super-secret-pass"
$env:ADMIN_EMAIL = "ichika@example.com"
```



## 🛡️ 生产部署指南

> TL;DR：使用独立的虚拟环境 ➜ 配置强随机密钥与数据库 ➜ 运行一次 `bootstrap_defaults()` 建表 ➜ 通过 WSGI（Gunicorn/Waitress）+ 反向代理上线，并确保 HTTPS 与安全 Cookie。

### 1. 准备运行环境

- 建议在 Linux 服务器上部署，并创建专用系统用户。
- 使用虚拟环境隔离依赖：

	```pwsh
	python -m venv /opt/neko_ctf/venv
	/opt/neko_ctf/venv/Scripts/Activate.ps1  # Linux 上改为 source venv/bin/activate
	pip install -r requirements.txt
	```

- 如果打算采用 PostgreSQL / MySQL 等外部数据库，请提前创建数据库与用户，并记录连接串。

### 2. 配置环境变量

设置 `FLASK_ENV=production` 可以关闭调试模式，并结合以下关键变量：

| 变量 | 推荐说明 |
| --- | --- |
| `SECRET_KEY` | 使用 `openssl rand -hex 32` 生成，绝不提交到仓库 |
| `DATABASE_URL` | 生产数据库连接串。如 `postgresql+psycopg://nekoadmin:...@db/neko_ctf` |
| `ADMIN_USERNAME`/`ADMIN_PASSWORD` | 覆盖默认管理员账号，部署后可在后台再创建更多账号 |
| `SESSION_COOKIE_SECURE` / `REMEMBER_COOKIE_SECURE` | 部署在 HTTPS 时设为 `true`，强制只通过加密通道发送 Cookie |
| `SESSION_COOKIE_SAMESITE` | 默认为 `Lax`，如需跨站点嵌入可改 `None` 并配合 `Secure` |
| `MAIL_*` | 题目共创邮件中枢所需的 SMTP 设置，详见上一节 |
| `ORGANIZER_EMAIL` | 页面展示的联系邮箱 |

PowerShell 示例：

```pwsh
$env:FLASK_ENV = "production"
$env:SECRET_KEY = "$(openssl rand -hex 32)"
$env:DATABASE_URL = "postgresql+psycopg://nekoadmin:superpass@127.0.0.1:5432/neko_ctf"
$env:SESSION_COOKIE_SECURE = "true"
$env:REMEMBER_COOKIE_SECURE = "true"
$env:MAIL_SERVER = "smtp.example.com"
$env:MAIL_USERNAME = "nora@example.com"
# ...其余变量同上...
```

### 3. 初始化数据库与默认数据

联网环境准备好后执行一次：

```pwsh
flask --app neko_ctf:create_app bootstrap-data --with-reset
# 或使用兼容命令：python -c "from app import bootstrap_defaults; bootstrap_defaults()"
```

该脚本会：

- 创建所有表结构（若检测到旧版结构会自动重建）。
- 若没有管理员账号则根据环境变量创建默认管理员。
- 当题库为空时导入示例题目，方便验收。你可以随后在后台删除或隐藏示例题。

### 4. 通过 WSGI 服务运行应用

- Linux / macOS 推荐 Gunicorn：

	```bash
	gunicorn "neko_ctf:app" --bind 0.0.0.0:8000 --workers 3 --access-logfile -
	```

- Windows 可使用 Waitress：

	```pwsh
	waitress-serve --port=8000 neko_ctf:app
	```

- 结合 Nginx / Caddy / Traefik 等反向代理实现 HTTPS 终端、静态资源缓存与限速，上游与应用端口 8000 通信。

- 建议将上述命令写入 systemd（Linux）或 NSSM（Windows）守护服务，确保开机自启与异常自动重启。

### 5. 安全加固清单

- **更换默认管理员密码** 并为核心账号开启多因素（如果服务供应商支持）。
- **定期备份数据库**：每日热备 + 异地冷备，确保题库与提交数据安全。
- **限制上传权限**：当前版本无文件上传，若后续拓展请引入白名单校验。
- **监控与日志**：为 Gunicorn / Waitress 输出配置 logrotate；使用 Fail2ban 或 WAF 限制暴力破解。
- **自动化测试**：部署前运行 `pytest`，并在 CI/CD 中加入该步骤以捕获回归。
- **滚动更新**：使用 systemd / NSSM 管理 Gunicorn 或 Waitress 服务，更新完代码与依赖后执行 `systemctl reload neko_ctf`（或 `nssm restart neko_ctf`）以平滑重启；对高可用环境可采用蓝绿部署或多实例轮换实现零停机更新。

完成上述步骤后，NekoCTF 就可以在生产环境稳定运行啦。后续若有插件化需求，可以在此基础上继续扩展。 

## 📝 Markdown & 安全 HTML

- 题目简介、题目正文以及提示内容都支持 Markdown 语法（标题、列表、表格、代码块等）。
- 系统会使用 `Markdown` + `bleach` 将内容转换为安全的 HTML，自动阻止 `<script>` 与危险协议（如 `javascript:`）。
- 所有外部链接都会追加 `rel="nofollow noopener"` 与 `target="_blank"`，确保跳转安全。
- 如果需要嵌入图片，只需使用标准 Markdown 语法：`![alt](https://example.com/image.png)`。

> 小贴士：后台表单默认展示原始 Markdown 文本。编辑时可先在本地 Markdown 预览工具中调试格式，再粘贴到后台保存。

## 🔐 管理员后台

- 访问 `/login` 进行管理员登录，默认账号为 `nekoadmin` / `nekoadminpass`（强烈建议在生产环境中覆盖为自定义值）。
- 登录后可访问 `/admin/challenges` 管理题库：新增、编辑、删除题目，控制是否展示，并一键跳转到提示管理。
- 在 `/admin/challenges/<id>/hints` 页面可为题目添加有序提示、删除旧提示，帮助选手逐步排查。
- 导航栏会在管理员登录后显示“后台”和“退出”快捷入口。

## 🐾 玩家流程

1. 访问 `/register` 注册战队账号，系统会自动登录。
2. 浏览 `/challenges` 获取题目信息，已解决的题目会显示“已解”徽章。
3. 在 `/challenges` 中点击题目进入详情页，阅读简介、完整内容与已开放的提示，然后提交 flag。
4. 成功提交后将获得相应分值，排行榜 `/leaderboard` 会实时刷新成绩。

若 flag 输入错误，系统会保留尝试记录并提示重新作答；重复提交已通过的 flag 会收到温馨提醒。

## 🧪 测试

```pwsh
pytest
```

测试将使用 Flask 测试客户端验证核心路由可用性。

## 🗺️ 项目结构

```
.
├─ app.py              # 向后兼容的入口，复用应用工厂
├─ config.py           # 环境变量配置
├─ neko_ctf/           # 应用主包（工厂 + 模块化拆分）
│  ├─ __init__.py      # create_app 工厂、CLI 命令注册
│  ├─ auth.py          # 登录管理器、管理员权限守卫
│  ├─ bootstrap.py     # 默认数据与数据库初始化逻辑
│  ├─ cache_config.py  # 缓存键与超时配置
│  ├─ extensions.py    # SQLAlchemy / LoginManager / Cache 实例
│  ├─ markdown.py      # Markdown 清洗与安全渲染
│  ├─ models.py        # ORM 模型定义
│  ├─ routes/          # 路由模块（public/admin/auth/profile）
│  ├─ services/        # 邮件通知、高光统计等服务层
│  └─ utils.py         # 通用工具函数（缓存失效、表单解析等）
├─ templates/          # Jinja2 模板（含 admin/、auth、提交页面）
├─ static/css/         # 全局样式
├─ scripts/            # 部署与运维脚本
├─ requirements.txt    # 项目依赖
└─ tests/              # Pytest 用例
```

## 🔮 下一步

- 接入 OAuth 登录和在线提交系统
- 增加题目榜单、战队报名、FAQ 等模块
- 引入更丰富的插画与动画，让猫娘跃动起来

欢迎贡献更多创意，让 NekoCTF 成为最可爱的安全赛事！
