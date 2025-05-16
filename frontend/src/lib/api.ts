// Types based on backend schema
export interface User {
  id: number;
  alias?: string;
  email: string;
  name?: string;
  image: string;
  password?: string;
}

export interface Team {
  id: number;
  alias?: string;
  name: string;
  description?: string;
  image: string;
}

export interface TeamMembership {
  role: string;
  joinedAt: string;
  team: Team;
}

export interface TeamMember {
  role: string;
  joinedAt: string;
  user: User;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// API base URL
const API_BASE_URL = 'http://localhost:3000';

// In-memory token store (not accessible via XSS)
let accessToken: string | null = null;
let accessTokenExpiryTime: number | null = null;
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// Decode JWT without a library
function decodeJwt(token: string): { sub: string; email: string; exp: number; [key: string]: any } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error decoding JWT:', e);
    return null;
  }
}

// Token management
export function setAccessToken(token: string): void {
  accessToken = token;
  
  // Decode token to get expiry time
  const decoded = decodeJwt(token);
  if (decoded && decoded.exp) {
    accessTokenExpiryTime = decoded.exp * 1000; // Convert to milliseconds
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function clearAccessToken(): void {
  accessToken = null;
  accessTokenExpiryTime = null;
}

export function hasValidAccessToken(): boolean {
  return !!accessToken && !!accessTokenExpiryTime && Date.now() < accessTokenExpiryTime;
}

// Get headers with auth token
const getHeaders = (customHeaders = {}): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string> || {})
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return headers;
};

// Generic request function with token refresh
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Check if token is expired and refresh if needed
  if (accessToken && !hasValidAccessToken()) {
    await refreshToken();
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Add authentication headers
  const headers = getHeaders(options.headers || {});
  
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // For cookies
    mode: 'cors', // Explicitly set CORS mode
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token might be expired or invalid
      clearAccessToken();
    }
    
    let errorMessage = `API error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {} // Ignore JSON parsing errors
    
    throw new Error(errorMessage);
  }
  
  return response.json();
}

// Token refresh function
async function refreshToken(): Promise<boolean> {
  // Use a single refresh promise to prevent multiple simultaneous refresh requests
  if (isRefreshing) {
    return refreshPromise!;
  }
  
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/refresh-token`, {
        method: 'POST',
        credentials: 'include' // Important for sending the refresh token cookie
      });
      
      if (!response.ok) {
        clearAccessToken();
        return false;
      }
      
      const data = await response.json();
      setAccessToken(data.accessToken);
      return true;
    } catch (error) {
      clearAccessToken();
      return false;
    } finally {
      isRefreshing = false;
    }
  })();
  
  return refreshPromise;
}

// Unified API
export const api = {
  // Auth methods
  auth: {
    signIn: async (email: string, password: string): Promise<{ user: User }> => {
      const response = await fetch(`${API_BASE_URL}/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store access token in memory only (not localStorage)
      setAccessToken(data.accessToken);
      
      return { user: data.user };
    },
    
    signUp: async (userData: { 
      name?: string; 
      alias?: string; 
      email: string; 
      password: string; 
      image: string 
    }): Promise<User> => {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Signup failed: ${response.status}`);
      }
      
      return response.json();
    },
    
    signOut: async (): Promise<void> => {
      // Clear in-memory token
      clearAccessToken();
      
      // Call logout endpoint to clear refresh token cookie
      await fetch(`${API_BASE_URL}/signout`, {
        method: 'POST',
        credentials: 'include'
      }).catch(err => console.error('Error during signout:', err));
    },
    
    refreshToken
  },
  
  // User methods
  users: {
    getCurrent: () => 
      request<User>('/users/me'),
      
    update: (userId: number, userData: Partial<User>) => 
      request<User>(`/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(userData),
      }),
      
    getUserTeams: (userId: number) => 
      request<TeamMembership[]>(`/users/${userId}/teams`),
    
    search: (query: string) =>
      request<User[]>(`/users/search?query=${encodeURIComponent(query)}`)
  },
  
  // Team methods
  teams: {
    getAll: () => 
      request<Team[]>('/teams'),
      
    getOne: (teamId: number) => 
      request<Team>(`/teams/${teamId}`),
      
    create: (teamData: Omit<Team, 'id'>) => 
      request<Team>('/teams', {
        method: 'POST',
        body: JSON.stringify(teamData),
      }),
      
    update: (teamId: number, teamData: Partial<Team>) => 
      request<Team>(`/teams/${teamId}`, {
        method: 'PATCH',
        body: JSON.stringify(teamData),
      }),
      
    delete: (teamId: number) => 
      request<Team>(`/teams/${teamId}`, {
        method: 'DELETE',
      }),
    
    // Team members
    members: {
      getAll: (teamId: number) => 
        request<TeamMember[]>(`/teams/${teamId}/members`),
        
      add: (teamId: number, userId: number, role: string) => 
        request<{ userId: number; teamId: number; role: string }>(`/teams/${teamId}/members`, {
          method: 'POST',
          body: JSON.stringify({ userId, role }),
        }),
        
      updateRole: (teamId: number, userId: number, role: string) => 
        request<{ userId: number; teamId: number; role: string }>(`/teams/${teamId}/members`, {
          method: 'PATCH',
          body: JSON.stringify({ userId, role }),
        }),
        
      remove: (teamId: number, userId: number) => 
        request<void>(`/teams/${teamId}/members/${userId}`, {
          method: 'DELETE',
        }),
    }
  }
}; 