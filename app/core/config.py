import os
from typing import Any, Dict, Optional

from pydantic import PostgresDsn, field_validator, model_validator 
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "replace_with_secure_key_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  

    # Database settings
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "anime_rec_sys"
    
    
    DATABASE_URL: Optional[str] = None
    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None

    @model_validator(mode='after') 
    def assemble_db_connection(self) -> 'Settings':

        if self.DATABASE_URL:
            self.SQLALCHEMY_DATABASE_URI = PostgresDsn(self.DATABASE_URL)
            return self
            
        if self.SQLALCHEMY_DATABASE_URI:
            return self

        self.SQLALCHEMY_DATABASE_URI = PostgresDsn(
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:5432/{self.POSTGRES_DB}"
        )
        return self

    # AniList API
    ANILIST_API_URL: str = "https://graphql.anilist.co"

    class Config:
        # Allow environment variables to override settings
        env_file = ".env"
        case_sensitive = True

settings = Settings()
