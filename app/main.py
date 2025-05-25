from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import time
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from app.api import api_router
from app.api.api import public_router
from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.auth.deps import get_current_user
from app.services.anilist import anilist_service

def wait_for_db():
    """Wait for database to be ready."""
    max_retries = 5
    retry_interval = 5  # seconds
    
    for i in range(max_retries):
        try:
            # Try to create a session and execute a simple query
            db = SessionLocal()
            db.execute(text("SELECT 1"))
            db.close()
            print("Database connection successful!")
            return
        except OperationalError:
            if i < max_retries - 1:
                print(f"Database not ready. Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)
            else:
                raise Exception("Could not connect to the database after multiple retries.")

# Wait for database before creating tables
wait_for_db()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Anime Recommendation System",
    description="REST API for anime recommendations based on AniList data",
    version="0.1.0",
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include API routers
app.include_router(public_router, prefix=settings.API_V1_STR)  # Public endpoints first
app.include_router(api_router, prefix=settings.API_V1_STR)     # Protected endpoints

@app.get("/")
async def root():
    return {
        "message": "Welcome to the Anime Recommendation System API",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/protected-test")
async def protected_test(current_user = Depends(get_current_user)):
    return {
        "message": "This is a protected endpoint",
        "user_id": current_user.id,
        "username": current_user.username
    }

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on application shutdown."""
    await anilist_service.close()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
