from __future__ import annotations

import bleach
from bleach import callbacks
from bleach.sanitizer import (
    ALLOWED_ATTRIBUTES as BLEACH_ALLOWED_ATTRIBUTES,
    ALLOWED_PROTOCOLS as BLEACH_ALLOWED_PROTOCOLS,
    ALLOWED_TAGS as BLEACH_ALLOWED_TAGS,
)
from markdown import markdown

MARKDOWN_EXTENSIONS = [
    "extra",
    "sane_lists",
]

MARKDOWN_ALLOWED_TAGS = BLEACH_ALLOWED_TAGS.union(
    {
        "p",
        "pre",
        "code",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
        "hr",
        "img",
    }
)

_default_attrs = dict(BLEACH_ALLOWED_ATTRIBUTES)
MARKDOWN_ALLOWED_ATTRIBUTES = {
    **_default_attrs,
    "a": ["href", "title", "rel", "target"],
    "img": ["src", "alt", "title"],
    "code": ["class"],
    "th": ["colspan", "rowspan", "scope"],
    "td": ["colspan", "rowspan"],
}

MARKDOWN_ALLOWED_PROTOCOLS = BLEACH_ALLOWED_PROTOCOLS.union({"mailto"})


def render_markdown(text: str | None) -> str:
    if not text:
        return ""

    html = markdown(text, extensions=MARKDOWN_EXTENSIONS, output_format="html5")
    cleaned = bleach.clean(
        html,
        tags=MARKDOWN_ALLOWED_TAGS,
        attributes=MARKDOWN_ALLOWED_ATTRIBUTES,
        protocols=MARKDOWN_ALLOWED_PROTOCOLS,
        strip=True,
    )
    return bleach.linkify(
        cleaned,
        callbacks=[callbacks.nofollow, callbacks.target_blank],
        skip_tags=["code", "pre"],
    )
