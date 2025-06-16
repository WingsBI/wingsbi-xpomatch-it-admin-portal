'use client';

import { useState } from 'react';
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
} from '@mui/material';
import { AdminPanelSettings, Visibility, VisibilityOff, Login } from '@mui/icons-material';

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simple validation without API
    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Simulate loading for better UX
    setTimeout(() => {
      // For demo purposes, any valid email/password combination works
      router.push('/it-admin/dashboard');
    }, 1000);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        background: 'linear-gradient(135deg,rgb(84, 112, 236) 0%,rgb(130, 178, 218) 100%)',
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
          background: 'rgba(255, 255, 255, 0.1)',
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
          background: 'rgba(255, 255, 255, 0.05)',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
        <Fade in timeout={800}>
          <Box textAlign="center" mb={{ xs: 2, md: 3 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: 60, md: 70 },
                height: { xs: 60, md: 70 },
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                mb: { xs: 1.5, md: 2 },
              }}
            >
              <AdminPanelSettings sx={{ fontSize: { xs: 30, md: 35 }, color: 'white' }} />
            </Box>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                color: 'white',
                fontWeight: 700,
                mb: { xs: 0.5, md: 1 },
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                background: 'linear-gradient(45deg, #fff 30%, rgba(255,255,255,0.8) 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.1,
              }}
            >
              Xpo Match
            </Typography>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                color: 'white',
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
                color: 'rgba(255, 255, 255, 0.9)',
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
              backdropFilter: 'blur(20px)',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
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
                  color: 'white',
                  fontWeight: 500,
                  mb: { xs: 1, md: 1 },
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                }}
              >
                Welcome Back
              </Typography>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    background: 'rgba(244, 67, 54, 0.1)',
                    color: 'white',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    '& .MuiAlert-icon': {
                      color: '#ff6b6b',
                    },
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleLogin}>
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
                      background: 'rgba(255, 255, 255, 0.1)',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'white',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
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
                          sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'white',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  startIcon={isLoading ? null : <Login />}
                  sx={{
                    mt: 1,
                    py: 1.5,
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    fontWeight: 600,
                    background: 'linear-gradient(135deg,rgb(84, 112, 236) 0%,rgb(130, 178, 218) 100%)',
                    boxShadow: '0 4px 15px rgba(23, 5, 126, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg,rgb(40, 77, 241) 0%,rgb(104, 169, 223) 100%)',
                      boxShadow: '0 6px 20px rgba(25, 118, 210, 0.6)',
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      background: 'rgba(255, 255, 255, 0.2)',
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
              color: 'rgba(255, 255, 255, 0.7)',
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

        
        }
      `}</style>
    </Box>
  );
} 