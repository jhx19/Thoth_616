from pydantic_settings import BaseSettings
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BACKEND_ROOT.parent

class Settings(BaseSettings):
    DATABASE_URL: str
    BENCHMARK_API_KEY: str

    class Config:
        env_file = (PROJECT_ROOT / ".env", BACKEND_ROOT / ".env", ".env")
        extra = "ignore"

settings = Settings()
