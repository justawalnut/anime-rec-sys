import api from './api';

interface UpdateUserProfileData {
  username?: string;
  email?: string;
  avatar?: string;
  preferences?: {
    favoriteGenres?: string[];
    notificationsEnabled?: boolean;
    theme?: 'light' | 'dark' | 'system';
  };
}

interface ReviewData {
  anime_id: number;
  title: string;
  content: string;
  rating: number;
}

export interface WatchlistItem {
  id: string;
  animeId: number;
  status: 'CURRENT' | 'PLANNING' | 'COMPLETED' | 'DROPPED' | 'PAUSED' | 'REPEATING';
  progress: number;
  score?: number;
  updatedAt: string;
  anime: {
    id: number;
    title: {
      romaji?: string;
      english?: string;
      native?: string;
    };
    coverImage: {
      large?: string;
      medium?: string;
    };
    episodes?: number;
    status: 'FINISHED' | 'ONGOING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
    averageScore?: number;
    genres?: string[];
  };
}

export const getUserProfile = async () => {
  try {
    const response = await api.get('/user/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (data: UpdateUserProfileData) => {
  try {
    const response = await api.patch('/user/me', data);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const getWatchlist = async () => {
  try {
    const response = await api.get('/user/watchlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    throw error;
  }
};

export const getFavorites = async () => {
  try {
    const response = await api.get('/user/favorites');
    return response.data;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
};

export const toggleFavorite = async (animeId: number) => {
  try {
    const response = await api.post(`/user/favorites/${animeId}`);
    return response.data;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};

export const getReviews = async () => {
  try {
    const response = await api.get('/user/reviews');
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

export const addReview = async (reviewData: ReviewData) => {
  try {
    const response = await api.post('/user/reviews', reviewData);
    return response.data;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

export const getUserStats = async () => {
  try {
    const response = await api.get('/user/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

export const addToWatchlist = async (animeId: number, status: string = 'PLANNING') => {
  try {
    const response = await api.post('/user/watched', { animeId, status });
    return response.data;
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw error;
  }
};

export const updateWatchlistItem = async (watchlistId: string, data: { status?: string; progress?: number; score?: number }) => {
  try {
    const response = await api.patch(`/api/users/me/watchlist/${watchlistId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating watchlist item:', error);
    throw error;
  }
};

export const removeFromWatchlist = async (watchlistId: string) => {
  try {
    await api.delete(`/api/users/me/watchlist/${watchlistId}`);
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
};

export const getWatchedAnime = async () => {
  try {
    const response = await api.get('/user/watched');
    return response.data;
  } catch (error) {
    console.error('Error fetching watched anime:', error);
    throw error;
  }
};

export const getFavoriteGenres = async () => {
  try {
    const response = await api.get('/user/preferences');
    return response.data;
  } catch (error) {
    console.error('Error fetching favorite genres:', error);
    throw error;
  }
};

export const updateFavoriteGenres = async (genres: string[]) => {
  try {
    const response = await api.put('/user/preferences', { genres });
    return response.data;
  } catch (error) {
    console.error('Error updating favorite genres:', error);
    throw error;
  }
};

export const getRecommendations = async () => {
  try {
    const response = await api.get('/anime/recommendations');
    return response.data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};
