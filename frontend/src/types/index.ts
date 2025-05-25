// User related types
export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  favorite_genres?: Genre[];
  watched_anime?: WatchedAnime[];
}

export interface Genre {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface WatchedAnime {
  id: number;
  anime_id: number;
  user_id: number;
  title: string;
  score: number;
  status: 'completed' | 'watching' | 'plan_to_watch' | 'dropped' | 'on_hold';
  episodes_watched: number;
  created_at: string;
  updated_at: string;
}

// Anime related types
export interface Anime {
  id: number;
  title: string;
  coverImage: {
    large: string;
    medium: string;
    color?: string;
  };
  bannerImage?: string | null;
  description: string;
  episodes: number | null;
  genres: string[];
  averageScore: number;
  status: 'FINISHED' | 'ONGOING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
  startDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  endDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  nextAiringEpisode?: {
    airingAt: number;
    timeUntilAiring: number;
    episode: number;
  } | null;
  isAdult?: boolean;
}

// Auth related types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  email: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// UI related types
export interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
  hideWhenAuthenticated?: boolean;
}
