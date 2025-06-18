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
  IconButton,
  Avatar,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import { useCreateNewEventMutation } from '@/lib/store/api/eventsApi';

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

interface CreateEventDialogProps {
  open: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

interface EventForm {
  fontFamilyId: number;
  themeSelectionId: number;
  eventName: string;
  description: string;
  startDate: string;
  endDate: string;
  venueName: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: number;
  googleMapLink: string;
  marketingAbbreviation: string;
  eventUrl: string;
  logoUrl: string;
  eventAdminEmail: string;
  eventAdminFirstName: string;
  eventAdminLastName: string;
}

export default function CreateEventDialog({ open, onClose, onEventCreated }: CreateEventDialogProps) {
  const [error, setError] = useState('');
  const [closeRotated, setCloseRotated] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const [createNewEvent, { isLoading }] = useCreateNewEventMutation();
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<EventForm>({
    defaultValues: {
      fontFamilyId: 1,
      themeSelectionId: 1,
      postalCode: 100001,
    }
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const onSubmit = async (data: EventForm) => {
    setError('');

    try {
      // Combine the prefilled domain with user input for eventUrl
      const fullEventUrl = `https://xpomatch-dev-event-admin-portal.azurewebsites.net/${data.eventUrl}`;
      
      // Map form data to API payload structure
      const payload = {
        eventDetails: {
          eventName: data.eventName,
          description: data.description,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
        },
        location: {
          venueName: data.venueName,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || '',
          countryId: 2, // Static ID as requested
          stateId: 2,   // Static ID as requested  
          cityId: 1,    // Static ID as requested
          postalCode: data.postalCode,
          latitude: 40,  // Static value as in example
          longitude: 740, // Static value as in example
          googleMapLink: data.googleMapLink || '',
        },
        marketingAbbreviation: data.marketingAbbreviation,
        themeSelectionId: data.themeSelectionId,
        fontFamilyId: data.fontFamilyId,
        eventUrl: fullEventUrl, // Send the combined URL
        logoUrl: data.logoUrl || '',
        payment: true, // Static value as in example
        eventCatalogId: 1, // Static value as in example
        eventStatusId: 1,  // Static value as in example
        paymentDetailsId: 1, // Static value as in example
        eventModeId: 1,    // Static value as in example
        eventAdministrator: {
          firstName: data.eventAdminFirstName,
          lastName: data.eventAdminLastName,
          email: data.eventAdminEmail,
        },
      };

      const result = await createNewEvent(payload).unwrap();

      if (result.statusCode === 200 && !result.isError) {
        onEventCreated();
        handleClose();
      } else {
        setError(result.message || 'Failed to create event');
      }
    } catch (err: any) {
      setError(err?.data?.message || 'An error occurred. Please try again.');
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

  const watchedLogoUrl = watch('logoUrl');

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
          background: 'rgba(25, 118, 210, 0.08)',
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
          background: 'rgba(66, 108, 245, 0.06)',
          filter: 'blur(24px)',
          zIndex: 0,
        }}
      />
      <DialogTitle sx={{ zIndex: 1, pb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            Create New Event
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
          }}
          sx={{
            ml: 2,
            transition: 'transform 0.3s',
            transform: closeRotated ? 'rotate(180deg)' : 'none',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Typography variant="body2" sx={{ color: '#666', fontWeight: 350, fontSize: { xs: '0.95rem', sm: '1rem' }, px: 3, pb: 1 }}>
        Create a new event and assign an event administrator
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent
          dividers
          sx={{
            zIndex: 1,
            p: { xs: 2, sm: 3, md: 4 },
            background: 'transparent',
            maxHeight: { xs: 'calc(100vh - 120px)', sm: '70vh' },
            overflowY: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 3, background: 'rgba(244, 67, 54, 0.1)', color: '#d32f2f', border: '1px solid rgba(244, 67, 54, 0.3)', fontWeight: 600, '& .MuiAlert-icon': { color: '#d32f2f' } }}>
              {error}
            </Alert>
          )}

          {/* Event Details Section */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1a1a1a', fontWeight: 700, fontSize: { xs: '1.05rem', sm: '1.15rem' }, letterSpacing: 0.2 }}>
              Event Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Name"
                  {...register('eventName', { required: 'Event name is required' })}
                  error={!!errors.eventName}
                  helperText={errors.eventName?.message}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  {...register('description')}
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
            </Grid>
          </Box>

          {/* Location Section */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1a1a1a', fontWeight: 700, fontSize: { xs: '1.05rem', sm: '1.15rem' }, letterSpacing: 0.2 }}>
              Location
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Venue Name"
                  {...register('venueName', { required: 'Venue name is required' })}
                  error={!!errors.venueName}
                  helperText={errors.venueName?.message}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address Line 1"
                  {...register('addressLine1', { required: 'Address line 1 is required' })}
                  error={!!errors.addressLine1}
                  helperText={errors.addressLine1?.message}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address Line 2"
                  {...register('addressLine2')}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  type="number"
                  {...register('postalCode', { required: 'Postal code is required' })}
                  error={!!errors.postalCode}
                  helperText={errors.postalCode?.message}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Google Map Link (or Lat, Long)"
                  {...register('googleMapLink')}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Marketing Abbreviation */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1a1a1a', fontWeight: 700, fontSize: { xs: '1.05rem', sm: '1.15rem' }, letterSpacing: 0.2 }}>
              Marketing Abbreviation
            </Typography>
            <TextField
              fullWidth
              label="Marketing Abbreviation"
              {...register('marketingAbbreviation')}
              sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
              helperText="Abrevation for the event Login username"
            />
          </Box>

          {/* Event URL */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1a1a1a', fontWeight: 700, fontSize: { xs: '1.05rem', sm: '1.15rem' }, letterSpacing: 0.2 }}>
              Event URL
            </Typography>
            <TextField
              fullWidth
              label="Event URL"
              {...register('eventUrl')}
              placeholder="your-event-name"
              InputProps={{
                startAdornment: (
                  <Box 
                    component="span" 
                    sx={{ 
                      color: '#666', 
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      mr: 0.5,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    https://xpomatch-dev-event-admin-portal.azurewebsites.net/
                  </Box>
                ),
              }}
              helperText="Enter the URL path after the domain"
              sx={{ 
                bgcolor: 'rgba(0, 0, 0, 0.02)', 
                borderRadius: 2,
                '& .MuiInputBase-root': {
                  fontSize: '0.95rem'
                }
              }}
            />
          </Box>

          {/* Event Logo */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1a1a1a', fontWeight: 700, fontSize: { xs: '1.05rem', sm: '1.15rem' }, letterSpacing: 0.2 }}>
              Event Logo
            </Typography>
            
            <TextField
              fullWidth
              label="Logo Image URL"
              {...register('logoUrl')}
              onChange={(e) => handleLogoUrlChange(e.target.value)}
              placeholder="https://example.com/logo.png"
              helperText="Enter a direct link to your logo image"
              sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
            />

            {/* Logo Preview */}
            {(logoPreview || watchedLogoUrl) && (
              <Box mt={2} display="flex" alignItems="center" gap={2}>
                <Typography variant="body2" color="text.secondary">
                  Preview:
                </Typography>
                <Avatar
                  src={logoPreview || watchedLogoUrl}
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 2,
                    border: '2px solid rgba(0, 0, 0, 0.12)',
                  }}
                >
                  <ImageIcon />
                </Avatar>
              </Box>
            )}
          </Box>

          {/* Font and Theme Selection */}
          <Box mb={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Font Family"
                  defaultValue={1}
                  {...register('fontFamilyId', { required: 'Font is required', valueAsNumber: true })}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        style: {
                          maxHeight: 250,
                        },
                      },
                    },
                  }}
                >
                  {FONT_OPTIONS.map(font => (
                    <MenuItem 
                      key={font.id} 
                      value={font.id}
                      className={font.className}
                      sx={{
                        fontFamily: `${font.fontFamily} !important`,
                        fontSize: '16px !important',
                        fontWeight: '400 !important',
                        '&:hover': {
                          fontFamily: `${font.fontFamily} !important`,
                        },
                        '&.Mui-selected': {
                          fontFamily: `${font.fontFamily} !important`,
                        },
                        '&.Mui-focusVisible': {
                          fontFamily: `${font.fontFamily} !important`,
                        }
                      }}
                    >
                      <span className={font.className} style={{ fontFamily: font.fontFamily, fontSize: '16px', fontWeight: '400' }}>
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
                  label="Theme Selection"
                  defaultValue={1}
                  {...register('themeSelectionId', { required: 'Theme is required', valueAsNumber: true })}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                >
                  {THEME_OPTIONS.map(theme => (
                    <MenuItem key={theme.id} value={theme.id}>
                      <Box component="span" sx={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', bgcolor: theme.color, mr: 1, border: `1px solid ${theme.color}` }} />
                      {theme.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>

          {/* Event Admin Section */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1a1a1a', fontWeight: 700, fontSize: { xs: '1.05rem', sm: '1.15rem' }, letterSpacing: 0.2 }}>
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
                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      color: '#1a1a1a',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#666',
                    },
                    '& .MuiInputBase-input': {
                      color: '#1a1a1a',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#d32f2f',
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
                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      color: '#1a1a1a',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#666',
                    },
                    '& .MuiInputBase-input': {
                      color: '#1a1a1a',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#d32f2f',
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
                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      color: '#1a1a1a',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#666',
                    },
                    '& .MuiInputBase-input': {
                      color: '#1a1a1a',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#d32f2f',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        

        <DialogActions sx={{ p: { xs: 2, sm: 2, md: 1.5}, zIndex: 1, flexWrap: 'wrap', gap: 1 }}>
          <Button
            onClick={handleClose}
            disabled={isLoading}
            sx={{
              borderRadius: 2,
              color: '#666',
              borderColor: 'rgba(0, 0, 0, 0.12)',
              fontWeight: 700,
              background: 'rgba(0, 0, 0, 0.04)',
              fontSize: { xs: '1rem', sm: '1.08rem' },
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
            disabled={isLoading}
            sx={{
              minWidth: 120,
              borderRadius: 2,
              fontWeight: 800,
              fontSize: { xs: '1.08rem', sm: '1.15rem' },
              background: 'linear-gradient(135deg,rgb(84, 112, 236) 0%,rgb(130, 178, 218) 100%)',
              boxShadow: '0 4px 15px rgba(53, 73, 250, 0.65)',
              color: 'white',
              px: 3,
              py: 1.2,
              letterSpacing: 0.2,
              '&:hover': {
                background: 'linear-gradient(135deg,rgb(26, 65, 240) 0%,rgb(79, 101, 221) 100%)',
                boxShadow: '0 4px 15px rgba(63, 44, 231, 0.65)',
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {isLoading ? 'Creating...' : 'Create Event'}
          </Button>
        </DialogActions>
        </DialogContent>
      </form>
    </Dialog>
  );
} 