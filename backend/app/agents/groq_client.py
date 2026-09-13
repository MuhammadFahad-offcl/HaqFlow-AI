"""
Single Groq LLM wrapper shared by every agent.

Kept as one function so there is exactly one place that talks to the model
provider — per the architecture doc's "small provider abstraction" rule, this
is the seam to swap providers behind without touching agent logic.
"""
from __future__ import annotations

import json
import logging
import re
from typing import Any

from groq import APIStatusError, Groq

from app.config import settings

logger = logging.getLogger("haqflow.groq")

_client: Groq | None = None

_FENCE_RE = re.compile(r"^```(?:json)?\s*|\s*```$", re.MULTILINE)


def _get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=settings.require_groq_key())
    return _client


def _clean_json_text(content: str) -> str:
    """Best-effort cleanup for models that wrap JSON in markdown fences or
    add stray leading/trailing text despite json_object mode being requested."""
    text = _FENCE_RE.sub("", content).strip()
    if not text:
        return "{}"
    # If there's leading/trailing prose around the JSON object, slice to the
    # outermost { ... } span rather than failing the whole request.
    if not text.startswith("{"):
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            text = text[start : end + 1]
    return text


def groq_json(system: str, user: str, image_b64: str | None = None) -> dict[str, Any]:
    """Calls Groq in JSON mode and returns the parsed object.

    Text calls use `settings.groq_model`; when `image_b64` is provided the
    call is routed to `settings.groq_vision_model` instead, matching the
    original prototype's multimodal fallback behaviour.
    """
    client = _get_client()
    model = settings.groq_model
    messages: list[dict[str, Any]] = [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]

    if image_b64:
        model = settings.groq_vision_model
        messages = [
            {"role": "system", "content": system},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}},
                ],
            },
        ]

    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0,
            response_format={"type": "json_object"},
        )
    except APIStatusError as exc:
        # Surface Groq's own error message (e.g. "model has been decommissioned",
        # invalid API key, rate limit) instead of a generic 500 — this is the
        # single most useful line for diagnosing a "no answers" deployment.
        logger.error("Groq API call failed (model=%s): %s", model, exc)
        raise RuntimeError(f"Groq API call failed for model '{model}': {exc}") from exc

    content = response.choices[0].message.content or "{}"
    cleaned = _clean_json_text(content)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        logger.error("Groq returned non-JSON content (model=%s): %r", model, content[:500])
        raise RuntimeError(f"Groq model '{model}' did not return valid JSON: {exc}") from exc
