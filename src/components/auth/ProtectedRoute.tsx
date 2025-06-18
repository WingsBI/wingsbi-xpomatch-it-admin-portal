'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '@/lib/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    // If authenticated but user doesn't have required role
    if (isAuthenticated && user && requiredRole) {
      if (user.roleid !== requiredRole) {
        // Redirect to unauthorized page or dashboard
        router.push('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, router, requiredRole]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Verifying authentication...
        </Typography>
      </Box>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  // Don't render children if role is required but user doesn't have it
  if (requiredRole && user.roleid !== requiredRole) {
    return null;
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
} 