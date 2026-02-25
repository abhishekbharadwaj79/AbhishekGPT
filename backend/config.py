from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    gemini_api_key: str = ""
    cors_origins: str = "http://localhost:3000"
    host: str = "0.0.0.0"
    port: int = 8000
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    tavily_api_key: str = ""

    @field_validator("cors_origins")
    @classmethod
    def parse_cors_origins(cls, v: str) -> str:
        return v

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()
