'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';


interface CreateEventDialogProps {
  open: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

interface EventForm {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxVisitors: number;
  maxExhibitors: number;
  eventAdminEmail: string;
  eventAdminFirstName: string;
  eventAdminLastName: string;
  eventAdminPassword: string;
  marketingAbbreviation: string;
}

export default function CreateEventDialog({ open, onClose, onEventCreated }: CreateEventDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedEventId, setGeneratedEventId] = useState('');

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<EventForm>();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const generateEventId = () => {
    const id = `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    setGeneratedEventId(id);
    return id;
  };

  const onSubmit = async (data: EventForm) => {
    setLoading(true);
    setError('');

    try {
      const eventId = generatedEventId || generateEventId();
      
      const payload = {
        ...data,
        eventId,
        maxVisitors: Number(data.maxVisitors),
        maxExhibitors: Number(data.maxExhibitors),
      };

      const response = await fetch('/api/it-admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        onEventCreated();
        handleClose();
      } else {
        setError(result.error || 'Failed to create event');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError('');
    setGeneratedEventId('');
    onClose();
  };

  const handleGenerateId = () => {
    generateEventId();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          position: 'relative',
          overflow: 'visible',
          borderRadius: { xs: 0, sm: 4 },
          boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
          background: 'rgba(53, 53, 54, 0.92)',
          backdropFilter: 'blur(18px)',
          border: '1.5px solid rgba(255,255,255,0.22)',
          m: { xs: 0, sm: 2 },
        },
      }}
      BackdropProps={{
        sx: {
          background: 'rgba(20, 20, 30, 0.65)',
          backdropFilter: 'blur(2px)',
        },
      }}
      TransitionProps={{ appear: true }}
    >
      {/* Decorative blurred circles */}
      <Box
        sx={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'rgba(210, 25, 201, 0.18)',
          filter: 'blur(18px)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -80,
          left: -80,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(245, 66, 230, 0.13)',
          filter: 'blur(24px)',
          zIndex: 0,
        }}
      />
      <DialogTitle sx={{ zIndex: 1, pb: 0 }}>
        <Typography
          variant="h5"
          component="div"
          sx={{
            fontWeight: 800,
            color: 'white',
            background: 'linear-gradient(45deg, #fff 30%, rgba(255,255,255,0.8) 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 0.5,
            fontSize: { xs: '1.3rem', sm: '1.7rem', md: '2rem' },
            letterSpacing: 0.5,
          }}
        >
          Create New Event
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.92)', fontWeight: 400, fontSize: { xs: '0.95rem', sm: '1.05rem' } }}>
          Create a new event and assign an event administrator
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent
          dividers
          sx={{
            zIndex: 1,
            p: { xs: 2, sm: 3, md: 4 },
            background: 'transparent',
            maxHeight: { xs: 'calc(100vh - 120px)', sm: '70vh' },
            overflowY: 'auto',
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 3, background: 'rgba(244, 67, 54, 0.18)', color: 'white', border: '1.5px solid rgba(244, 67, 54, 0.3)', fontWeight: 600, '& .MuiAlert-icon': { color: '#ff6b6b' } }}>
              {error}
            </Alert>
          )}

          {/* Event ID Section */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '1.05rem', sm: '1.15rem' }, letterSpacing: 0.2 }}>
              Event Identification
            </Typography>
            <Box display="flex" gap={2} alignItems="end" flexDirection={{ xs: 'column', sm: 'row' }}>
              <TextField
                fullWidth
                label="Event ID"
                value={generatedEventId}
                InputProps={{ readOnly: true }}
                helperText="Auto-generated unique identifier"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.25)',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    fontWeight: 700,
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.8)',
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                  },
                  '& .MuiFormHelperText-root': {
                    color: 'rgba(255,255,255,0.7)',
                  },
                }}
              />
              <Button
                variant="outlined"
                onClick={handleGenerateId}
                sx={{
                  minWidth: 120,
                  height: 56,
                  borderRadius: 2,
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.7)',
                  fontWeight: 700,
                  background: 'linear-gradient(45deg,rgba(25,118,210,0.22) 30%,rgba(25,118,210,0.22) 90%)',
                  fontSize: { xs: '1rem', sm: '1.08rem' },
                  mt: { xs: 2, sm: 0 },
                  '&:hover': {
                    background: 'linear-gradient(45deg,rgba(25,118,210,0.32) 30%,rgba(25,118,210,0.32) 90%)',
                    borderColor: 'white',
                  },
                }}
              >
                Generate ID
              </Button>
            </Box>
          </Box>

          {/* Event Details Section */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '1.05rem', sm: '1.15rem' }, letterSpacing: 0.2 }}>
              Event Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Name"
                  {...register('name', { required: 'Event name is required' })}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.25)',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      fontWeight: 600,
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.8)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#ffbdbd',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  {...register('description')}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.18)',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.8)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  {...register('startDate', { required: 'Start date is required' })}
                  error={!!errors.startDate}
                  helperText={errors.startDate?.message}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.25)',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.8)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#ffbdbd',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  {...register('endDate', { required: 'End date is required' })}
                  error={!!errors.endDate}
                  helperText={errors.endDate?.message}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.25)',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.8)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#ffbdbd',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  {...register('location', { required: 'Location is required' })}
                  error={!!errors.location}
                  helperText={errors.location?.message}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.25)',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.8)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#ffbdbd',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Max Visitors"
                  type="number"
                  {...register('maxVisitors', { 
                    required: 'Max visitors is required',
                    min: { value: 1, message: 'Must be at least 1' }
                  })}
                  error={!!errors.maxVisitors}
                  helperText={errors.maxVisitors?.message}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.25)',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.8)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#ffbdbd',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Max Exhibitors"
                  type="number"
                  {...register('maxExhibitors', { 
                    required: 'Max exhibitors is required',
                    min: { value: 1, message: 'Must be at least 1' }
                  })}
                  error={!!errors.maxExhibitors}
                  helperText={errors.maxExhibitors?.message}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.25)',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.8)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#ffbdbd',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Marketing Abbreviation"
                  placeholder="e.g., TECH2024, EXPO24"
                  {...register('marketingAbbreviation')}
                  helperText="Optional: Short code for marketing purposes"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.18)',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.8)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '& .MuiFormHelperText-root': {
                      color: 'rgba(255,255,255,0.7)',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Event Admin Section */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '1.05rem', sm: '1.15rem' }, letterSpacing: 0.2 }}>
              Event Administrator
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  {...register('eventAdminFirstName', { required: 'First name is required' })}
                  error={!!errors.eventAdminFirstName}
                  helperText={errors.eventAdminFirstName?.message}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.25)',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.8)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#ffbdbd',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  {...register('eventAdminLastName', { required: 'Last name is required' })}
                  error={!!errors.eventAdminLastName}
                  helperText={errors.eventAdminLastName?.message}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.25)',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.8)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#ffbdbd',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  {...register('eventAdminEmail', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    }
                  })}
                  error={!!errors.eventAdminEmail}
                  helperText={errors.eventAdminEmail?.message}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.25)',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.8)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#ffbdbd',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Temporary Password"
                  type="password"
                  {...register('eventAdminPassword', { 
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
                  })}
                  error={!!errors.eventAdminPassword}
                  helperText={errors.eventAdminPassword?.message || 'Event admin will be required to change this on first login'}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.25)',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.8)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#ffbdbd',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        

        <DialogActions sx={{ p: { xs: 2, sm: 2, md: 1.5}, zIndex: 1, flexWrap: 'wrap', gap: 1 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{
              borderRadius: 2,
              color: 'white',
              borderColor: 'rgba(255,255,255,0.7)',
              fontWeight: 700,
              background: 'linear-gradient(45deg,rgba(25,118,210,0.18) 30%,rgba(25,118,210,0.18) 90%)',
              fontSize: { xs: '1rem', sm: '1.08rem' },
              px: 3,
              py: 1.2,
              '&:hover': {
                background: 'linear-gradient(45deg,rgba(25,118,210,0.28) 30%,rgba(25,118,210,0.28) 90%)',
                borderColor: 'white',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !generatedEventId}
            sx={{
              minWidth: 120,
              borderRadius: 2,
              fontWeight: 800,
              fontSize: { xs: '1.08rem', sm: '1.15rem' },
              background: 'linear-gradient(45deg,rgb(25, 118, 210) 30%,rgb(25, 118, 210) 90%)',
              boxShadow: '0 4px 15px rgba(25, 118, 210, 0.18)',
              color: 'white',
              px: 3,
              py: 1.2,
              letterSpacing: 0.2,
              '&:hover': {
                background: 'linear-gradient(45deg,rgba(25, 118, 210, 0.8) 30%,rgba(25, 118, 210, 0.8) 90%)',
                boxShadow: '0 6px 20px rgba(25, 118, 210, 0.18)',
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.2)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? 'Creating...' : 'Create Event'}
          </Button>
        </DialogActions>
        </DialogContent>
      </form>
    </Dialog>
  );
} 