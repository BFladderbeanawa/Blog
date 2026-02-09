# syntax=docker/dockerfile:1
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY . ./

RUN adduser --system --group neko \
    && mkdir -p /data \
    && chown -R neko:neko /data \
    && chown -R neko:neko /app

USER neko

ENV FLASK_ENV=production

VOLUME ["/data"]

EXPOSE 8000

CMD ["/bin/sh", "-c", "exec gunicorn neko_ctf:app --bind 0.0.0.0:8000 --workers ${GUNICORN_WORKERS:-3} --access-logfile - --error-logfile -"]
