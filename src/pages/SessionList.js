import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, Tabs, Tab } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import PageContainer from '../components/PageContainer';
import SessionCard from '../components/SessionCard';

export default function SessionList() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/sessions');
      // Sort sessions by date in descending order
      const sortedSessions = response.data.sort((a, b) => 
        new Date(b.startTime) - new Date(a.startTime)
      );
      setSessions(sortedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer title="Sessions">
        <Typography>Loading sessions...</Typography>
      </PageContainer>
    );
  }

  return (
    <PageContainer 
      title="Sessions" 
      description="View and manage your sessions"
    >
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Pending" />
          <Tab label="Upcoming" />
          <Tab label="Completed" />
          <Tab label="Declined" />
        </Tabs>
      </Box>

      <Grid container spacing={2}>
        {sessions
          .filter(session => {
            switch (tabValue) {
              case 0:
                return session.status === 'pending';
              case 1:
                return session.status === 'approved' && new Date(session.startTime) > new Date();
              case 2:
                return session.status === 'completed';
              case 3:
                return session.status === 'declined';
              default:
                return false;
            }
          })
          .map(session => (
            <Grid item xs={12} key={session._id}>
              <SessionCard 
                session={session}
                currentUser={currentUser}
                onStatusChange={fetchSessions}
              />
            </Grid>
          ))}
      </Grid>
    </PageContainer>
  );
} 