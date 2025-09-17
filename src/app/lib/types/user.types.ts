// User-related types and interfaces

export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
  is_verified?: boolean;
  last_login?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  username?: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface UpdateUserRequest {
  name?: string;
  username?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}
