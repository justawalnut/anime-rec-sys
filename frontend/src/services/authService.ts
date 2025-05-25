import { apiPost, apiGet } from './api';

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

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const login = async (username: string, password: string): Promise<AuthResponse> => {
  const response = await apiPost<AuthResponse>('/auth/login', { username, password });
  return response;
};

export const register = async (
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await apiPost<AuthResponse>('/auth/register', { username, email, password });
  return response;
};

export const getCurrentUser = async (token?: string): Promise<User> => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
  const response = await apiGet<User>('/user/me', config);
  return response;
};
