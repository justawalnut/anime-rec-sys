import { apiGet, apiPost } from './api';
import { Anime } from '../types';
import axios from 'axios';

export interface SearchParams {
  query: string;
  genres?: string[];
  sort?: string;
}

export const searchAnime = async (query: string, genres?: string[], sort?: string): Promise<Anime[]> => {
  try {
    console.log('Searching anime with:', { query, genres, sort });
    const response = await apiGet(`/anime/search?query=${encodeURIComponent(query)}${genres?.length ? `&genres=${genres.join(',')}` : ''}${sort ? `&sort=${sort}` : ''}`);
    console.log('Raw search response:', response);
    
    if (!Array.isArray(response)) {
      console.error('Invalid response format:', response);
      return [];
    }
    
    return response.map(anime => ({
      ...anime,
      title: anime.title || 'Unknown Title',
      genres: anime.genres || [],
      description: anime.description || '',
      averageScore: anime.averageScore || 0,
      coverImage: anime.coverImage || {
        large: '',
        medium: '',
        color: '#000000'
      }
    }));
  } catch (error) {
    console.error('Error searching anime:', error);
    return [];
  }
};

export const getAnimeById = async (id: number): Promise<Anime> => {
  const response = await apiGet(`/anime/${id}`);
  console.log('Raw anime details response:', response);
  return response as Anime;
};

export const getRecommendations = async (): Promise<Anime[]> => {
  const response = await apiGet('/anime/recommendations');
  console.log('Raw recommendations response:', response);
  return response as Anime[];
};

export const getGenres = async (): Promise<string[]> => {
  const response = await apiGet('/anime/genres');
  console.log('Raw genres response:', response);
  return response as string[];
};

export const addToWatched = async (animeId: number, score: number, status: string): Promise<void> => {
  await apiPost('/user/watched', { anime_id: animeId, score, status });
};

export const updatePreferences = async (genres: string[]): Promise<void> => {
  await apiPost('/user/preferences', { genres });
};

export const getPopularAnime = async (genre?: string, limit: number = 20): Promise<Anime[]> => {
  const response = await apiGet(`/anime/popular?${genre ? `genre=${encodeURIComponent(genre)}&` : ''}limit=${limit}`);
  console.log('Raw popular anime response:', response);
  return response as Anime[];
};

export const getAnimeBySort = async (sort: string, genres?: string[]): Promise<Anime[]> => {
  try {
    console.log('Getting anime by sort:', sort, 'with genres:', genres);
    const response = await apiGet(`/anime/sort/${sort}${genres?.length ? `?genres=${genres.join(',')}` : ''}`);
    console.log('Raw sort response:', response);
    
    if (!Array.isArray(response)) {
      console.error('Invalid response format:', response);
      return [];
    }
    
    return response.map(anime => ({
      ...anime,
      title: anime.title || 'Unknown Title',
      genres: anime.genres || [],
      description: anime.description || '',
      averageScore: anime.averageScore || 0,
      coverImage: anime.coverImage || {
        large: '',
        medium: '',
        color: '#000000'
      }
    }));
  } catch (error) {
    console.error('Error getting anime by sort:', error);
    return [];
  }
};
