'use client';

import { useState, useEffect } from 'react';
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
  IconButton,
  Avatar,
  Chip,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import { Event } from '@/types';

const FONT_OPTIONS = [
  { id: 1, label: 'Nunito Sans', fontFamily: 'Nunito Sans, system-ui, sans-serif', className: 'font-nunito' },
  { id: 2, label: 'Inter', fontFamily: 'Inter, system-ui, sans-serif', className: 'font-inter' },
  { id: 3, label: 'Roboto', fontFamily: 'Roboto, system-ui, sans-serif', className: 'font-roboto' },
  { id: 4, label: 'Poppins', fontFamily: 'Poppins, system-ui, sans-serif', className: 'font-poppins' },
  { id: 5, label: 'Montserrat', fontFamily: 'Montserrat, system-ui, sans-serif', className: 'font-montserrat' },
  { id: 6, label: 'Open Sans', fontFamily: 'Open Sans, system-ui, sans-serif', className: 'font-opensans' },
  { id: 7, label: 'Lato', fontFamily: 'Lato, system-ui, sans-serif', className: 'font-lato' },
];

const THEME_OPTIONS = [
  { id: 1, label: 'Ocean Blue', color: '#1976d2' },
  { id: 2, label: 'Midnight Professional', color: '#232a36' },
  { id: 3, label: 'Executive Gray', color: '#4b4f56' },
  { id: 4, label: 'Forest Professional', color: '#1db954' },
  { id: 5, label: 'Royal Professional', color: '#7c3aed' },
  { id: 6, label: 'Teal Professional', color: '#009688' },
  { id: 7, label: 'Sunset Professional', color: '#ff7043' },
  { id: 8, label: 'Indigo Professional', color: '#3f51b5' },
  { id: 9, label: 'Crimson Professional', color: '#e53935' },
  { id: 10, label: 'Rose Professional', color: '#e57373' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

interface EditEventDialogProps {
  open: boolean;
  onClose: () => void;
  onEventUpdated: () => void;
  event: Event | null;
}

interface EventEditForm {
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
  marketingAbbreviation: string;
  eventLogo: string;
  fontFamily: string;
  theme: string;
  eventAdminFirstName: string;
  eventAdminLastName: string;
  eventAdminEmail: string;
}

export default function EditEventDialog({ open, onClose, onEventUpdated, event }: EditEventDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [closeRotated, setCloseRotated] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<EventEditForm>();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Prefill form when event data changes
  useEffect(() => {
    if (event && open) {
      const formatDateForInput = (date: Date) => {
        return new Date(date).toISOString().slice(0, 16);
      };

      // Reset form first, then set values
      reset({
        name: event.name || '',
        startDate: formatDateForInput(event.startDate),
        endDate: formatDateForInput(event.endDate),
        location: event.location || '',
        status: event.status,
        marketingAbbreviation: event.marketingAbbreviation || '',
        eventLogo: event.eventLogo || '',
        fontFamily: event.fontFamily || 'Roboto',
        theme: event.theme || 'Ocean Blue',
        eventAdminFirstName: event.eventAdminFirstName || '',
        eventAdminLastName: event.eventAdminLastName || '',
        eventAdminEmail: event.eventAdminEmail || '',
      });
      
      setLogoPreview(event.eventLogo || '');
    }
  }, [event, open, reset]);

  const onSubmit = async (data: EventEditForm) => {
    setLoading(true);
    setError('');

    try {
      // Simulate API call for updating event
      console.log('Updating event:', { ...data, eventId: event?.id });
      
      // Simulate success response
      setTimeout(() => {
        onEventUpdated();
        handleClose();
        setLoading(false);
      }, 1000);

    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError('');
    setLogoPreview('');
    onClose();
  };

  const handleLogoUrlChange = (url: string) => {
    setLogoPreview(url);
  };

  const watchedLogoUrl = watch('eventLogo');

  const getFontOptionByFamily = (fontFamily: string) => {
    return FONT_OPTIONS.find(option => option.label === fontFamily) || FONT_OPTIONS[2]; // Default to Roboto
  };

  const getThemeOptionByLabel = (themeLabel: string) => {
    return THEME_OPTIONS.find(option => option.label === themeLabel) || THEME_OPTIONS[0]; // Default to Ocean Blue
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
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(18px)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          m: { xs: 0, sm: 2 },
        },
      }}
      BackdropProps={{
        sx: {
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(2px)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 700,
              color: '#1a1a1a',
              mb: 0.5,
              fontSize: { xs: '1.3rem', sm: '1.7rem', md: '1.5rem' },
              letterSpacing: 0.5,
            }}
          >
            Edit Event Details
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={() => {
            setCloseRotated(true);
            setTimeout(() => {
              setCloseRotated(false);
              handleClose();
            }, 300);
          }

          }
          sx={{ ml: 2,
            transition: 'transform 0.3s',
            transform: closeRotated ? 'rotate(180deg)' : 'none',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Typography variant="body2" sx={{ color: '#666', fontWeight: 350, fontSize: { xs: '0.95rem', sm: '1rem' }, px: 3, pb: 1 }}>
        Update event information and administrator details
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent
          dividers
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            background: 'transparent',
            maxHeight: { xs: 'calc(100vh - 120px)', sm: '70vh' },
            overflowY: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Event Basic Information */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1a1a1a', fontWeight: 700, fontSize: '1.15rem' }}>
              Event Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Name"
                  {...register('name', { required: 'Event name is required' })}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
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
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
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
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Venue"
                  {...register('location', { required: 'Venue is required' })}
                  error={!!errors.location}
                  helperText={errors.location?.message}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={watch('status') || ''}
                  {...register('status', { required: 'Status is required' })}
                  error={!!errors.status}
                  helperText={errors.status?.message}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                >
                  {STATUS_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>

          {/* Marketing & Design */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1a1a1a', fontWeight: 700, fontSize: '1.15rem' }}>
              Marketing & Design
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Marketing Abbreviation"
                  {...register('marketingAbbreviation')}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Event Logo URL"
                  {...register('eventLogo')}
                  onChange={(e) => handleLogoUrlChange(e.target.value)}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Font Family"
                  value={watch('fontFamily') || ''}
                  {...register('fontFamily')}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                >
                  {FONT_OPTIONS.map(font => (
                    <MenuItem key={font.id} value={font.label}>
                      <span style={{ fontFamily: font.fontFamily }}>
                        {font.label}
                      </span>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Theme"
                  value={watch('theme') || ''}
                  {...register('theme')}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                >
                  {THEME_OPTIONS.map(theme => (
                    <MenuItem key={theme.id} value={theme.label}>
                      <Box component="span" sx={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', bgcolor: theme.color, mr: 1 }} />
                      {theme.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            
            {/* Logo Preview */}
            {(logoPreview || watchedLogoUrl) && (
              <Box mt={2} display="flex" alignItems="center" gap={2}>
                <Typography variant="body2" color="text.secondary">
                  Logo Preview:
                </Typography>
                <Avatar
                  src={logoPreview || watchedLogoUrl}
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    border: '2px solid rgba(0, 0, 0, 0.12)',
                  }}
                >
                  <ImageIcon />
                </Avatar>
              </Box>
            )}
          </Box>

          {/* Event Administrator */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1a1a1a', fontWeight: 700, fontSize: '1.15rem' }}>
              Event Administrator
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  {...register('eventAdminFirstName')}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  {...register('eventAdminLastName')}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  {...register('eventAdminEmail', { 
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    }
                  })}
                  error={!!errors.eventAdminEmail}
                  helperText={errors.eventAdminEmail?.message}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                />
              </Grid>
            </Grid>
          </Box>

          <DialogActions sx={{ p: { xs: 2, sm: 2, md: 1.5 }, flexWrap: 'wrap', gap: 1 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{
              borderRadius: 2,
              color: '#666',
              borderColor: 'rgba(0, 0, 0, 0.12)',
              fontWeight: 700,
              background: 'rgba(0, 0, 0, 0.04)',
              fontSize: '1rem',
              px: 3,
              py: 1.2,
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.08)',
                borderColor: 'rgba(0, 0, 0, 0.2)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              minWidth: 120,
              borderRadius: 2,
              fontWeight: 800,
              fontSize: '1.08rem',
              background: 'linear-gradient(135deg,rgb(102, 125, 230) 0%,rgb(130, 178, 218) 100%)',
              boxShadow: '0 4px 15px rgba(53, 73, 250, 0.65)',
              color: 'white',
              px: 3,
              py: 1.2,
              letterSpacing: 0.2,
              '&:hover': {
                background: 'linear-gradient(135deg,rgb(84, 112, 236) 0%,rgb(130, 178, 218) 100%)',
                boxShadow: '0 4px 15px rgba(63, 44, 231, 0.65)',
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? 'Updating...' : 'Update Event'}
          </Button>
        </DialogActions>
        </DialogContent>   
      </form>
    </Dialog>
  );
} 