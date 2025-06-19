'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Alert,
  Fade,
  CircularProgress,
} from '@mui/material';
import { AdminPanelSettings, Visibility, VisibilityOff, Login } from '@mui/icons-material';
import { useAuth } from '@/lib/hooks/useAuth';

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [hasManuallyLoggedIn, setHasManuallyLoggedIn] = useState(false);
  
  const { login, isLoading, isAuthenticated, user, error: authError } = useAuth();

  // Only redirect if user has manually logged in, not on auto-authentication from stored tokens
  useEffect(() => {
    if (isAuthenticated && user && hasManuallyLoggedIn) {
      router.replace('/it-admin/dashboard');
    }
  }, [isAuthenticated, user, hasManuallyLoggedIn, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    // Basic validation
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setLocalError('Please enter a valid email address');
      return;
    }

    try {
      setHasManuallyLoggedIn(true); // Mark as manual login attempt
      const result = await login(email, password);
      
      if (result.success) {
        // The useEffect will handle the redirect automatically
        // No need to manually redirect here since useEffect will handle it
      } else {
        setLocalError(result.error || 'Login failed');
        setHasManuallyLoggedIn(false); // Reset if login failed
      }
    } catch (error: any) {
      setLocalError('An unexpected error occurred. Please try again.');
      setHasManuallyLoggedIn(false); // Reset if login failed
      console.error('Login error:', error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        p: 2,
      }}
    >
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: { xs: 150, md: 200 },
          height: { xs: 150, md: 200 },
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.3)',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: { xs: 200, md: 300 },
          height: { xs: 200, md: 300 },
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.2)',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
        <Fade in timeout={800}>
          <Box textAlign="center" mb={{ xs: 2, md: 3 }}>
            {/* <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: 60, md: 70 },
                height: { xs: 60, md: 70 },
                borderRadius: '50%',
                background: 'linear-gradient(135deg,rgb(25, 210, 201) 0%,rgb(66, 108, 245) 100%)',
                mb: { xs: 1.5, md: 2 },
              }}
            >
              <AdminPanelSettings sx={{ fontSize: { xs: 30, md: 35 }, color: 'white' }} />
            </Box> */}
            <Typography
              variant="h2"
              component="h1"
              sx={{
                color: '#1a1a1a',
                fontWeight: 700,
                mb: { xs: 0.5, md: 1 },
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                lineHeight: 1.1,
              }}
            >
              Xpo Match
            </Typography>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                color: '#666',
                fontWeight: 300,
                mb: { xs: 1, md: 1.5 },
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.25rem' },
                lineHeight: 1.2,
              }}
            >
              IT Admin Portal
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#666',
                fontWeight: 300,
                maxWidth: 400,
                mx: 'auto',
                fontSize: { xs: '0.9rem', md: '0.9rem' },
                lineHeight: 1.4,
              }}
            >
              Manage events, administrators, and oversee the entire AI-powered event management platform
            </Typography>
          </Box>
        </Fade>

        <Fade in timeout={1200}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              mb: { xs: 2, md: 3 },
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 1 } }}>
              <Typography
                variant="h5"
                component="h3"
                textAlign="center"
                sx={{
                  mt: { xs: 1, md: 1 },
                  color: '#1a1a1a',
                  fontWeight: 550,
                  mb: { xs: 1, md: 1 },
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                }}
              >
                Sign In
              </Typography>

              {(localError || authError) && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    background: 'rgba(244, 67, 54, 0.1)',
                    color: '#d32f2f',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    '& .MuiAlert-icon': {
                      color: '#d32f2f',
                    },
                  }}
                >
                  {localError || authError}
                </Alert>
              )}

              {/* {isAuthenticated && user && (
                <Alert
                  severity="success"
                  sx={{
                    mb: 2,
                    background: 'rgba(76, 175, 80, 0.1)',
                    color: '#2e7d32',
                    border: '1px solid rgba(76, 175, 80, 0.3)',
                    '& .MuiAlert-icon': {
                      color: '#2e7d32',
                    },
                  }}
                >
                  Welcome back, {user.firstName}! Redirecting to dashboard...
                </Alert>
              )} */}

              <Box component="form" onSubmit={handleLogin}
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                width: '100%', 
                maxWidth: 500, // Container width constraint
                mx: 'auto' // Center align in parent
              }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  size="medium"
                  sx={{
                    mb: 1.5,
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.8)',
                      '& fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.2)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#666',
                    },
                    '& .MuiInputBase-input': {
                      color: '#1a1a1a',
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  size="medium"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={togglePasswordVisibility}
                          edge="end"
                          sx={{ color: '#666' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.8)',
                      '& fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.2)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#666',
                    },
                    '& .MuiInputBase-input': {
                      color: '#1a1a1a',
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Login />}
                  sx={{
                    mt: 1,
                    py: 1.5,
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    fontWeight: 600,
                    background: 'linear-gradient(135deg,rgb(84, 112, 236) 0%,rgb(130, 178, 218) 100%) 100%)',
                    boxShadow: '0 4px 15px rgba(53, 73, 250, 0.65)',
                    '&:hover': {
                      background: 'linear-gradient(135deg,rgb(26, 65, 240) 0%,rgb(79, 101, 221) 100%) 100%)',
                      boxShadow: '0 4px 15px rgba(63, 44, 231, 0.65)',
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      background: 'rgba(0, 0, 0, 0.12)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isLoading ? 'Signing In...' : 'Sign In to Dashboard'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Fade>

        <Box textAlign="center">
          <Typography
            variant="body2"
            sx={{
              color: '#666',
              fontSize: { xs: '0.75rem', md: '0.875rem' },
            }}
          >
            © 2025 Xpo Match Platform. All rights reserved.
          </Typography>
        </Box>
      </Container>

      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </Box>
  );
} 