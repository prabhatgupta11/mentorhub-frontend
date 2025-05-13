import React from 'react';
import { Paper, Typography, Box, Button, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Event as EventIcon, AccessTime as AccessTimeIcon, Notes as NotesIcon } from '@mui/icons-material';
import moment from 'moment';
import axios from 'axios';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  backgroundColor: '#fff',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor:
    status === 'pending'
      ? theme.palette.warning.main
      : status === 'approved'
      ? theme.palette.success.main
      : status === 'declined'
      ? theme.palette.error.main
      : theme.palette.info.main,
  color: '#fff',
}));

export default function SessionCard({ session, currentUser, onStatusChange }) {
  const handleAction = async (action) => {
    try {
      await axios.put(`/api/sessions/${session._id}/${action}`);
      onStatusChange();
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  return (
    <StyledPaper elevation={0}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Session with {currentUser.role === 'mentor' ? session.mentee.name : session.mentor.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <EventIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography color="text.secondary">
              {moment(session.startTime).format('MMMM Do YYYY, h:mm a')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography color="text.secondary">
              Duration: {moment(session.endTime).diff(moment(session.startTime), 'minutes')} minutes
            </Typography>
          </Box>

          {session.notes && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <NotesIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography color="text.secondary">{session.notes}</Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
          <StatusChip 
            label={session.status.toUpperCase()} 
            status={session.status}
          />
          
          {session.status === 'pending' && currentUser.role === 'mentor' && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleAction('approve')}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleAction('decline')}
              >
                Decline
              </Button>
            </>
          )}

          {session.status === 'approved' && session.meetingUrl && (
            <Button
              variant="contained"
              color="primary"
              href={session.meetingUrl}
              target="_blank"
            >
              Join Meeting
            </Button>
          )}
        </Box>
      </Box>
    </StyledPaper>
  );
} 