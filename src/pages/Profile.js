import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  styled,
  Box,
  Avatar,
  Chip,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import PageContainer from '../components/PageContainer';
import SaveIcon from '@mui/icons-material/Save';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ProfileContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const ProfilePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  color: theme.palette.primary.main,
  fontWeight: 500,
}));

const TimeSlotContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

const ProfileSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const LargeAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  marginBottom: theme.spacing(2),
}));

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Profile() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    availability: []
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/profiles/me');
      console.log("Profile data:", response.data);
      
      // Initialize availability with all days if not present
      const currentAvailability = response.data.availability || [];
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      // Create a map of existing availability
      const availabilityMap = {};
      currentAvailability.forEach(slot => {
        availabilityMap[slot.day] = slot.available;
      });

      // Ensure all days are represented
      const fullAvailability = {};
      daysOfWeek.forEach(day => {
        fullAvailability[day] = availabilityMap[day] || false;
      });

      setProfile({
        ...response.data,
        timezone: response.data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        availability: fullAvailability
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleAvailabilityChange = (day, checked) => {
    setProfile(prevProfile => ({
      ...prevProfile,
      availability: {
        ...prevProfile.availability,
        [day]: checked
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert availability object to array format expected by the backend
      const availabilityArray = Object.entries(profile.availability).map(([day, available]) => ({
        day,
        available
      }));

      const dataToSend = {
        ...profile,
        availability: availabilityArray
      };

      await axios.put('/api/profiles/me', dataToSend);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update profile. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Helper function to get slot time value
  const getSlotTime = (day, field) => {
    if (!profile.availability) return '';
    const dayData = profile.availability.find(a => a.day === day);
    if (dayData && dayData.slots && dayData.slots[0]) {
      return dayData.slots[0][field] || '';
    }
    return '';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Profile Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              src={currentUser?.avatar}
              alt={currentUser?.displayName}
              sx={{ width: 120, height: 120 }}
            />
            <Box>
              <Typography variant="h4" gutterBottom>
                {currentUser?.displayName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {currentUser?.email}
              </Typography>
              {currentUser?.role === 'mentor' && (
                <Chip
                  label="Mentor"
                  color="primary"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
          </Box>

          {/* Mentor Details Form */}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={profile.timezone || ''}
                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                  >
                    {Intl.supportedValuesOf('timeZone').map((tz) => (
                      <MenuItem key={tz} value={tz}>{tz}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {currentUser?.role === 'mentor' && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Availability
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    flexWrap: 'wrap',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 2
                  }}>
                    {DAYS.map((day) => (
                      <FormControlLabel
                        key={day}
                        control={
                          <Checkbox
                            checked={profile.availability?.[day] || false}
                            onChange={(e) => handleAvailabilityChange(day, e.target.checked)}
                          />
                        }
                        label={day}
                        sx={{
                          minWidth: '150px',
                          '& .MuiFormControlLabel-label': {
                            minWidth: '100px'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              )}

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Paper>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
} 