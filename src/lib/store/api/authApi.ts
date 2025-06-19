import { baseApi } from './baseApi';
import { jwtDecode } from 'jwt-decode';

// Types for API responses
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  version: string;
  statusCode: number;
  message: string;
  isError: boolean;
  responseException: null | string;
  result: {
    token: string;
    refreshToken: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  roleid: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Authentication API endpoints
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Login endpoint
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/api/Auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          if (data.statusCode === 200 && data.result) {
            const { token, refreshToken } = data.result;
            
            // Store tokens in localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem('authToken', token);
              localStorage.setItem('refreshToken', refreshToken);
              
              // Decode JWT and extract user info
              try {
                const decodedToken = jwtDecode<UserProfile>(token);
                localStorage.setItem('userProfile', JSON.stringify(decodedToken));
                
                // Import and dispatch setCredentials action to update Redux state
                const { setCredentials } = await import('../slices/authSlice');
                dispatch(setCredentials({
                  user: decodedToken,
                  token,
                  refreshToken
                }));
                
                // Update auth state
                dispatch(authApi.util.invalidateTags(['Auth', 'User']));
              } catch (error) {
                console.error('Error decoding token:', error);
              }
            }
          }
        } catch (error) {
          console.error('Login error:', error);
        }
      },
      invalidatesTags: ['Auth'],
    }),

    // Refresh token endpoint
    refreshToken: builder.mutation<LoginResponse, RefreshTokenRequest>({
      query: (refreshData) => ({
        url: '/api/Auth/refresh',
        method: 'POST',
        body: refreshData,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          if (data.statusCode === 200 && data.result) {
            const { token, refreshToken } = data.result;
            
            if (typeof window !== 'undefined') {
              localStorage.setItem('authToken', token);
              localStorage.setItem('refreshToken', refreshToken);
              
              // Decode and store new user info
              try {
                const decodedToken = jwtDecode<UserProfile>(token);
                localStorage.setItem('userProfile', JSON.stringify(decodedToken));
                
                // Update Redux state with new credentials
                const { setCredentials } = await import('../slices/authSlice');
                dispatch(setCredentials({
                  user: decodedToken,
                  token,
                  refreshToken
                }));
              } catch (error) {
                console.error('Error decoding refreshed token:', error);
              }
            }
          }
        } catch (error) {
          console.error('Token refresh error:', error);
        }
      },
      invalidatesTags: ['Auth'],
    }),

    // Get current user profile
    getCurrentUser: builder.query<UserProfile, void>({
      queryFn: () => {
        if (typeof window !== 'undefined') {
          const userProfile = localStorage.getItem('userProfile');
          if (userProfile) {
            return { data: JSON.parse(userProfile) };
          }
        }
        return { error: { status: 'FETCH_ERROR', error: 'No user profile found' } };
      },
      providesTags: ['User'],
    }),

    // Logout
    logout: builder.mutation<void, void>({
      queryFn: async (arg, api) => {
        if (typeof window !== 'undefined') {
          // Clear all auth-related localStorage items
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userProfile');
          
          // Clear any other auth-related localStorage items
          Object.keys(localStorage).forEach(key => {
            if (key.toLowerCase().includes('auth') || 
                key.toLowerCase().includes('token') || 
                key.toLowerCase().includes('user')) {
              localStorage.removeItem(key);
            }
          });

          // Clear all session storage
          sessionStorage.clear();
          
          // Clear all cookies
          document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
          
          // Update Redux state
          try {
            const { logOut } = await import('../slices/authSlice');
            api.dispatch(logOut());
          } catch (error) {
            console.error('Error clearing auth state:', error);
          }
        }
        return { data: undefined };
      },
      invalidatesTags: ['Auth', 'User'],
    }),

    // Check authentication status
    checkAuth: builder.query<boolean, void>({
      queryFn: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('authToken');
          return { data: !!token };
        }
        return { data: false };
      },
      providesTags: ['Auth'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
  useCheckAuthQuery,
} = authApi; 