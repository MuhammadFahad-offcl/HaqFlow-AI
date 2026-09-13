"""
Centralized, env-driven configuration.

Nothing in this module is hardcoded — every secret or tunable comes from an
environment variable (see /.env.example at the repo root). Import `settings`
anywhere a config value or the shared Groq client is needed.
"""
from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- Groq / LLM ---------------------------------------------------
    # NOTE (Sept 2026): llama-3.3-70b-versatile and
    # meta-llama/llama-4-scout-17b-16e-instruct (the models this project
    # originally shipped with) were both decommissioned by Groq in 2026.
    # Calls to a decommissioned model ID return a 400 from Groq, which is
    # exactly why "the API key is valid but no answers come back." The
    # defaults below are Groq's current recommended, non-deprecated
    # replacements. Always cross-check https://console.groq.com/docs/models
    # and https://console.groq.com/docs/deprecations if this ever breaks
    # again — Groq's lineup changes frequently.
    groq_api_key: str = Field(default="", alias="GROQ_API_KEY")
    groq_model: str = Field(default="openai/gpt-oss-120b", alias="GROQ_MODEL")
    groq_vision_model: str = Field(default="qwen/qwen3.6-27b", alias="GROQ_VISION_MODEL")

    # --- CORS -----------------------------------------------------------
    # Comma-separated list of allowed origins, e.g.
    # "http://localhost:3000,https://haqflow.vercel.app"
    # Defaults to "*" (any origin) so a forgotten env var on a fresh
    # deployment never silently blocks the frontend with a CORS error —
    # tighten this to your real frontend URL(s) once deployed. Credentials
    # (cookies) are never used by this API, so a wildcard origin is safe here.
    cors_allow_origins: str = Field(default="*", alias="CORS_ALLOW_ORIGINS")

    # --- App metadata ----------------------------------------------------
    app_env: str = Field(default="development", alias="APP_ENV")

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_allow_origins.split(",") if origin.strip()]

    def require_groq_key(self) -> str:
        if not self.groq_api_key:
            raise RuntimeError(
                "GROQ_API_KEY is not configured. Set it as an environment variable "
                "(see .env.example) before calling any AI-backed endpoint."
            )
        return self.groq_api_key


@lru_cache
def get_settings() -> Settings:
    """Settings are cached (read once, from env/.env) for the process lifetime."""
    return Settings()


settings = get_settings()
