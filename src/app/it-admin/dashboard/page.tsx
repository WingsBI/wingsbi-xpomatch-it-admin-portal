'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
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
  Collapse,
  CircularProgress,
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
  ExpandMore,
  ExpandLess,
  Visibility,
  PersonAdd,
  Person,
  Business,
  ViewList,
  Group,
  Info,
} from '@mui/icons-material';
import { Event, DashboardStats, Customer, CustomerWithEvents } from '@/types';
import CreateEventDialog from '@/components/it-admin/CreateEventDialog';
import EditEventDialog from '@/components/it-admin/EditEventDialog';
import CreateCustomerDialog from '@/components/it-admin/CreateCustomerDialog';
import { mockEvent, mockStats } from '@/lib/mockData';
import { useGetAllEventsQuery, EventFromAPI } from '@/lib/store/api/eventsApi';
import { useGetAllCustomersQuery, Customer as APICustomer, CustomerEvent } from '@/lib/store/api/adminApi';

export default function ITAdminDashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [editEventOpen, setEditEventOpen] = useState(false);
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'events' | 'customers'>('customers');
  const [customersWithEvents, setCustomersWithEvents] = useState<CustomerWithEvents[]>([]);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [highlightedEvent, setHighlightedEvent] = useState<string | null>(null);

  // Fetch events using the real API
  const { data: eventsResponse, isLoading, error, refetch } = useGetAllEventsQuery();

  // Fetch customers using the real API
  const { 
    data: customersResponse, 
    isLoading: isCustomersLoading, 
    error: customersError, 
    refetch: refetchCustomers 
  } = useGetAllCustomersQuery();

  // Function to map API response to Event interface
  const mapApiEventToEvent = (apiEvent: EventFromAPI, customers: APICustomer[]): Event => {
    // Map eventStatusId to readable status
    const getStatusFromId = (statusId: number): 'draft' | 'active' | 'completed' | 'cancelled' => {
      switch (statusId) {
        case 1: return 'active';
        case 2: return 'draft';
        case 3: return 'completed';
        case 4: return 'cancelled';
        default: return 'draft';
      }
    };

    // Find the customer associated with this event from the customers API
    const associatedCustomer = customers.find(customer => 
      customer.events.some(event => event.id === apiEvent.id)
    );

    return {
      id: apiEvent.id.toString(),
      eventId: apiEvent.identifier || apiEvent.id.toString(),
      name: apiEvent.title,
      description: apiEvent.description,
      startDate: new Date(apiEvent.startDateTime),
      endDate: new Date(apiEvent.enddatetime),
      location: 'N/A', // Not provided in API response
      status: getStatusFromId(apiEvent.eventStatusId),
      createdBy: apiEvent.createdBy.toString(),
      customerId: associatedCustomer?.id.toString() || '',
      customerFirstName: associatedCustomer?.firstName || '',
      customerLastName: associatedCustomer?.lastName || '',
      customerEmail: associatedCustomer?.emailAddress || '',
      customerCompany: associatedCustomer?.companyName || '',
      eventAdminId: apiEvent.eventAdministratorId.toString(),
      eventAdminFirstName: apiEvent.firstName,
      eventAdminLastName: apiEvent.lastName,
      eventAdminEmail: apiEvent.email,
      customAttributes: [],
      marketingAbbreviation: apiEvent.marketingAbbreviation,
      eventLogo: undefined, // Not provided in API response
      fontFamily: undefined, // Not provided in API response
      theme: undefined, // Not provided in API response
      createdAt: new Date(apiEvent.createdDate),
      updatedAt: new Date(apiEvent.modifiedDate || apiEvent.createdDate),
    };
  };

  // Function to group events by customers using real API data
  const groupEventsByCustomers = (customers: APICustomer[]): CustomerWithEvents[] => {
    return customers.map(customer => {
      // Map customer events to Event interface for display
      const mappedEvents = customer.events.map(event => {
        // Map eventStatusId to readable status
        const getStatusFromId = (statusId: number): 'draft' | 'active' | 'completed' | 'cancelled' => {
          switch (statusId) {
            case 1: return 'active';
            case 2: return 'draft';
            case 3: return 'completed';
            case 4: return 'cancelled';
            default: return 'draft';
          }
        };

        return {
          id: event.id.toString(),
          eventId: event.id.toString(),
          name: event.title,
          description: event.description,
          startDate: new Date(event.startDateTime),
          endDate: new Date(event.enddatetime),
          location: 'N/A',
          status: getStatusFromId(event.eventStatusId),
          createdBy: event.createdBy.toString(),
          customerId: customer.id.toString(),
          customerFirstName: customer.firstName,
          customerLastName: customer.lastName,
          customerEmail: customer.emailAddress,
          customerCompany: customer.companyName,
          eventAdminId: '', // Not available in customer events
          eventAdminFirstName: '',
          eventAdminLastName: '',
          eventAdminEmail: '',
          customAttributes: [],
          marketingAbbreviation: '',
          eventLogo: undefined,
          fontFamily: undefined,
          theme: undefined,
          createdAt: new Date(event.createdDate),
          updatedAt: new Date(event.modifiedDate || event.createdDate),
        } as Event;
      });

      // Convert API customer to our Customer interface
      const mappedCustomer: Customer = {
        id: customer.id.toString(),
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.emailAddress,
        phone: customer.phoneNumber || '',
        companyName: customer.companyName,
        position: '', // Not available in API
        customerType: 'business', // Default value since not in API
        city: customer.city,
        state: customer.stateProvince,
        country: customer.country,
        createdAt: new Date(customer.createdDate),
        updatedAt: new Date(customer.modifiedDate || customer.createdDate),
      };

      return {
        customer: mappedCustomer,
        events: mappedEvents,
        totalEvents: customer.events.length,
        activeEvents: customer.events.filter(event => event.eventStatusId === 1).length,
      };
    });
  };

  useEffect(() => {
    // Wait for both APIs to load
    if (customersResponse?.result) {
      // Group customers with their events
      const groupedCustomers = groupEventsByCustomers(customersResponse.result);
      setCustomersWithEvents(groupedCustomers);
    }

    // Also update events from the events API if needed
    if (eventsResponse?.result && customersResponse?.result) {
      const mappedEvents = eventsResponse.result.map(event => mapApiEventToEvent(event, customersResponse.result || []));
      setEvents(mappedEvents);
    }
    
    // Set mock stats for now since we don't have a stats API
    setStats(mockStats);
  }, [eventsResponse, customersResponse]);

  const fetchDashboardData = async () => {
    // Refetch both events and customers data
    refetch();
    refetchCustomers();
  };

  const handleCreateEvent = () => {
    setCreateEventOpen(true);
  };

  const handleCreateCustomer = () => {
    setCreateCustomerOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setEditEventOpen(true);
  };

  const handleEventCreated = () => {
    setCreateEventOpen(false);
    fetchDashboardData();
  };

  const handleEventUpdated = () => {
    setEditEventOpen(false);
    setSelectedEvent(null);
    fetchDashboardData();
  };

  const handleCustomerCreated = () => {
    setCreateCustomerOpen(false);
    // Refresh customer data after creating a new customer
    refetchCustomers();
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        // Clear all cookies
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        // Force a small delay to ensure state is cleared
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Use window.location for a full page refresh and redirect
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRowExpand = (eventId: string) => {
    setExpandedRow(expandedRow === eventId ? null : eventId);
  };

  const handleCustomerExpand = (customerId: string) => {
    setExpandedCustomer(expandedCustomer === customerId ? null : customerId);
  };

  const handleViewModeChange = (mode: 'events' | 'customers') => {
    setViewMode(mode);
    setExpandedRow(null);
    setExpandedCustomer(null);
  };

  const handleEventInfo = (eventId: string) => {
    // Switch to events view
    setViewMode('events');
    setExpandedCustomer(null);
    
    // Highlight the event
    setHighlightedEvent(eventId);
    
    // Scroll to the event after a brief delay to allow view change
    setTimeout(() => {
      const eventRow = document.querySelector(`[data-event-id="${eventId}"]`);
      if (eventRow) {
        eventRow.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 100);
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      setHighlightedEvent(null);
    }, 3000);
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
              <EventIcon sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                Xpo Match Platform
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
        {/* <Fade in timeout={600}>
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
        </Fade> */}

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
                background: 'linear-gradient(135deg,rgb(102, 125, 230) 0%,rgb(130, 178, 218) 100%)',
                color: 'white',
                p: 2.5,
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    Events Management
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, opacity: 0.7 }}>
                    Create and manage your events efficiently
                  </Typography>
                  <Box display="flex" gap={1} mt={2}>
                    <Button
                      variant={viewMode === 'customers' ? 'contained' : 'outlined'}
                      size="small"
                      startIcon={<Group />}
                      onClick={() => handleViewModeChange('customers')}
                      sx={{
                        fontWeight: 600,
                        textTransform: 'none',
                        color: viewMode === 'customers' ? 'white' : 'rgba(255, 255, 255, 0.8)',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        bgcolor: viewMode === 'customers' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.15)',
                        },
                      }}
                    >
                      By Customers
                    </Button>
                    <Button
                      variant={viewMode === 'events' ? 'contained' : 'outlined'}
                      size="small"
                      startIcon={<ViewList />}
                      onClick={() => handleViewModeChange('events')}
                      sx={{
                        fontWeight: 600,
                        textTransform: 'none',
                        color: viewMode === 'events' ? 'white' : 'rgba(255, 255, 255, 0.8)',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        bgcolor: viewMode === 'events' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.15)',
                        },
                      }}
                    >
                      All Events
                    </Button>
                  </Box>
                </Box>
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={handleCreateCustomer}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(8, 8, 8, 0.3)',
                      color: 'rgba(44, 41, 41, 0.8)',
                      fontWeight: 600,
                      px: 2.5,
                      py: 1,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Add Customer
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleCreateEvent}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(8, 8, 8, 0.3)',
                      color: 'rgba(44, 41, 41, 0.8)',
                      fontWeight: 600,
                      px: 2.5,
                      py: 1,
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
            </Box>

            <CardContent sx={{ p: 0 }}>
              <TableContainer sx={{ maxHeight: 430, overflow: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#d9dadb' }}>
                      <TableCell 
                        sx={{ 
                          fontWeight: 600, 
                          py: 2,
                          position: 'sticky',
                          top: 0,
                          bgcolor: '#d9dadb',
                          zIndex: 10,
                          borderBottom: '2px solid #bbb'
                        }}
                      >
                        {viewMode === 'events' ? 'Event Name' : 'Customer Name'}
                      </TableCell>

                      <TableCell 
                        sx={{ 
                          fontWeight: 600,
                          position: 'sticky',
                          top: 0,
                          bgcolor: '#d9dadb',
                          zIndex: 10,
                          borderBottom: '2px solid #bbb'
                        }}
                      >
                        {viewMode === 'events' ? 'Start Date' : ''}
                      </TableCell>

                      <TableCell 
                        sx={{ 
                          fontWeight: 600,
                          position: 'sticky',
                          top: 0,
                          bgcolor: '#d9dadb',
                          zIndex: 10,
                          borderBottom: '2px solid #bbb'
                        }}
                      >
                        {viewMode === 'events' ? 'End Date' : ''}
                      </TableCell>

                      <TableCell 
                        sx={{ 
                          fontWeight: 600,
                          position: 'sticky',
                          top: 0,
                          bgcolor: '#d9dadb',
                          zIndex: 10,
                          borderBottom: '2px solid #bbb'
                        }}
                      >
                        {viewMode === 'events' ? 'Venue' : 'Country'}
                      </TableCell>

                      <TableCell 
                        sx={{ 
                          fontWeight: 600,
                          position: 'sticky',
                          top: 0,
                          bgcolor: '#d9dadb',
                          zIndex: 10,
                          borderBottom: '2px solid #bbb'
                        }}
                      >
                        {viewMode === 'events' ? 'Status' : ''}
                      </TableCell>

                      <TableCell 
                        sx={{ 
                          fontWeight: 600,
                          position: 'sticky',
                          top: 0,
                          bgcolor: '#d9dadb',
                          zIndex: 10,
                          borderBottom: '2px solid #bbb'
                        }}
                      >
                        Actions
                      </TableCell>
                      
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {viewMode === 'events' ? (
                      // Events View
                      events.map((event) => (
                        <>
                          <TableRow 
                            key={event.id} 
                            data-event-id={event.id}
                            hover
                            sx={{
                              '&:hover': {
                                bgcolor: '#f8f9ff',
                              },
                              bgcolor: highlightedEvent === event.id ? '#e3f2fd' : 'inherit',
                              transition: 'background-color 0.3s ease',
                              border: highlightedEvent === event.id ? '2px solid #2196f3' : 'none',
                            }}
                          >
                            <TableCell sx={{ py: 3 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {event.name}
                              </Typography>
                              {event.customerCompany && (
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                  {event.customerFirstName} {event.customerLastName} - {event.customerCompany}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {formatDate(event.startDate)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {formatDate(event.endDate)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {event.location}
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
                              <Box display="flex" alignItems="center" gap={1}>
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => handleEditEvent(event)}
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
                                  onClick={() => handleRowExpand(event.id)}
                                  color="primary"
                                  sx={{
                                    '&:hover': { 
                                      bgcolor: 'primary.light',
                                      color: 'white',
                                    },
                                  }}
                                >
                                  {expandedRow === event.id ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                          
                          {/* Expanded Row with Additional Columns */}
                          <TableRow>
                            <TableCell 
                              colSpan={6} 
                              sx={{ 
                                py: 0, 
                                borderBottom: expandedRow === event.id ? '1px solid rgba(224, 224, 224, 1)' : 'none' 
                              }}
                            >
                              <Collapse in={expandedRow === event.id} timeout="auto" unmountOnExit>
                                <Box sx={{ margin: 1 }}>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Marketing Abbreviative</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Event Logo</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Event Admin</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Email</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      <TableRow>
                                        <TableCell sx={{ py: 2 }}>
                                          <Typography 
                                            variant="body2" 
                                            sx={{ 
                                              fontFamily: 'monospace',
                                              bgcolor: '#f5f5f5',
                                              px: 1,
                                              py: 0.5,
                                              borderRadius: 1,
                                              display: 'inline-block',
                                              fontWeight: 600,
                                            }}
                                          >
                                            {event.marketingAbbreviation || 'N/A'}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Avatar 
                                            src={event.eventLogo} 
                                            sx={{ 
                                              width: 40, 
                                              height: 40,
                                              borderRadius: 2,
                                            }}
                                          >
                                            <EventIcon />
                                          </Avatar>
                                        </TableCell>
                                        <TableCell>
                                          {event.eventAdminFirstName && event.eventAdminLastName ? (
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                              {`${event.eventAdminFirstName} ${event.eventAdminLastName}`}
                                            </Typography>
                                          ) : (
                                            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                                              N/A
                                            </Typography>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {event.eventAdminEmail || 'N/A'}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </>
                      ))
                    ) : (
                      // Customers View
                      customersWithEvents.map((customerWithEvents) => (
                        <>
                          {/* Customer Row */}
                          <TableRow 
                            key={customerWithEvents.customer.id} 
                            hover
                            sx={{
                              '&:hover': {
                                bgcolor: '#f0f8ff',
                              },
                              bgcolor: '#fafbfc',
                            }}
                          >
                            <TableCell sx={{ py: 3 }}>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ 
                                  bgcolor: customerWithEvents.customer.customerType === 'enterprise' ? '#1976d2' : '#2e7d32',
                                  width: 40,
                                  height: 40,
                                }}>
                                  {customerWithEvents.customer.customerType === 'enterprise' || customerWithEvents.customer.customerType === 'business' ? 
                                    <Business /> : <Person />
                                  }
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    {/* {customerWithEvents.customer.firstName} {customerWithEvents.customer.lastName} */}
                                  </Typography>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    {customerWithEvents.customer.companyName} • 
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {customerWithEvents.customer.email}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {/* {customerWithEvents.totalEvents} Events */}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {/* {customerWithEvents.activeEvents} Active */}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {customerWithEvents.customer.city}, {customerWithEvents.customer.state}, {customerWithEvents.customer.country}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {/* <Chip
                                label={customerWithEvents.customer.customerType}
                                color="primary"
                                size="small"
                                sx={{ 
                                  textTransform: 'capitalize',
                                  fontWeight: 600,
                                }}
                              /> */}
                            </TableCell>
                            <TableCell>
                              <IconButton 
                                size="small" 
                                onClick={() => handleCustomerExpand(customerWithEvents.customer.id)}
                                color="primary"
                                sx={{
                                  '&:hover': { 
                                    bgcolor: 'primary.light',
                                    color: 'white',
                                  },
                                }}
                              >
                                {expandedCustomer === customerWithEvents.customer.id ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                              </IconButton>
                            </TableCell>
                          </TableRow>
                          
                          {/* Customer's Events */}
                          <TableRow>
                            <TableCell 
                              colSpan={6} 
                              sx={{ 
                                py: 0, 
                                borderBottom: expandedCustomer === customerWithEvents.customer.id ? '1px solid rgba(224, 224, 224, 1)' : 'none' 
                              }}
                            >
                              <Collapse in={expandedCustomer === customerWithEvents.customer.id} timeout="auto" unmountOnExit>
                                <Box sx={{ margin: 1, ml: 6 }}>
                                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 500, fontSize: '1.1rem' }}>
                                    Events of {customerWithEvents.customer.companyName} 
                                  </Typography>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                                        <TableCell sx={{ fontWeight: 600 }}>Event Name</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {customerWithEvents.events.map((event) => (
                                        <TableRow key={event.id} hover>
                                          <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                              {event.name}
                                            </Typography>
                                          </TableCell>
                                          <TableCell>
                                            <Typography variant="body2">
                                              {formatDate(event.startDate)}
                                            </Typography>
                                          </TableCell>
                                          <TableCell>
                                            <Typography variant="body2">
                                              {formatDate(event.endDate)}
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
                                            <IconButton 
                                              size="small" 
                                              color="primary"
                                              onClick={() => handleEventInfo(event.id)}
                                              sx={{
                                                '&:hover': { 
                                                  bgcolor: 'primary.light',
                                                  color: 'white',
                                                },
                                              }}
                                            >
                                              <Info fontSize="small" />
                                            </IconButton>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </>
                      ))
                    )}
                    {(isLoading || isCustomersLoading) && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                          <CircularProgress size={40} />
                          <Typography variant="body1" sx={{ mt: 2 }}>
                            {viewMode === 'events' ? 'Loading events...' : 'Loading customers...'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {(error || customersError) && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                          <Box>
                            <Typography variant="h6" color="error" sx={{ mb: 1 }}>
                              {viewMode === 'events' ? 'Error loading events' : 'Error loading customers'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Please try refreshing the page or contact support
                            </Typography>
                            <Button 
                              variant="outlined" 
                              color="primary" 
                              onClick={() => {
                                if (viewMode === 'events') {
                                  refetch();
                                } else {
                                  refetchCustomers();
                                }
                              }}
                            >
                              Retry
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                    {!isLoading && !isCustomersLoading && !error && !customersError && (
                      <>
                        {viewMode === 'events' && events.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
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
                        {viewMode === 'customers' && customersWithEvents.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                              <Box>
                                <Person sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                  No customers found
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Add your first customer to start creating events
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
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

        {/* Edit Event Dialog */}
        <EditEventDialog
          open={editEventOpen}
          onClose={() => setEditEventOpen(false)}
          onEventUpdated={handleEventUpdated}
          event={selectedEvent}
        />

        {/* Create Customer Dialog */}
        <CreateCustomerDialog
          open={createCustomerOpen}
          onClose={() => setCreateCustomerOpen(false)}
          onCustomerCreated={handleCustomerCreated}
        />
      </Container>
    </Box>
  );
} 