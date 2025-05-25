from fastapi import APIRouter

from app.api import auth, anime, user

# Create a public router for unauthenticated endpoints
public_router = APIRouter()
public_router.include_router(anime.router, prefix="/anime", tags=["anime"])

# Create a protected router for authenticated endpoints
api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(user.router, prefix="/user", tags=["user"])
api_router.include_router(anime.router, prefix="/anime", tags=["anime"])
