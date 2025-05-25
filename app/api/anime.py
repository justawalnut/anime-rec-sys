from typing import Any, List, Optional
import logging
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.db.session import get_db
from app.models.user import User, WatchedAnime as WatchedAnimeModel, Genre
from app.schemas.anime import AnimeBase, AnimeSearch
from app.services.anilist import anilist_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/search", response_model=List[AnimeBase], include_in_schema=True)
async def search_anime(
    query: str,
    genres: Optional[str] = None,
    sort: Optional[str] = None,
    background_tasks: BackgroundTasks = None
) -> List[AnimeBase]:
    """Search for anime by title and optionally filter by genres."""
    print(f"Received search request - Query: {query}, Genres: {genres}, Sort: {sort}")
    
    if not query.strip():
        print("Empty query received")
        return []
    
    genre_list = genres.split(',') if genres else None
    print(f"Parsed genre list: {genre_list}")
    
    try:
        results = await anilist_service.search_anime(query, genre_list, sort)
        print(f"Search returned {len(results)} results")
        if not results:
            print("No results found")
        return results
    except Exception as e:
        print(f"Error in search endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search anime: {str(e)}"
        )

@router.get("/sort/{sort_type}", response_model=List[AnimeBase])
async def get_anime_by_sort(
    sort_type: str,
    genres: Optional[str] = None,
    limit: int = 20
) -> List[AnimeBase]:
    """Get anime sorted by the specified criteria and optionally filtered by genres."""
    try:
        genre_list = genres.split(',') if genres else None
        logger.info(f"Sort request - Type: {sort_type}, Genres: {genre_list}, Limit: {limit}")
        
        if sort_type == "popularity":
            logger.info("Fetching popular anime with genres: %s", genre_list)
            results = await anilist_service.get_popular_anime(genres=genre_list, limit=limit)
        elif sort_type == "trending":
            logger.info("Fetching trending anime with genres: %s", genre_list)
            results = await anilist_service.get_trending_anime(genres=genre_list, limit=limit)
        elif sort_type == "score":
            logger.info("Fetching top rated anime with genres: %s", genre_list)
            results = await anilist_service.get_top_rated_anime(genres=genre_list, limit=limit)
        elif sort_type == "start_date":
            logger.info("Fetching newest anime with genres: %s", genre_list)
            results = await anilist_service.get_newest_anime(genres=genre_list, limit=limit)
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid sort type: {sort_type}"
            )
        
        logger.info(f"Returning {len(results)} results")
        if genre_list:
            logger.info(f"Results genres: {[anime.genres for anime in results]}")
            # Verify that results contain the requested genres
            filtered_results = [
                anime for anime in results 
                if any(genre in anime.genres for genre in genre_list)
            ]
            logger.info(f"After genre filtering: {len(filtered_results)} results")
            return filtered_results
        return results
    except Exception as e:
        logger.error(f"Error in sort endpoint: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get anime by sort: {str(e)}"
        )

@router.get("/popular", response_model=List[AnimeBase])
async def get_popular_anime(
    genre: Optional[str] = None,
    limit: int = 20,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get popular anime, optionally filtered by genre.
    """
    genre_list = [genre] if genre else None
    results = await anilist_service.get_popular_anime(genres=genre_list, limit=limit)
    return results

@router.get("/recommendations", response_model=List[AnimeBase])
async def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get anime recommendations based on user preferences and watch history.
    """
    # Get user's favorite genres
    genre_names = [genre.name for genre in current_user.favorite_genres]
    
    # Get user's watched anime
    watched_anime_ids = [anime.anime_id for anime in current_user.watched_anime]
    
    # If user has watched anime, get recommendations based on last watched
    if watched_anime_ids:
        last_watched_id = watched_anime_ids[-1]
        recommendations = await anilist_service.get_recommendations(last_watched_id)
        if recommendations:
            # Filter out already watched anime
            recommendations = [
                anime for anime in recommendations 
                if anime.id not in watched_anime_ids
            ]
            return recommendations[:10]
    
    # If user has favorite genres, get popular anime from those genres
    if genre_names:
        # Just use the first genre for now
        popular_anime = await anilist_service.get_popular_anime(genre=genre_names[0])
        return popular_anime[:10]
    
    # Fallback to general popular anime
    popular_anime = await anilist_service.get_popular_anime()
    return popular_anime[:10]

@router.get("/genres", response_model=List[str])
async def get_genres() -> Any:
    """
    Get list of available anime genres.
    """
    return await anilist_service.get_genres()

@router.get("/{anime_id}", response_model=AnimeBase)
async def get_anime_by_id(
    anime_id: int,
) -> Any:
    """
    Get anime details by ID.
    """
    try:
        anime = await anilist_service.get_anime_by_id(anime_id)
        if not anime:
            raise HTTPException(
                status_code=404,
                detail=f"Anime with ID {anime_id} not found"
            )
        return anime
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching anime: {str(e)}"
        )
