from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class AnimeBase(BaseModel):
    id: int
    title: str
    genres: List[str] = []
    description: Optional[str] = None
    averageScore: Optional[float] = None
    coverImage: Optional[Dict[str, str]] = None
    episodes: Optional[int] = None
    status: Optional[str] = None
    startDate: Optional[Dict[str, Optional[int]]] = None
    endDate: Optional[Dict[str, Optional[int]]] = None
    nextAiringEpisode: Optional[Dict[str, Any]] = None
    isAdult: Optional[bool] = None
    
class AnimeSearch(BaseModel):
    query: str
    genres: Optional[List[str]] = None
    
class GenrePreference(BaseModel):
    genres: List[str]
    
class WatchedAnimeCreate(BaseModel):
    anime_id: int
    title: str
    rating: Optional[int] = None
    notes: Optional[str] = None
    
class WatchedAnime(WatchedAnimeCreate):
    id: int
    user_id: int
    
    class Config:
        orm_mode = True
