import { getAccessToken, hasValidAccessToken, authApi } from './auth';
import { User, Team, TeamMembership, TeamMember } from './api';

// Base API URL - adjust to match your backend
const API_BASE_URL = 'http://localhost:3000';

// Generic request function with token refresh
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Check if token is expired and refresh if needed
  if (!hasValidAccessToken()) {
    await authApi.refreshToken();
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Add authentication header with in-memory token
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };
  
  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // For cookies
    mode: 'cors', // Explicitly set CORS mode
  });
  
  if (!response.ok) {
    let errorMessage = `API error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {} // Ignore JSON parsing errors
    
    throw new Error(errorMessage);
  }
  
  return response.json();
}

// API methods that use the secure token handling
export const apiClient = {
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
  
  searchUsers: (query: string) =>
    request<User[]>(`/users/search?query=${encodeURIComponent(query)}`),
  
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