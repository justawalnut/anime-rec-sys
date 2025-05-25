import os
from typing import Any, Dict, Optional

# For Pydantic v2, `validator` is replaced by `field_validator` and `root_validator` by `model_validator`
from pydantic import PostgresDsn, field_validator, model_validator # Import model_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "replace_with_secure_key_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # Database settings
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "anime_rec_sys"
    # SQLALCHEMY_DATABASE_URI will be a string, which Pydantic will then validate as a PostgresDsn
    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None # Change type hint back to PostgresDsn for final validation

    # Use model_validator to assemble the URI after all fields are parsed
    @model_validator(mode='after') # 'after' ensures all other fields are populated
    def assemble_db_connection(self) -> 'Settings':
        # If SQLALCHEMY_DATABASE_URI is already set (e.g., from an env var), don't override it
        if self.SQLALCHEMY_DATABASE_URI:
            return self

        # Access attributes directly on self for model_validator
        # Ensure 'db' is used as the host in Docker Compose environment
        # and adjust if your postgres_server is different from the service name
        self.SQLALCHEMY_DATABASE_URI = PostgresDsn(
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:5432/{self.POSTGRES_DB}"
        )
        return self

    # AniList API
    ANILIST_API_URL: str = "https://graphql.anilist.co"

    class Config:
        # Pydantic-settings automatically looks for .env files in the current directory
        # env_file = ".env" # Can be omitted if .env is in the root
        pass

settings = Settings()
