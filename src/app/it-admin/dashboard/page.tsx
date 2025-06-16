'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  AppBar,
  Toolbar,
  Divider,
  Fade,
  Grow,
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Event as EventIcon,
  Email,
  Logout,
  Settings,
  Notifications,
  TrendingUp,
} from '@mui/icons-material';
import { Event, DashboardStats } from '@/types';
import CreateEventDialog from '@/components/it-admin/CreateEventDialog';
import { mockEvent, mockStats } from '@/lib/mockData';

export default function ITAdminDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Using mock data for demonstration
      setEvents([mockEvent]);
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    setCreateEventOpen(true);
  };

  const handleEventCreated = () => {
    setCreateEventOpen(false);
    fetchDashboardData();
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const statCards = [
    {
      title: 'Total Events',
      value: stats?.totalEvents || 0,
      icon: <EventIcon sx={{ fontSize: 48 }} />,
      color: '#1976d2',
      gradient: 'linear-gradient(135deg,rgb(84, 112, 236) 0%,rgb(130, 178, 218) 100%)',
      trend: '+12%',
      description: 'All events created',
    },
    {
      title: 'Active Events',
      value: stats?.activeEvents || 0,
      icon: <TrendingUp sx={{ fontSize: 48 }} />,
      color: '#2e7d32',
      gradient: 'linear-gradient(135deg,rgb(75, 207, 75) 0%,rgb(89, 167, 74) 100%)',
      trend: '+8%',
      description: 'Currently running',
    },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    }}>
      {/* Modern Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          color: 'text.primary',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        }}
      >
        <Toolbar sx={{ px: 4 }}>
          <Box display="flex" alignItems="center" flexGrow={1}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg,rgb(25, 210, 201) 0%,rgb(66, 108, 245) 100%)',
                mr: 2,
              }}
            >
              <EventIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                AI Matchmaking Platform
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>
                IT Administrator Dashboard
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <IconButton 
              color="inherit" 
              sx={{ 
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.08)' }
              }}
            >
              <Notifications />
            </IconButton>

            <IconButton onClick={handleProfileMenuOpen}>
              <Avatar sx={{ 
                width: 36, 
                height: 36, 
                background: 'linear-gradient(135deg,rgb(25, 167, 210) 0%,rgb(66, 108, 245) 100%)',
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }}>
                IA
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              onClick={handleProfileMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              <Divider />
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 2, fontSize: 20 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 2 }}>
        {/* Welcome Section */}
        <Fade in timeout={600}>
          <Box mb={3}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: '#1a1a1a',
                mb: 1,
              }}
            >
              Welcome back, Administrator
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#666',
                fontSize: '1.1rem',
              }}
            >
              Manage your events and monitor platform performance
            </Typography>
          </Box>
        </Fade>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={2}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Grow in timeout={800 + index * 200}>
                <Card
                  sx={{
                    background: stat.gradient,
                    color: 'white',
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                    overflow: 'hidden',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.16)',
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  <CardContent sx={{ p: 3}}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            opacity: 0.9,
                            mb: 1,
                          }}
                        >
                          {stat.title}
                        </Typography>
                        <Typography 
                          variant="h2" 
                          sx={{ 
                            fontWeight: 600,
                            mb: 1,
                            fontSize: '2rem',
                          }}
                        >
                          {stat.value}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={stat.trend}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(255, 255, 255, 0.2)',
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {stat.description}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ opacity: 0.8 }}>
                        {stat.icon}
                      </Box>
                    </Box>
                  </CardContent>
                  
                  {/* Decorative background elements */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      right: -20,
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.1)',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -30,
                      left: -30,
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.05)',
                    }}
                  />
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* Events Management */}
        <Fade in timeout={1200}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg,rgb(84, 112, 236) 0%,rgb(130, 178, 218) 100%)',
                color: 'white',
                p: 3,
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    Events Management
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Create and manage your events efficiently
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleCreateEvent}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Create Event
                </Button>
              </Box>
            </Box>

            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>Event Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Event ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Event Admin</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Participants</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow 
                        key={event.id} 
                        hover
                        sx={{
                          '&:hover': {
                            bgcolor: '#f8f9ff',
                          },
                        }}
                      >
                        <TableCell sx={{ py: 3 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {event.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {event.location}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: 'monospace',
                              bgcolor: '#f5f5f5',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              display: 'inline-block',
                            }}
                          >
                            {event.eventId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatDate(event.startDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={event.status}
                            color={getStatusColor(event.status) as any}
                            size="small"
                            sx={{ 
                              textTransform: 'capitalize',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {event.eventAdminId ? (
                            <Chip
                              label="Assigned"
                              color="success"
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          ) : (
                            <Chip
                              label="Not Assigned"
                              color="warning"
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            V: 6 | E: 4
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <IconButton 
                              size="small" 
                              color="primary"
                              sx={{
                                '&:hover': { 
                                  bgcolor: 'primary.light',
                                  color: 'white',
                                },
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="info"
                              sx={{
                                '&:hover': { 
                                  bgcolor: 'info.light',
                                  color: 'white',
                                },
                              }}
                            >
                              <Email fontSize="small" />
                            </IconButton>
                            
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {events.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                          <Box>
                            <EventIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                              No events created yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Create your first event to get started with the platform
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Fade>

        {/* Create Event Dialog */}
        <CreateEventDialog
          open={createEventOpen}
          onClose={() => setCreateEventOpen(false)}
          onEventCreated={handleEventCreated}
        />
      </Container>
    </Box>
  );
} 