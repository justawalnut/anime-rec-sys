from sqlalchemy import Boolean, Column, Integer, String, Table, ForeignKey, Text, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.session import Base

# Association table for user favorite genres
user_genre = Table(
    "user_genre",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE")),
    Column("genre_id", Integer, ForeignKey("genres.id", ondelete="CASCADE")),
)

# Association table for user watched anime
user_watched_anime = Table(
    "user_watched_anime",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("anime_id", Integer),
    Column("rating", Integer, nullable=True),
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    favorite_genres = relationship("Genre", secondary=user_genre, back_populates="users")
    watched_anime = relationship("WatchedAnime", backref="user")
    reviews = relationship("Review", back_populates="user")

class Genre(Base):
    __tablename__ = "genres"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True)
    
    # Relationships
    users = relationship("User", secondary=user_genre, back_populates="favorite_genres")

class WatchedAnime(Base):
    __tablename__ = "watched_anime"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    anime_id = Column(Integer, index=True)  # AniList ID
    title = Column(String(255))
    status = Column(String(50))  # completed, watching, plan_to_watch, dropped, on_hold
    episodes_watched = Column(Integer, default=0)
    rating = Column(Integer, nullable=True)  # User rating (1-10)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    anime_id = Column(Integer, index=True)  # AniList ID
    title = Column(String(255))
    content = Column(Text)
    rating = Column(Float)  # User rating (1-10)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="reviews")
