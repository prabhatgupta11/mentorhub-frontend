import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Button,
  Rating,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Avatar,
  Chip,
  useTheme,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import moment from 'moment';
import { styled } from '@mui/material/styles';
import PageContainer from '../components/PageContainer';

// Fixed dimensions for cards
const CARD_WIDTH = 340;
const CARD_HEIGHT = 400;

const MentorCard = styled(Box)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  height: CARD_HEIGHT,
  width: CARD_WIDTH,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  margin: '0 auto', // Center card in grid item
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
  },
}));

const MentorAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  marginBottom: theme.spacing(2),
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.main,
}));

const AvailabilityBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  maxHeight: '120px',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '10px',
  },
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(3),
  left: theme.spacing(3),
  right: theme.spacing(3),
}));

const renderAvailability = (availability) => {
  if (!availability || !Array.isArray(availability)) {
    return <Typography color="text.secondary">No availability set</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {availability.map((slot, index) => (
        slot.available && (
          <Chip
            key={`${slot.day}-${index}`}
            label={slot.day}
            size="small"
            color="primary"
            variant="outlined"
          />
        )
      ))}
    </Box>
  );
};

export default function MentorList() {
  const theme = useTheme();
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [sessionDetails, setSessionDetails] = useState({
    startTime: '',
    endTime: '',
    notes: '',
  });

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const response = await axios.get('/api/profiles/mentors');
      setMentors(response.data);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const handleRequestSession = (mentor) => {
    setSelectedMentor(mentor);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMentor(null);
    setSessionDetails({
      startTime: '',
      endTime: '',
      notes: '',
    });
  };

  const handleSubmitRequest = async () => {
    try {
      await axios.post('/api/sessions/request', {
        mentorId: selectedMentor._id,
        ...sessionDetails,
      });
      alert('Session request sent successfully!');
      handleCloseDialog();
    } catch (error) {
      alert('Error sending session request');
    }
  };

  return (
    <PageContainer 
      title="Find a Mentor" 
      description="Connect with experienced mentors in your field"
    >
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        width: '100%'
      }}>
        <Grid 
          container 
          spacing={3}
          sx={{ 
            maxWidth: `${CARD_WIDTH * 3 + theme.spacing(6)}px`,
            margin: '0 auto'
          }}
        >
          {mentors.map(mentor => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              key={mentor._id}
              sx={{
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <MentorCard>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <MentorAvatar src={mentor.avatar || '/default-avatar.png'} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {mentor.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={mentor.averageRating || 0} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary">
                        ({mentor.totalSessions || 0} sessions)
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {mentor.timezone && `Timezone: ${mentor.timezone}`}
                </Typography>

                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Available on:
                  </Typography>
                  {renderAvailability(mentor.availability)}
                </Box>

                <ButtonContainer>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    onClick={() => handleRequestSession(mentor)}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      py: 1.5
                    }}
                  >
                    Request Session
                  </Button>
                </ButtonContainer>
              </MentorCard>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 2
          }
        }}
      >
        <DialogTitle>
          Request Session with {selectedMentor?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Start Time"
              type="datetime-local"
              value={sessionDetails.startTime}
              onChange={(e) => setSessionDetails({
                ...sessionDetails,
                startTime: e.target.value
              })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="End Time"
              type="datetime-local"
              value={sessionDetails.endTime}
              onChange={(e) => setSessionDetails({
                ...sessionDetails,
                endTime: e.target.value
              })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Notes"
              multiline
              rows={4}
              value={sessionDetails.notes}
              onChange={(e) => setSessionDetails({
                ...sessionDetails,
                notes: e.target.value
              })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitRequest} 
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Send Request
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
} 