from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.auth.deps import get_current_user
from app.db.session import get_db
from app.models.user import User, WatchedAnime as WatchedAnimeModel, Genre, Review
from app.schemas.anime import GenrePreference, WatchedAnime, WatchedAnimeCreate
from app.schemas.user import (
    User as UserSchema,
    UserUpdate,
    UserStats,
    ReviewCreate,
    ReviewResponse
)
from app.services.anilist import anilist_service

router = APIRouter()

@router.get("/me", response_model=UserSchema)
def get_current_user_info(
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get current user info.
    """
    return current_user

@router.get("/preferences", response_model=List[str])
def get_user_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get user's favorite genres.
    """
    return [genre.name for genre in current_user.favorite_genres]

@router.post("/preferences")
def update_user_preferences(
    preferences: GenrePreference,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update user's favorite genres.
    """
    # Clear current preferences
    current_user.favorite_genres = []
    db.commit()
    
    # Add new preferences
    for genre_name in preferences.genres:
        # Check if genre exists, create if not
        genre = db.query(Genre).filter(Genre.name == genre_name).first()
        if not genre:
            genre = Genre(name=genre_name)
            db.add(genre)
            db.commit()
            db.refresh(genre)
        
        # Add to user's favorites
        current_user.favorite_genres.append(genre)
    
    db.commit()
    return {"status": "success", "message": "Preferences updated successfully"}

@router.get("/watched", response_model=List[WatchedAnime])
def get_watched_anime(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get user's watched anime list.
    """
    return current_user.watched_anime

@router.post("/watched", response_model=WatchedAnime)
async def add_watched_anime(
    anime: WatchedAnimeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Add anime to user's watched list.
    """
    # Check if anime exists in AniList
    anime_details = await anilist_service.get_anime_by_id(anime.anime_id)
    if not anime_details:
        raise HTTPException(status_code=404, detail="Anime not found in AniList")
    
    # Check if already in watched list
    existing = db.query(WatchedAnimeModel).filter(
        WatchedAnimeModel.user_id == current_user.id,
        WatchedAnimeModel.anime_id == anime.anime_id
    ).first()
    
    if existing:
        # Update existing record
        for key, value in anime.dict().items():
            setattr(existing, key, value)
        db.commit()
        db.refresh(existing)
        return existing
    
    # Add new record
    watched_anime = WatchedAnimeModel(
        user_id=current_user.id,
        **anime.dict()
    )
    db.add(watched_anime)
    db.commit()
    db.refresh(watched_anime)
    return watched_anime

@router.get("/watchlist", response_model=List[WatchedAnime])
def get_watchlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get user's watchlist (anime marked as plan to watch).
    """
    return db.query(WatchedAnimeModel).filter(
        WatchedAnimeModel.user_id == current_user.id,
        WatchedAnimeModel.status == 'plan_to_watch'
    ).all()

@router.get("/favorites", response_model=List[WatchedAnime])
def get_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get user's favorite anime.
    """
    return db.query(WatchedAnimeModel).filter(
        WatchedAnimeModel.user_id == current_user.id,
        WatchedAnimeModel.rating >= 8
    ).all()

@router.post("/favorites/{anime_id}")
async def toggle_favorite(
    anime_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Toggle favorite status for an anime.
    """
    anime = db.query(WatchedAnimeModel).filter(
        WatchedAnimeModel.user_id == current_user.id,
        WatchedAnimeModel.anime_id == anime_id
    ).first()
    
    if not anime:
        raise HTTPException(status_code=404, detail="Anime not found in user's list")
    
    anime.rating = 10 if anime.rating < 8 else None
    db.commit()
    db.refresh(anime)
    return anime

@router.get("/reviews", response_model=List[ReviewResponse])
def get_user_reviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get user's anime reviews.
    """
    return db.query(Review).filter(
        Review.user_id == current_user.id
    ).all()

@router.post("/reviews", response_model=ReviewResponse)
async def add_review(
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Add a review for an anime.
    """
    # Check if anime exists in user's watched list
    watched = db.query(WatchedAnimeModel).filter(
        WatchedAnimeModel.user_id == current_user.id,
        WatchedAnimeModel.anime_id == review.anime_id
    ).first()
    
    if not watched:
        raise HTTPException(status_code=400, detail="You can only review anime you've watched")
    
    # Check if review already exists
    existing = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.anime_id == review.anime_id
    ).first()
    
    if existing:
        # Update existing review
        for key, value in review.dict().items():
            setattr(existing, key, value)
        db.commit()
        db.refresh(existing)
        return existing
    
    # Create new review
    new_review = Review(
        user_id=current_user.id,
        **review.dict()
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review

@router.get("/stats", response_model=UserStats)
def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get user's anime watching statistics.
    """
    total_watched = db.query(func.count(WatchedAnimeModel.id)).filter(
        WatchedAnimeModel.user_id == current_user.id,
        WatchedAnimeModel.status == 'completed'
    ).scalar()
    
    total_episodes = db.query(func.sum(WatchedAnimeModel.episodes_watched)).filter(
        WatchedAnimeModel.user_id == current_user.id
    ).scalar() or 0
    
    avg_rating = db.query(func.avg(WatchedAnimeModel.rating)).filter(
        WatchedAnimeModel.user_id == current_user.id,
        WatchedAnimeModel.rating.isnot(None)
    ).scalar() or 0
    
    # Get genre distribution
    genre_stats = db.query(
        Genre.name,
        func.count(WatchedAnimeModel.id)
    ).join(
        WatchedAnimeModel,
        WatchedAnimeModel.anime_id.in_(
            db.query(WatchedAnimeModel.anime_id).filter(
                WatchedAnimeModel.user_id == current_user.id
            )
        )
    ).group_by(Genre.name).all()
    
    return {
        "total_watched": total_watched,
        "total_episodes": total_episodes,
        "average_rating": round(float(avg_rating), 2),
        "genre_distribution": dict(genre_stats)
    }
