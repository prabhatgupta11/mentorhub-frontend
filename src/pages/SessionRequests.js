import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  Grid,
  Avatar,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import moment from 'moment';
import PageContainer from '../components/PageContainer';

export default function SessionRequests() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/sessions');
      console.log('Sessions data:', response.data); // Debug log
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      declined: 'error',
      completed: 'info'
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageContainer title="Session Requests" description="View your session requests">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {sessions.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No session requests found
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {sessions.map((session) => (
              <Grid item xs={12} key={session._id}>
                <Paper 
                  elevation={2}
                  sx={{
                    p: 3,
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar 
                          src={session.mentor?.avatar}
                          alt={session.mentor?.name}
                        />
                        <Box>
                          <Typography variant="h6">
                            Session with {session.mentor?.name}
                          </Typography>
                          <Chip 
                            label={session.status}
                            color={getStatusColor(session.status)}
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Scheduled for: {moment(session.startTime).format('MMMM Do YYYY, h:mm a')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Duration: {moment(session.endTime).diff(moment(session.startTime), 'minutes')} minutes
                      </Typography>
                      {session.notes && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Notes: {session.notes}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        {session.status === 'approved' && session.meetingUrl && (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => window.open(session.meetingUrl, '_blank')}
                          >
                            Join Meeting
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </PageContainer>
  );
} 