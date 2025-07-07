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
  Snackbar,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useCreateCustomerMutation } from '@/lib/store/api/adminApi';

interface CreateCustomerDialogProps {
  open: boolean;
  onClose: () => void;
  onCustomerCreated: () => void;
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

interface CustomerForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export default function CreateCustomerDialog({ open, onClose, onCustomerCreated }: CreateCustomerDialogProps) {
  const [error, setError] = useState('');
  const [closeRotated, setCloseRotated] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success'
  });

  const { register, handleSubmit, formState: { errors, isValid }, reset, trigger, setFocus } = useForm<CustomerForm>({
    mode: 'onChange',
  });

  const [createCustomer, { isLoading }] = useCreateCustomerMutation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const onSubmit = async (data: CustomerForm) => {
    setError('');

    // Manually trigger validation
    const isFormValid = await trigger();
    
    if (!isFormValid) {
      // Find the first field with an error and focus on it
      const firstErrorField = Object.keys(errors)[0] as keyof CustomerForm;
      if (firstErrorField) {
        setFocus(firstErrorField);
      }
      return;
    }

    try {
      // Transform form data to match API format
      const customerData = {
        companyName: data.companyName,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || '',
        city: data.city,
        stateProvience: data.state, // Note: API has typo - should be stateProvince
        postalCode: data.postalCode || '',
        country: data.country,
        firstName: data.firstName,
        lastName: data.lastName,
        emailAddress: data.email,
        phoneNumber: data.phone || '',
      };

      console.log('Customer data to be submitted:', customerData);
      
      const response = await createCustomer(customerData).unwrap();
      
      // Show success message
      setNotification({
        open: true,
        message: response.message || 'Customer created successfully!',
        severity: 'success'
      });
      
      onCustomerCreated();
      handleClose();
    } catch (err: any) {
      console.error('Error creating customer:', err);
      
      // Handle API error response
      let errorMessage = 'An error occurred. Please try again.';
      
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.data?.responseException) {
        errorMessage = err.data.responseException;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
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
    onClose();
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
            background: 'rgba(76, 175, 80, 0.08)',
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
            background: 'rgba(33, 150, 243, 0.06)',
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
              Add New Customer
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
          Add a new customer to the platform
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

            {/* Company Information Section */}
            <Box mb={3}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1a1a1a', fontWeight: 700, fontSize: { xs: '1.05rem', sm: '1.15rem' }, letterSpacing: 0.2 }}>
                Company Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Name *"
                    {...register('companyName', { required: 'Company name is required' })}
                    error={!!errors.companyName}
                    helperText={errors.companyName?.message}
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
                    label="City *"
                    {...register('city', { required: 'City is required' })}
                    error={!!errors.city}
                    helperText={errors.city?.message}
                    sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="State/Province *"
                    {...register('state', { required: 'State/Province is required' })}
                    error={!!errors.state}
                    helperText={errors.state?.message}
                    sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    {...register('postalCode')}
                    sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Country *"
                    {...register('country', { required: 'Country is required' })}
                    error={!!errors.country}
                    helperText={errors.country?.message}
                    sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Personal Information Section */}
            <Box mb={3}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1a1a1a', fontWeight: 700, fontSize: { xs: '1.05rem', sm: '1.15rem' }, letterSpacing: 0.2 }}>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name *"
                    {...register('firstName', { required: 'First name is required' })}
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name *"
                    {...register('lastName', { required: 'Last name is required' })}
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address *"
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    {...register('phone')}
                    sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}
                  />
                </Grid>
              </Grid>
            </Box>



          <DialogActions sx={{ p: 3, gap: 2, background: 'rgba(0, 0, 0, 0.02)' }}>
            <Button
              onClick={handleClose}
              disabled={isLoading}
              sx={{
                color: '#666',
                fontWeight: 600,
                px: 3,
                py: 1,
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? undefined : <PersonAddIcon />}
              sx={{
                background: 'linear-gradient(135deg,rgb(84, 112, 236) 0%,rgb(130, 178, 218) 100%)',
                boxShadow: '0 4px 15px rgba(53, 73, 250, 0.65)',
                color: 'white',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                '&:hover': {
                  background: 'linear-gradient(135deg,rgb(26, 65, 240) 0%,rgb(79, 101, 221) 100%)',
                boxShadow: '0 4px 15px rgba(63, 44, 231, 0.65)',
                transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  background: 'rgba(0, 0, 0, 0.12)',
                  color: 'rgba(0, 0, 0, 0.26)',
                },
              }}
            >
              {isLoading ? 'Creating Customer...' : 'Create Customer'}
            </Button>
          </DialogActions>
          </DialogContent>

          
        </form>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
} 