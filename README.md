# Anime Recommendation System

A REST API service that provides anime recommendations using the AniList GraphQL API.

## Features

- Search for anime by name or genre
- View recommended anime based on user preferences and watch history
- JWT-based authentication
- User-specific anime preferences management

## Technologies

- **Framework**: FastAPI
- **Database**: PostgreSQL
- **API**: AniList GraphQL API
- **Authentication**: JWT-based

## Setup Instructions

### Prerequisites

- Python 3.8+
- PostgreSQL
- Docker and Docker Compose (optional, for containerized setup)

### Option 1: Manual Setup

1. Create a PostgreSQL database:
   ```
   createdb anime_rec_sys
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Configure database settings in app/core/config.py with your PostgreSQL credentials.

5. Run the application:
   ```
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Option 2: Docker Setup (Recommended)

1. Make sure Docker and Docker Compose are installed

2. Start the containers:
   ```
   docker-compose up -d
   ```

The API will be available at http://localhost:8000

## API Documentation

Interactive API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication

- POST /api/v1/auth/register - Register a new user
- POST /api/v1/auth/login - Login and get access token

### Anime

- GET /api/v1/anime/search - Search for anime by name or genre
- GET /api/v1/anime/recommendations - Get personalized anime recommendations
- GET /api/v1/anime/genres - Get list of available anime genres

### User

- GET /api/v1/user/me - Get current user info
- GET /api/v1/user/preferences - Get user's favorite genres
- POST /api/v1/user/preferences - Update user's favorite genres
- GET /api/v1/user/watched - Get user's watched anime list
- POST /api/v1/user/watched - Add anime to user's watched list

## License

This project is licensed under the MIT License.
