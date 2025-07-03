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
  Backdrop,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import { useCreateNewEventMutation } from '@/lib/store/api/eventsApi';
import { useLazyGetAllThemeSelectionsQuery, useLazyGetAllFontsStylesQuery } from '@/lib/store/api/commonApi';

interface CreateEventDialogProps {
  open: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

interface EventForm {
  fontFamilyId: number;
  themeSelectionId: number;
  eventName: string;
  description: string;
  numberOfDays: number;
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
  const [eventUrlError, setEventUrlError] = useState('');
  const [closeRotated, setCloseRotated] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success'
  });

  const [createNewEvent, { isLoading }] = useCreateNewEventMutation();
  const [getThemes, { data: themesData, isLoading: themesLoading }] = useLazyGetAllThemeSelectionsQuery();
  const [getFonts, { data: fontsData, isLoading: fontsLoading }] = useLazyGetAllFontsStylesQuery();
  const { register, handleSubmit, formState: { errors, isValid }, reset, watch, setValue } = useForm<EventForm>({
    mode: 'onChange', // Enable validation on change to update isValid in real-time
    defaultValues: {
      fontFamilyId: fontsData?.result?.[0]?.id || 1,
      themeSelectionId: themesData?.result?.[0]?.id || 1,
      
      numberOfDays: 1,
    }
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Watch for changes in startDate and numberOfDays
  const watchedStartDate = watch('startDate');
  const watchedNumberOfDays = watch('numberOfDays');
  const watchedLogoUrl = watch('logoUrl');

  // Auto-calculate end date when start date or number of days changes
  useEffect(() => {
    if (watchedStartDate && watchedNumberOfDays) {
      const startDate = new Date(watchedStartDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (watchedNumberOfDays - 1)); // -1 because if it's 1 day, start and end should be same day
      
      // Format the date to match datetime-local input format
      const formattedEndDate = endDate.toISOString().slice(0, 16);
      setValue('endDate', formattedEndDate);
    }
  }, [watchedStartDate, watchedNumberOfDays, setValue]);

  // Trigger API calls when dialog opens
  useEffect(() => {
    if (open) {
      getThemes();
      getFonts();
    }
  }, [open, getThemes, getFonts]);

  // Update form defaults when API data loads
  useEffect(() => {
    if (fontsData?.result?.[0] && !watch('fontFamilyId')) {
      setValue('fontFamilyId', fontsData.result[0].id);
    }
  }, [fontsData, setValue, watch]);

  useEffect(() => {
    if (themesData?.result?.[0] && !watch('themeSelectionId')) {
      setValue('themeSelectionId', themesData.result[0].id);
    }
  }, [themesData, setValue, watch]);

  const onSubmit = async (data: EventForm) => {
    setError('');
    setEventUrlError('');

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
        // Show success message
        setNotification({
          open: true,
          message: 'Event created successfully!',
          severity: 'success'
        });
        onEventCreated();
        handleClose();
      } else {
        setError(result.message || 'Failed to create event');
      }
    } catch (err: any) {
      const errorMessage = err?.data?.responseException || err?.data?.message || 'An error occurred. Please try again.';
      
      // Check if error is related to duplicate event URL/identity
      if (errorMessage.toLowerCase().includes('already exists') || errorMessage.toLowerCase().includes('identity')) {
        setEventUrlError(errorMessage);
      } else {
        setError(errorMessage);
      }
      
      // Show error notification
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleClose = () => {
    reset();
    setError('');
    setEventUrlError('');
    setLogoPreview('');
    onClose();
  };

  const handleLogoUrlChange = (url: string) => {
    setLogoPreview(url);
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleDialogClose = (event: any, reason: string) => {
    // Prevent closing dialog when loading or clicking outside
    if (isLoading || reason === 'backdropClick') {
      return;
    }
    handleClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleDialogClose}
        disableEscapeKeyDown={isLoading}
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
          disabled={isLoading}
          onClick={() => {
            if (!isLoading) {
              setCloseRotated(true);
              setTimeout(() => {
                setCloseRotated(false);
                handleClose();
              }, 300);
            }
          }}
          sx={{
            ml: 2,
            transition: 'transform 0.3s',
            transform: closeRotated ? 'rotate(180deg)' : 'none',
            opacity: isLoading ? 0.5 : 1,
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

          {/* {(themesLoading || fontsLoading) && (
            <Alert severity="info" sx={{ mb: 3, background: 'rgba(2, 136, 209, 0.1)', color: '#1976d2', border: '1px solid rgba(2, 136, 209, 0.3)', fontWeight: 600, '& .MuiAlert-icon': { color: '#1976d2' } }}>
              Loading themes and fonts...
            </Alert>
          )} */}

          {/* Event Details Section */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1a1a1a', fontWeight: 700, fontSize: { xs: '1.05rem', sm: '1.15rem' }, letterSpacing: 0.2 }}>
              Event Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Name *"
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
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Number of Days *"
                  type="number"
                  {...register('numberOfDays', { 
                    required: 'Number of days is required',
                    min: { value: 1, message: 'Event must be at least 1 day' },
                    valueAsNumber: true
                  })}
                  error={!!errors.numberOfDays}
                  helperText={errors.numberOfDays?.message || "How many days will the event run?"}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Start Date *"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  {...register('startDate', { required: 'Start date is required' })}
                  error={!!errors.startDate}
                  helperText={errors.startDate?.message}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="End Date *"
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
                  label="Venue Name *"
                  {...register('venueName', { required: 'Venue name is required' })}
                  error={!!errors.venueName}
                  helperText={errors.venueName?.message}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address Line 1 *"
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
                  label="Postal Code "
                  type="number"
                  {...register('postalCode')}
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
              label="Marketing Abbreviation *"
              {...register('marketingAbbreviation', { required: 'Marketing abbreviation is required' })}
              error={!!errors.marketingAbbreviation}
              helperText={errors.marketingAbbreviation?.message || "Abrevation can be used for the event Login username. (e.g. 'XPO' for 'XPO Match')"}
              sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
            />
          </Box>

          {/* Event URL */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1a1a1a', fontWeight: 700, fontSize: { xs: '1.05rem', sm: '1.15rem' }, letterSpacing: 0.2 }}>
              Event URL
            </Typography>
            <TextField
              fullWidth
              label="Event URL *"
              {...register('eventUrl', { required: 'Event URL is required' })}
              placeholder="your-event-name"
              error={!!eventUrlError || !!errors.eventUrl}
              helperText={eventUrlError || errors.eventUrl?.message || "Enter the URL path after the domain"}
              onChange={(e) => {
                // Clear event URL error when user starts typing
                if (eventUrlError) {
                  setEventUrlError('');
                }
              }}
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
              sx={{ 
                bgcolor: 'rgba(0, 0, 0, 0.02)', 
                borderRadius: 2,
                '& .MuiInputBase-root': {
                  fontSize: '0.95rem'
                },
                '& .MuiFormHelperText-root.Mui-error': {
                  color: '#d32f2f',
                  fontWeight: 500
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
                  label="Font Family *"
                  defaultValue={fontsData?.result?.[0]?.id || 1}
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
                  disabled={fontsLoading}
                >
                  {fontsData?.result?.filter(font => font.isActive).map(font => (
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
                  label="Theme Selection *"
                  defaultValue={themesData?.result?.[0]?.id || 1}
                  {...register('themeSelectionId', { required: 'Theme is required', valueAsNumber: true })}
                  sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                  disabled={themesLoading}
                >
                  {themesData?.result?.filter(theme => theme.isActive).map(theme => (
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
                  label="First Name *"
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
                  label="Last Name *"
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
                  label="Email *"
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
            disabled={isLoading || themesLoading || fontsLoading || !isValid}
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
            {isLoading ? 'Creating...' : (themesLoading || fontsLoading) ? 'Loading...' : !isValid ? 'Fill Required Fields' : 'Create Event'}
          </Button>
        </DialogActions>
        </DialogContent>
      </form>

      {/* Professional Loading Overlay */}
      {isLoading && (
        <Backdrop
          sx={{
            position: 'absolute',
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            borderRadius: { xs: 0, sm: 4 },
          }}
          open={isLoading}
        >
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            gap={3}
            sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 3,
              p: 4,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Professional Animated Loader */}
            <Box
              sx={{
                position: 'relative',
                width: 80,
                height: 80,
              }}
            >
              {/* Outer rotating ring */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: '3px solid rgba(255, 255, 255, 0.1)',
                  borderTop: '3px solid #60a5fa',
                  borderRadius: '50%',
                  animation: 'spin 2s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
              
              {/* Middle rotating ring */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  width: 'calc(100% - 16px)',
                  height: 'calc(100% - 16px)',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  borderRight: '2px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin-reverse 1.5s linear infinite',
                  '@keyframes spin-reverse': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(-360deg)' },
                  },
                }}
              />
              
              {/* Inner pulsing dot */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 12,
                  height: 12,
                  background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  animation: 'pulse 1s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { 
                      transform: 'translate(-50%, -50%) scale(1)',
                      opacity: 1,
                    },
                    '50%': { 
                      transform: 'translate(-50%, -50%) scale(1.5)',
                      opacity: 0.7,
                    },
                  },
                }}
              />
            </Box>

            {/* Professional Loading Text */}
            <Box textAlign="center">
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  color: '#ffffff',
                  fontSize: '1.25rem',
                  letterSpacing: 0.5,
                  mb: 1,
                }}
              >
                Creating Your Event
              </Typography>
              
              {/* Animated dots */}
              <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                  }}
                >
                  Setting up your event space
            </Typography>
                <Box display="flex" gap={0.5} ml={1}>
                  {[0, 1, 2].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        backgroundColor: '#60a5fa',
                        animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite`,
                        '@keyframes bounce': {
                          '0%, 80%, 100%': {
                            transform: 'scale(0)',
                            opacity: 0.5,
                          },
                          '40%': {
                            transform: 'scale(1)',
                            opacity: 1,
                          },
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.85rem',
                  mt: 1.5,
                  fontStyle: 'italic',
                }}
              >
                This may take a few moments...
            </Typography>
            </Box>
          </Box>
        </Backdrop>
      )}
    </Dialog>

    {/* Success/Error Notification */}
    <Snackbar
      open={notification.open}
      autoHideDuration={6000}
      onClose={handleCloseNotification}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        onClose={handleCloseNotification} 
        severity={notification.severity}
        sx={{ 
          width: '100%',
          fontWeight: 600,
          '& .MuiAlert-icon': {
            fontSize: '1.5rem'
          }
        }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  </>
  );
} 