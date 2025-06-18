import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  initializeAuth, 
  selectCurrentUser, 
  selectIsAuthenticated, 
  selectAuthLoading, 
  selectAuthError,
  logOut 
} from '../store/slices/authSlice';
import { 
  useLoginMutation, 
  useLogoutMutation, 
  useGetCurrentUserQuery 
} from '../store/api/authApi';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  
  // API mutations
  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();
  
  // Initialize auth state on hook mount
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);
  
  // Login function
  const login = async (email: string, password: string) => {
    try {
      const result = await loginMutation({ email, password }).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      return { 
        success: false, 
        error: error?.data?.message || 'Login failed' 
      };
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      await logoutMutation().unwrap();
      // Dispatch logout action to clear Redux state
      dispatch(logOut());
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Logout failed' };
    }
  };
  
  return {
    // State
    user,
    isAuthenticated,
    isLoading: isLoading || isLoginLoading,
    error,
    
    // Actions
    login,
    logout,
  };
}; 