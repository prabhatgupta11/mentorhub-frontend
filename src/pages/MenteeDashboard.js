import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import moment from 'moment';
import { styled } from '@mui/material/styles';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NotesIcon from '@mui/icons-material/Notes';
import DashboardMetrics from '../components/DashboardMetrics';
import DashboardAnalytics from '../components/DashboardAnalytics';

function TabPanel({ children, value, index }) {
  return value === index && <Box sx={{ py: 3 }}>{children}</Box>;
}

const DashboardContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const SessionHeader = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1),
}));

const SessionInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

export default function MenteeDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [sessions, setSessions] = useState([]);
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState({
    totalSessions: 0,
    upcomingSessions: 0,
    averageRating: 0,
    totalHours: 0
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    calculateMetrics();
  }, [sessions]);

  const fetchSessions = async () => {
    try {
      const response = await axios.get('/api/sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const calculateMetrics = () => {
    const totalSessions = sessions.length;
    const upcomingSessions = sessions.filter(s => 
      s.status === 'approved' && moment(s.startTime).isAfter(moment())
    ).length;
    
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const totalMinutes = completedSessions.reduce((total, session) => 
      total + moment(session.endTime).diff(moment(session.startTime), 'minutes'), 0
    );

    setMetrics({
      totalSessions,
      upcomingSessions,
      averageRating: currentUser.averageRating || 0,
      totalHours: Math.round(totalMinutes / 60)
    });
  };

  const renderSessionCard = (session) => {
    const userRole = session.mentor._id === currentUser.userId ? 'mentor' : 'mentee';
    const hasGivenFeedback = session.feedback?.some(f => f.from === userRole);
    
    return (
      <StyledPaper elevation={2} key={session._id}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={8}>
            <SessionHeader variant="h6">
              Session with {session.mentor.name}
            </SessionHeader>
            <SessionInfo>
              <EventIcon fontSize="small" />
              <Typography>
                {moment(session.startTime).format('MMMM Do YYYY, h:mm a')}
              </Typography>
            </SessionInfo>
            <SessionInfo>
              <AccessTimeIcon fontSize="small" />
              <Typography>
                Duration: {moment(session.endTime).diff(moment(session.startTime), 'minutes')} minutes
              </Typography>
            </SessionInfo>
            {session.notes && (
              <SessionInfo>
                <NotesIcon fontSize="small" />
                <Typography>{session.notes}</Typography>
              </SessionInfo>
            )}
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
              <StatusChip status={session.status} />
              {session.status === 'approved' && session.meetingUrl && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => window.open(session.meetingUrl, '_blank')}
                >
                  Join Meeting
                </Button>
              )}
              {!hasGivenFeedback && session.status === 'completed' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => window.location.href = `/feedback/${session._id}`}
                >
                  Provide Feedback
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </StyledPaper>
    );
  };

  return (
    <DashboardContainer maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Mentee Dashboard
      </Typography>

      <DashboardMetrics metrics={metrics} />
      <DashboardAnalytics sessions={sessions} role="mentee" />
      
      <Box sx={{ mt: 4 }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => window.location.href = '/sessions'}
          sx={{ mr: 2 }}
        >
          View All Sessions
        </Button>
      </Box>
    </DashboardContainer>
  );
}

const StatusChip = ({ status }) => {
  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: 'warning', label: 'Pending' },
      approved: { color: 'success', label: 'Approved' },
      declined: { color: 'error', label: 'Declined' },
      completed: { color: 'info', label: 'Completed' }
    };
    return configs[status] || configs.pending;
  };

  const config = getStatusConfig(status);
  return (
    <Chip
      label={config.label}
      color={config.color}
      sx={{ 
        fontWeight: 500,
        borderRadius: 2
      }}
    />
  );
}; 