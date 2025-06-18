import { jwtDecode } from 'jwt-decode';
import { UserProfile } from '../store/api/authApi';

/**
 * Check if a JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    return decoded.exp ? decoded.exp < currentTime : true;
  } catch (error) {
    return true;
  }
};

/**
 * Decode JWT token and extract user profile
 */
export const decodeUserToken = (token: string): UserProfile | null => {
  try {
    const decoded = jwtDecode<UserProfile>(token);
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Get token from localStorage safely
 */
export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

/**
 * Get refresh token from localStorage safely
 */
export const getStoredRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
};

/**
 * Get user profile from localStorage safely
 */
export const getStoredUserProfile = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  
  const userProfile = localStorage.getItem('userProfile');
  if (!userProfile) return null;
  
  try {
    return JSON.parse(userProfile);
  } catch (error) {
    console.error('Error parsing stored user profile:', error);
    return null;
  }
};

/**
 * Clear all auth data from localStorage
 */
export const clearAuthStorage = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userProfile');
};

/**
 * Store auth data in localStorage
 */
export const storeAuthData = (token: string, refreshToken: string, userProfile: UserProfile): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('authToken', token);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('userProfile', JSON.stringify(userProfile));
};

/**
 * Check if user has specific permission/role
 */
export const hasPermission = (user: UserProfile | null, requiredRole: string): boolean => {
  if (!user) return false;
  return user.roleid === requiredRole;
};

/**
 * Format user's full name
 */
export const formatUserName = (user: UserProfile): string => {
  const parts = [user.firstName, user.middleName, user.lastName].filter(Boolean);
  return parts.join(' ');
}; 