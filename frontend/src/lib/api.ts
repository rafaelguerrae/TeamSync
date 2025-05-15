// Base API URL - adjust to match your backend
const API_BASE_URL = 'http://localhost:3000';

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

// Token management
const TOKEN_KEY = 'auth_token';

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

// Get headers with auth token if available
const getHeaders = (customHeaders = {}): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Generic request function
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Add authentication header if token exists
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
      removeToken();
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

// API methods
export const api = {
  // Auth
  signIn: async (email: string, password: string) => {
    const response = await request<AuthResponse>('/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store the token for future requests
    if (response.accessToken) {
      setToken(response.accessToken);
    }
    
    return response;
  },
    
  signUp: async (userData: { email: string; password: string; name?: string; alias?: string; image: string }) => {
    const user = await request<User>('/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    return user;
  },
  
  signOut: () => {
    removeToken();
    return Promise.resolve();
  },
  
  // User
  getCurrentUser: () => 
    request<User>('/users/me'),
    
  updateUser: (userId: number, userData: Partial<User>) => 
    request<User>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    }),
    
  getUserTeams: (userId: number) => 
    request<TeamMembership[]>(`/users/${userId}/teams`),
  
  // Teams
  getTeams: () => 
    request<Team[]>('/teams'),
    
  getTeam: (teamId: number) => 
    request<Team>(`/teams/${teamId}`),
    
  createTeam: (teamData: Omit<Team, 'id'>) => 
    request<Team>('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    }),
    
  updateTeam: (teamId: number, teamData: Partial<Team>) => 
    request<Team>(`/teams/${teamId}`, {
      method: 'PATCH',
      body: JSON.stringify(teamData),
    }),
    
  deleteTeam: (teamId: number) => 
    request<Team>(`/teams/${teamId}`, {
      method: 'DELETE',
    }),
    
  getTeamMembers: (teamId: number) => 
    request<TeamMember[]>(`/teams/${teamId}/members`),
    
  addTeamMember: (teamId: number, userId: number, role: string) => 
    request<{ userId: number; teamId: number; role: string }>(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    }),
    
  updateMemberRole: (teamId: number, userId: number, role: string) => 
    request<{ userId: number; teamId: number; role: string }>(`/teams/${teamId}/members`, {
      method: 'PATCH',
      body: JSON.stringify({ userId, role }),
    }),
    
  removeTeamMember: (teamId: number, userId: number) => 
    request<void>(`/teams/${teamId}/members/${userId}`, {
      method: 'DELETE',
    }),
}; 