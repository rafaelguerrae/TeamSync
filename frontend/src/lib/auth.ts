import { User } from './api';

// In-memory token store (not accessible via XSS)
let accessToken: string | null = null;
let accessTokenExpiryTime: number | null = null;
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

interface TokenPayload {
  sub: string;
  email: string;
  exp: number;
  [key: string]: any;
}

// Decode JWT without a library
function decodeJwt(token: string): TokenPayload | null {
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

// Check if token is expired
function isTokenExpired(token: string): boolean {
  const decoded = decodeJwt(token);
  if (!decoded) return true;
  
  // Get expiration time from token and compare with current time
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

// Set the access token in memory
export function setAccessToken(token: string): void {
  accessToken = token;
  
  // Decode token to get expiry time
  const decoded = decodeJwt(token);
  if (decoded && decoded.exp) {
    accessTokenExpiryTime = decoded.exp * 1000; // Convert to milliseconds
    console.log(`Token will expire at: ${new Date(accessTokenExpiryTime).toLocaleTimeString()}`);
  }
}

// Get the access token from memory
export function getAccessToken(): string | null {
  return accessToken;
}

// Clear the access token from memory
export function clearAccessToken(): void {
  accessToken = null;
  accessTokenExpiryTime = null;
  console.log('Access token cleared');
}

// Check if the access token is valid
export function hasValidAccessToken(): boolean {
  const isValid = !!accessToken && !!accessTokenExpiryTime && Date.now() < accessTokenExpiryTime;
  if (!isValid && accessToken) {
    console.log('Token is invalid or expired');
  }
  return isValid;
}

// API base URL
const API_BASE_URL = 'http://localhost:3000';

// Auth API that handles both in-memory token and refresh token cookie
export const authApi = {
  signIn: async (email: string, password: string): Promise<{ user: User }> => {
    const response = await fetch(`${API_BASE_URL}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include' // Important for cookies
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Login failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Login successful, storing access token');
    
    // Store access token in memory only (not localStorage)
    setAccessToken(data.accessToken);
    
    return { user: data.user };
  },

  signUp: async(name: string, alias: string, email: string, password: string, image: string): Promise<{ user: User }> => {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, alias, email, password, image }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Signup failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Signup successful, storing access token');

    return { user: data.user };
  },
  
  signOut: async (): Promise<void> => {
    // Clear in-memory token
    clearAccessToken();
    
    // Call logout endpoint to clear refresh token cookie
    await fetch(`${API_BASE_URL}/signout`, {
      method: 'POST',
      credentials: 'include'
    }).catch(err => console.error('Error during signout:', err));
    
    console.log('Signed out successfully');
  },
  
  refreshToken: async (): Promise<boolean> => {
    // Use a single refresh promise to prevent multiple simultaneous refresh requests
    if (isRefreshing) {
      console.log('Token refresh already in progress, waiting...');
      return refreshPromise!;
    }
    
    console.log('Attempting to refresh token...');
    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/refresh-token`, {
          method: 'POST',
          credentials: 'include' // Important for sending the refresh token cookie
        });
        
        if (!response.ok) {
          console.error(`Token refresh failed: ${response.status}`);
          clearAccessToken();
          return false;
        }
        
        const data = await response.json();
        console.log('Token refreshed successfully');
        setAccessToken(data.accessToken);
        return true;
      } catch (error) {
        console.error('Failed to refresh token:', error);
        clearAccessToken();
        return false;
      } finally {
        isRefreshing = false;
      }
    })();
    
    return refreshPromise;
  },
  
  getCurrentUser: async (): Promise<User> => {
    // If token is invalid or expired, try to refresh it
    if (!hasValidAccessToken()) {
      console.log('Token invalid, attempting refresh before getCurrentUser');
      const refreshed = await authApi.refreshToken();
      if (!refreshed) {
        console.error('Token refresh failed, authentication required');
        throw new Error('Authentication required');
      }
    }
    
    console.log('Fetching current user with token');
    
    // Use the in-memory token for the request
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      // If unauthorized, clear token and throw error
      if (response.status === 401) {
        console.error('Unauthorized access, clearing token');
        clearAccessToken();
      }
      throw new Error('Failed to get user data');
    }
    
    const userData = await response.json();
    console.log('User data fetched successfully');
    return userData;
  }
};

// Helper to add auth header to requests
export function getAuthHeader(): HeadersInit {
  return accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {};
} 