import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Satellite Processing API"
    MAX_FILE_SIZE_MB: int = 100
    TEMP_DIR: str = "app/data/temp"
    OUTPUT_DIR: str = "app/data/output"
    
    class Config:
        case_sensitive = True

settings = Settings()