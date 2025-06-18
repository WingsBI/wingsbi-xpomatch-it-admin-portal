import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';

// Define the base query with auth header injection
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Get token from localStorage or state
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Enhanced base query with error handling and token refresh
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // Handle 401 responses - token expired
  if (result.error && result.error.status === 401) {
    // Try to refresh token
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    
    if (refreshToken) {
      // Attempt token refresh (you can implement this endpoint later)
      const refreshResult = await baseQuery(
        {
          url: '/api/Auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );
      
      if (refreshResult.data) {
        // Store new token and retry original request
        const newTokenData = refreshResult.data as any;
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', newTokenData.result.token);
          localStorage.setItem('refreshToken', newTokenData.result.refreshToken);
        }
        
        // Retry the original query
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, logout user
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userProfile');
          window.location.href = '/';
        }
      }
    }
  }
  
  return result;
};

// Create the main API slice
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'User', 'Event', 'Admin'],
  endpoints: () => ({}),
});

export default baseApi; 