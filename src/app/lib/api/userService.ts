// User Management API - Handles authentication, user data, and workspace management
export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  picture?: string;
  provider?: string;
  credit?: number;
  status?: string;
  email_verified?: boolean;
  created_at?: string;
  avatar?: string;
  createdAt?: Date;
  lastLoginAt?: Date;
  subscription?: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    expiresAt?: Date;
  };
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: WorkspaceMember[];
  settings: WorkspaceSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  permissions: string[];
}

export interface WorkspaceSettings {
  facebookPageId?: string;
  facebookAccessToken?: string;
  timezone: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    slack?: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

class UserService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = 'https://superbai.io/api';
    this.token = typeof window !== 'undefined' ? localStorage.getItem('famarex_token') : null;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.handleUnauthorized();
      }
      const errorText = await response.text();
      throw new Error(`Login failed: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  private handleUnauthorized() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('famarex_token');
      localStorage.removeItem('famarex_refresh_token');
      localStorage.removeItem('famarex_user');
      window.location.href = '/';
    }
  }

  private setAuthData(authResponse: AuthResponse) {
    this.token = authResponse.access_token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('famarex_token', authResponse.access_token);
      localStorage.setItem('famarex_refresh_token', authResponse.refresh_token);
      localStorage.setItem('famarex_user', JSON.stringify(authResponse.user));
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('Attempting login with SuperbAI API...');
    
    try {
      const response = await this.makeRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      console.log('Login successful:', response);
      this.setAuthData(response);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    console.log('Attempting registration with SuperbAI API...');
    
    try {
      const response = await this.makeRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      console.log('Registration successful:', response);
      this.setAuthData(response);
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await this.makeRequest('/auth/logout', { method: 'POST' });
      }
    } catch (error) {
      console.warn('Logout request failed, clearing local data');
    } finally {
      this.token = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('famarex_token');
        localStorage.removeItem('famarex_refresh_token');
        localStorage.removeItem('famarex_user');
      }
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('famarex_refresh_token') : null;
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.makeRequest<AuthResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      
      this.setAuthData(response);
      return response;
    } catch (error) {
      this.handleUnauthorized();
      throw error;
    }
  }

  // User management methods
  async getCurrentUser(): Promise<User> {
    try {
      return await this.makeRequest<User>('/users/me');
    } catch (error) {
      // Return cached user data if available
      if (typeof window !== 'undefined') {
        const cachedUser = localStorage.getItem('famarex_user');
        if (cachedUser) {
          return JSON.parse(cachedUser);
        }
      }
      throw error;
    }
  }

  async updateUser(userData: Partial<User>): Promise<User> {
    try {
      return await this.makeRequest<User>('/users/me', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
    } catch (error) {
      console.warn('User update failed');
      throw error;
    }
  }

  // Workspace management methods
  async getWorkspaces(): Promise<Workspace[]> {
    try {
      return await this.makeRequest<Workspace[]>('/workspaces');
    } catch (error) {
      console.warn('Workspaces unavailable, using mock data');
      return [
        {
          id: '1',
          name: 'My Marketing Workspace',
          description: 'Main workspace for Facebook marketing campaigns',
          ownerId: '1',
          members: [
            {
              userId: '1',
              role: 'owner',
              joinedAt: new Date(),
              permissions: ['read', 'write', 'admin']
            }
          ],
          settings: {
            facebookPageId: 'mock_page_id',
            timezone: 'UTC',
            currency: 'USD',
            notifications: {
              email: true,
              push: true
            }
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
    }
  }

  async createWorkspace(workspaceData: Partial<Workspace>): Promise<Workspace> {
    try {
      return await this.makeRequest<Workspace>('/workspaces', {
        method: 'POST',
        body: JSON.stringify(workspaceData),
      });
    } catch (error) {
      console.warn('Workspace creation failed');
      throw error;
    }
  }

  async updateWorkspace(workspaceId: string, workspaceData: Partial<Workspace>): Promise<Workspace> {
    try {
      return await this.makeRequest<Workspace>(`/workspaces/${workspaceId}`, {
        method: 'PUT',
        body: JSON.stringify(workspaceData),
      });
    } catch (error) {
      console.warn('Workspace update failed');
      throw error;
    }
  }

  async deleteWorkspace(workspaceId: string): Promise<void> {
    try {
      await this.makeRequest(`/workspaces/${workspaceId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('Workspace deletion failed');
      throw error;
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }
}

export const userService = new UserService();
