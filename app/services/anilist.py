from typing import Dict, List, Any, Optional
import json
import logging
import aiohttp
import asyncio
from gql import Client, gql
from gql.transport.aiohttp import AIOHTTPTransport
from datetime import datetime, timedelta

from app.core.config import settings
from app.schemas.anime import AnimeBase

logger = logging.getLogger(__name__)

class RateLimiter:
    def __init__(self, max_requests: int = 90, time_window: int = 60):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = []
        self.lock = asyncio.Lock()

    async def acquire(self):
        async with self.lock:
            now = datetime.now()
            # Remove old requests
            self.requests = [req_time for req_time in self.requests 
                           if now - req_time < timedelta(seconds=self.time_window)]
            
            if len(self.requests) >= self.max_requests:
                # Calculate wait time
                oldest_request = self.requests[0]
                wait_time = self.time_window - (now - oldest_request).total_seconds()
                if wait_time > 0:
                    await asyncio.sleep(wait_time)
            
            self.requests.append(now)

class AniListService:
    def __init__(self):
        self.url = settings.ANILIST_API_URL
        self.rate_limiter = RateLimiter()
        self._session = None
        
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create an aiohttp session."""
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession()
        return self._session
        
    async def _execute_query(self, query: str, variables: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a GraphQL query using a new client for each request."""
        transport = AIOHTTPTransport(url=self.url)
        client = Client(transport=transport, fetch_schema_from_transport=True)
        try:
            logger.debug(f"Executing GraphQL query with variables: {variables}")
            result = await client.execute_async(gql(query), variable_values=variables)
            logger.debug(f"GraphQL response: {json.dumps(result, indent=2)}")
            return result
        except Exception as e:
            logger.error(f"Error executing GraphQL query: {str(e)}", exc_info=True)
            raise
        finally:
            await client.close_async()
        
    async def search_anime(self, query: str, genres: Optional[List[str]] = None, sort: Optional[str] = None) -> List[AnimeBase]:
        """Search for anime by title and optionally filter by genres."""
        await self.rate_limiter.acquire()
        
        search_query = """
        query ($search: String, $genres: [String], $sort: [MediaSort]) {
            Page(page: 1, perPage: 20) {
                media(search: $search, type: ANIME, genre_in: $genres, sort: $sort) {
                    id
                    title {
                        english
                        romaji
                        native
                    }
                    genres
                    description
                    averageScore
                    episodes
                    status
                    coverImage {
                        large
                        medium
                        color
                    }
                }
            }
        }
        """
        
        # Map sort parameter to AniList sort enum
        sort_mapping = {
            "popularity": "POPULARITY_DESC",
            "trending": "TRENDING_DESC",
            "score": "SCORE_DESC",
            "start_date": "START_DATE_DESC"
        }
        
        variables = {
            "search": query,
            "genres": genres,
            "sort": [sort_mapping.get(sort, "POPULARITY_DESC")] if sort else None
        }
        
        try:
            print(f"Searching for anime with query: {query}, genres: {genres}, sort: {sort}")
            result = await self._execute_query(search_query, variables)
            anime_list = self._parse_anime_results(result)
            print(f"Found {len(anime_list)} results")
            return anime_list
        except Exception as e:
            print(f"Error searching anime: {str(e)}")
            return []
            
    async def get_popular_anime(self, genres: Optional[List[str]] = None, limit: int = 10) -> List[AnimeBase]:
        """Get popular anime, optionally filtered by genres."""
        await self.rate_limiter.acquire()
        
        popular_query = """
        query ($genres: [String], $perPage: Int) {
            Page(page: 1, perPage: $perPage) {
                media(sort: POPULARITY_DESC, type: ANIME, genre_in: $genres) {
                    id
                    title {
                        english
                        romaji
                    }
                    genres
                    description
                    averageScore
                    episodes
                    status
                    coverImage {
                        large
                        medium
                        color
                    }
                }
            }
        }
        """
        
        variables = {
            "genres": genres,
            "perPage": limit
        }
        
        try:
            logger.info(f"Fetching popular anime with genres: {genres}")
            result = await self._execute_query(popular_query, variables)
            anime_list = self._parse_anime_results(result)
            logger.info(f"Found {len(anime_list)} popular anime results")
            if genres:
                logger.info(f"Genres in results: {[anime.genres for anime in anime_list]}")
            return anime_list
        except Exception as e:
            logger.error(f"Error fetching popular anime: {str(e)}", exc_info=True)
            return []
    
    async def get_anime_by_id(self, anime_id: int) -> Optional[AnimeBase]:
        """Get anime details by ID."""
        await self.rate_limiter.acquire()
        
        query = """
        query ($id: Int) {
            Media(id: $id, type: ANIME) {
                id
                title {
                    english
                    romaji
                }
                genres
                description
                averageScore
                episodes
                status
                coverImage {
                    large
                    medium
                    color
                }
                startDate {
                    year
                    month
                    day
                }
                endDate {
                    year
                    month
                    day
                }
                nextAiringEpisode {
                    airingAt
                    timeUntilAiring
                    episode
                }
                isAdult
            }
        }
        """
        
        variables = {"id": anime_id}
        
        try:
            result = await self._execute_query(query, variables)
            anime_data = result.get("Media", {})
            if not anime_data:
                return None
            return self._parse_anime(anime_data)
        except Exception as e:
            print(f"Error fetching anime by ID: {e}")
            return None
    
    async def get_recommendations(self, anime_id: int, limit: int = 5) -> List[AnimeBase]:
        """Get anime recommendations based on a specific anime."""
        await self.rate_limiter.acquire()
        
        query = """
        query ($id: Int, $perPage: Int) {
            Media(id: $id, type: ANIME) {
                recommendations(perPage: $perPage) {
                    nodes {
                        mediaRecommendation {
                            id
                            title {
                                english
                                romaji
                            }
                            genres
                            description
                            averageScore
                            episodes
                            status
                            coverImage {
                                large
                                medium
                                color
                            }
                        }
                    }
                }
            }
        }
        """
        
        variables = {
            "id": anime_id,
            "perPage": limit
        }
        
        try:
            result = await self._execute_query(query, variables)
            recommendations = result.get("Media", {}).get("recommendations", {}).get("nodes", [])
            
            return [
                self._parse_anime(rec["mediaRecommendation"]) 
                for rec in recommendations 
                if "mediaRecommendation" in rec
            ]
        except Exception as e:
            print(f"Error fetching recommendations: {e}")
            return []
    
    async def get_genres(self) -> List[str]:
        """Get list of available genres."""
        await self.rate_limiter.acquire()
        
        query = """
        query {
            GenreCollection
        }
        """
        
        try:
            result = await self._execute_query(query, {})
            return result.get("GenreCollection", [])
        except Exception as e:
            print(f"Error fetching genres: {e}")
            return []
    
    def _parse_anime(self, anime_data: Dict[str, Any]) -> AnimeBase:
        """Parse anime data from AniList API response."""
        title = anime_data.get("title", {})
        cover_image = anime_data.get("coverImage", {})
        return AnimeBase(
            id=anime_data.get("id"),
            title=title.get("english") or title.get("romaji") or "Unknown",
            genres=anime_data.get("genres", []),
            description=anime_data.get("description"),
            averageScore=anime_data.get("averageScore"),
            coverImage={
                "large": cover_image.get("large"),
                "medium": cover_image.get("medium"),
                "color": cover_image.get("color") or "#000000"  # Default color if none provided
            } if cover_image else None,
            episodes=anime_data.get("episodes"),
            status=anime_data.get("status"),
            startDate={
                "year": anime_data.get("startDate", {}).get("year"),
                "month": anime_data.get("startDate", {}).get("month"),
                "day": anime_data.get("startDate", {}).get("day")
            } if anime_data.get("startDate") else None,
            endDate={
                "year": anime_data.get("endDate", {}).get("year"),
                "month": anime_data.get("endDate", {}).get("month"),
                "day": anime_data.get("endDate", {}).get("day")
            } if anime_data.get("endDate") else None,
            nextAiringEpisode={
                "airingAt": anime_data.get("nextAiringEpisode", {}).get("airingAt"),
                "timeUntilAiring": anime_data.get("nextAiringEpisode", {}).get("timeUntilAiring"),
                "episode": anime_data.get("nextAiringEpisode", {}).get("episode")
            } if anime_data.get("nextAiringEpisode") else None,
            isAdult=anime_data.get("isAdult", False)
        )
    
    def _parse_anime_results(self, result: Dict[str, Any]) -> List[AnimeBase]:
        """Parse anime results from AniList API response."""
        media_list = result.get("Page", {}).get("media", [])
        return [self._parse_anime(anime) for anime in media_list]
    
    async def close(self):
        """Close the aiohttp session."""
        if self._session and not self._session.closed:
            await self._session.close()

    async def get_trending_anime(self, genres: Optional[List[str]] = None, limit: int = 20) -> List[AnimeBase]:
        """Get trending anime, optionally filtered by genres."""
        await self.rate_limiter.acquire()
        
        query = """
        query ($genres: [String], $perPage: Int) {
            Page(page: 1, perPage: $perPage) {
                media(sort: TRENDING_DESC, type: ANIME, genre_in: $genres) {
                    id
                    title {
                        english
                        romaji
                    }
                    genres
                    description
                    averageScore
                    episodes
                    status
                    coverImage {
                        large
                        medium
                        color
                    }
                }
            }
        }
        """
        
        variables = {
            "genres": genres,
            "perPage": limit
        }
        
        try:
            logger.info(f"Fetching trending anime with genres: {genres}")
            result = await self._execute_query(query, variables)
            anime_list = self._parse_anime_results(result)
            logger.info(f"Found {len(anime_list)} trending anime results")
            if genres:
                logger.info(f"Genres in results: {[anime.genres for anime in anime_list]}")
            return anime_list
        except Exception as e:
            logger.error(f"Error fetching trending anime: {str(e)}", exc_info=True)
            return []

    async def get_top_rated_anime(self, genres: Optional[List[str]] = None, limit: int = 20) -> List[AnimeBase]:
        """Get top rated anime, optionally filtered by genres."""
        await self.rate_limiter.acquire()
        
        query = """
        query ($genres: [String], $perPage: Int) {
            Page(page: 1, perPage: $perPage) {
                media(sort: SCORE_DESC, type: ANIME, genre_in: $genres) {
                    id
                    title {
                        english
                        romaji
                    }
                    genres
                    description
                    averageScore
                    episodes
                    status
                    coverImage {
                        large
                        medium
                        color
                    }
                }
            }
        }
        """
        
        variables = {
            "genres": genres,
            "perPage": limit
        }
        
        try:
            logger.info(f"Fetching top rated anime with genres: {genres}")
            result = await self._execute_query(query, variables)
            anime_list = self._parse_anime_results(result)
            logger.info(f"Found {len(anime_list)} top rated anime results")
            if genres:
                logger.info(f"Genres in results: {[anime.genres for anime in anime_list]}")
            return anime_list
        except Exception as e:
            logger.error(f"Error fetching top rated anime: {str(e)}", exc_info=True)
            return []

    async def get_newest_anime(self, genres: Optional[List[str]] = None, limit: int = 20) -> List[AnimeBase]:
        """Get newest anime, optionally filtered by genres."""
        await self.rate_limiter.acquire()
        
        query = """
        query ($genres: [String], $perPage: Int) {
            Page(page: 1, perPage: $perPage) {
                media(sort: START_DATE_DESC, type: ANIME, genre_in: $genres) {
                    id
                    title {
                        english
                        romaji
                    }
                    genres
                    description
                    averageScore
                    episodes
                    status
                    coverImage {
                        large
                        medium
                        color
                    }
                }
            }
        }
        """
        
        variables = {
            "genres": genres,
            "perPage": limit
        }
        
        try:
            logger.info(f"Fetching newest anime with genres: {genres}")
            result = await self._execute_query(query, variables)
            anime_list = self._parse_anime_results(result)
            logger.info(f"Found {len(anime_list)} newest anime results")
            if genres:
                logger.info(f"Genres in results: {[anime.genres for anime in anime_list]}")
            return anime_list
        except Exception as e:
            logger.error(f"Error fetching newest anime: {str(e)}", exc_info=True)
            return []

# Create a singleton instance
anilist_service = AniListService()
