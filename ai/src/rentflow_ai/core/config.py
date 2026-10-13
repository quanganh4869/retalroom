from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "RentFlow AI Service"
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"

    HOST: str = "0.0.0.0"
    PORT: int = 8001

    # Provider: "mock" (default offline) | "openai" | etc.
    AI_PROVIDER: str = "mock"
    MODEL_NAME: str = "gpt-4o-mini"
    OPENAI_API_KEY: str | None = None
    REQUEST_TIMEOUT_SECONDS: float = 15.0


settings = Settings()
