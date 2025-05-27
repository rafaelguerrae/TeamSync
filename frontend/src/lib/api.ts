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

// API base URL from environment variables
const API_BASE_URL = typeof window !== 'undefined' 
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// In-memory token store (not accessible via XSS)
let accessToken: string | null = null;
let accessTokenExpiryTime: number | null = null;
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;
let isRefreshingOnLoad = false;

// Decode JWT without a library
function decodeJwt(token: string): { sub: string; email: string; exp: number; [key: string]: unknown } | null {
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

// Try to refresh token on page load
export function tryRefreshTokenOnLoad(): Promise<boolean> {
  if (isRefreshingOnLoad) {
    return refreshPromise || Promise.resolve(false);
  }

  if (hasValidAccessToken()) {
    return Promise.resolve(true);
  }

  isRefreshingOnLoad = true;
  return refreshToken().finally(() => {
    isRefreshingOnLoad = false;
  });
}

// Generic request function with token refresh
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Check if token is expired and refresh if needed
  if (accessToken && !hasValidAccessToken()) {
    await refreshToken();
  } else if (!accessToken) {
    // If no token at all, try to refresh once
    await tryRefreshTokenOnLoad();
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
      
      // Handle specific error cases
      if (response.status === 403) {
        // Forbidden - likely access control issue
        throw new Error(errorData.message || 'You do not have permission to access this resource');
      }
    } catch (jsonError) {
      // If JSON parsing fails, use the original error message
      if (response.status === 403) {
        throw new Error('You do not have permission to access this resource');
      }
    }
    
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
      console.log("Attempting to refresh token...");
      
      // Determine if we're making a cross-origin request
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      const isCrossOrigin = currentOrigin && !API_BASE_URL.startsWith(currentOrigin);
      
      console.log(`Refresh token request: ${API_BASE_URL}/refresh-token (cross-origin: ${isCrossOrigin})`);
      
      const response = await fetch(`${API_BASE_URL}/refresh-token`, {
        method: 'POST',
        credentials: 'include', // Important for sending the refresh token cookie
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors', // Explicitly set CORS mode
      });
      
      if (!response.ok) {
        console.error(`Refresh token failed with status: ${response.status}`);
        try {
          const errorData = await response.json();
          console.error('Refresh token error details:', errorData);
        } catch (e) {
          console.error('No JSON error details available');
        }
        clearAccessToken();
        return false;
      }
      
      const data = await response.json();
      console.log("Token refreshed successfully");
      setAccessToken(data.accessToken);
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      clearAccessToken();
      return false;
    } finally {
      isRefreshing = false;
    }
  })();
  
  return refreshPromise;
}

// Initialize the token refresh on module load if running in browser
if (typeof window !== 'undefined') {
  // Only run in browser context
  tryRefreshTokenOnLoad().catch(console.error);
}

// Unified API
export const api = {
  // Auth methods
  auth: {
    signIn: async (email: string, password: string): Promise<{ user: User }> => {
      try {
        console.log(`Attempting to sign in with email: ${email}`);
        const response = await fetch(`${API_BASE_URL}/signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
          mode: 'cors' // Explicitly set CORS mode
        });
        
        if (!response.ok) {
          console.error(`Login failed with status: ${response.status}`);
          const errorData = await response.json().catch(() => ({}));
          console.error('Login error details:', errorData);
          throw new Error(errorData.message || `Login failed: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Sign in successful, received access token");
        
        // Store access token in memory only (not localStorage)
        setAccessToken(data.accessToken);
        
        return { user: data.user };
      } catch (error) {
        console.error('Sign in error:', error);
        throw error;
      }
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
    
    refreshToken,
    hasValidAccessToken
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
      
    getByAlias: (alias: string) => 
      request<Team>(`/teams/alias/${alias}`),
      
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

      getAllByAlias: (alias: string) => 
        request<TeamMember[]>(`/teams/alias/${alias}/members`),
        
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