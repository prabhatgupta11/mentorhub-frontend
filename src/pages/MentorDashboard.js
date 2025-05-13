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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton,
  LinearProgress,
  useTheme,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import moment from 'moment';
import VideocamIcon from '@mui/icons-material/Videocam';
import { styled } from '@mui/material/styles';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NotesIcon from '@mui/icons-material/Notes';
import DashboardMetrics from '../components/DashboardMetrics';
import DashboardAnalytics from '../components/DashboardAnalytics';
import PageContainer from '../components/PageContainer';
import {
  EventAvailable as EventAvailableIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  ArrowUpward as TrendUpIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { alpha } from '@mui/material/styles';

function TabPanel({ children, value, index }) {
  return value === index && <Box sx={{ py: 3 }}>{children}</Box>;
}

// Styled components
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

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const StatCard = ({ title, value, icon, color }) => (
  <StyledCard>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography color="textSecondary" variant="h6" component="h2">
          {title}
        </Typography>
        <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
          {icon}
        </Avatar>
      </Box>
      <Typography variant="h3" component="div" fontWeight="bold">
        {value}
      </Typography>
    </CardContent>
  </StyledCard>
);

// Add this custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        sx={{
          p: 2,
          boxShadow: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: entry.color,
              }}
            />
            <Typography variant="body2">
              {entry.name}: {entry.value}
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  }
  return null;
};

export default function MentorDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [feedback, setFeedback] = useState({ rating: 0, comment: '' });
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState({
    totalSessions: 0,
    upcomingSessions: 0,
    averageRating: 0,
    totalHours: 0
  });
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalSessions: 0,
      upcomingSessions: 0,
      completedSessions: 0,
      averageRating: 0,
    },
    recentSessions: [],
  });
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchSessions();
    fetchDashboardData();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get('/api/sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleSessionAction = async (sessionId, action) => {
    try {
      let response;
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };

      // Both approve and decline should use POST
      response = await axios.post(`/api/sessions/${sessionId}/${action}`, {}, config);
      
      if (action === 'approve' && response.data.meetingUrl) {
        alert('Session approved and meeting link generated successfully!');
      } else if (action === 'approve') {
        alert('Session approved but there was an issue generating the meeting link.');
      } else if (action === 'decline') {
        alert('Session declined successfully!');
      }

      await fetchSessions();
      await fetchDashboardData();
    } catch (error) {
      console.error(`Error ${action}ing session:`, error);
      alert(`Error ${action}ing session. Please try again.`);
    }
  };

  const handleFeedback = async () => {
    try {
      if (!selectedSession) {
        alert('No session selected');
        return;
      }

      await axios.post(`/api/sessions/${selectedSession._id}/feedback`, feedback);
      setFeedbackDialog(false);
      setFeedback({ rating: 0, comment: '' });
      setSelectedSession(null);
      fetchSessions();
      fetchDashboardData();
      alert('Feedback submitted successfully!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    }
  };

  const handleCloseFeedback = () => {
    setFeedbackDialog(false);
    setFeedback({ rating: 0, comment: '' });
    setSelectedSession(null);
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'declined': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const renderActionButtons = (session, hasGivenFeedback) => {
    const userRole = session.mentor._id === currentUser.userId ? 'mentor' : 'mentee';
    
    const buttons = [
      {
        label: 'Approve',
        color: 'success',
        onClick: () => handleSessionAction(session._id, 'approve'),
        disabled: session.status !== 'pending'
      },
      {
        label: 'Decline',
        color: 'error',
        onClick: () => handleSessionAction(session._id, 'decline'),
        disabled: session.status !== 'pending'
      },
      {
        label: 'Join Meeting',
        color: 'primary',
        onClick: () => {
          if (session.status === 'approved' && session.meetingUrl) {
            window.open(session.meetingUrl, '_blank');
          }
        },
        disabled: session.status !== 'approved' || !session.meetingUrl
      },
      {
        label: 'Provide Feedback',
        color: 'primary',
        onClick: () => {
          setSelectedSession(session);
          setFeedbackDialog(true);
        },
        disabled: hasGivenFeedback
      }
    ];

    return (
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
        {buttons.map((button, index) => (
          <Button
            key={index}
            variant="contained"
            color={button.color}
            onClick={button.onClick}
            disabled={button.disabled}
          >
            {button.label}
          </Button>
        ))}
      </Box>
    );
  };

  const renderSessionCard = (session) => {
    const userRole = session.mentor._id === currentUser.userId ? 'mentor' : 'mentee';
    const hasGivenFeedback = session.feedback?.some(f => f.from === userRole);
    
    return (
      <StyledPaper elevation={2} key={session._id}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={8}>
            <SessionHeader variant="h6">
              Session with {session.mentee.name}
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
              {renderActionButtons(session, hasGivenFeedback)}
            </Box>
          </Grid>
        </Grid>
      </StyledPaper>
    );
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
    
    const ratings = completedSessions
      .map(s => s.feedback?.find(f => f.from === 'mentee')?.rating)
      .filter(Boolean);
    
    const averageRating = ratings.length 
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
      : 0;

    setMetrics({
      totalSessions,
      upcomingSessions,
      averageRating,
      totalHours: Math.round(totalMinutes / 60)
    });
  };

  useEffect(() => {
    calculateMetrics();
  }, [sessions]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/sessions/mentor/dashboard', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setDashboardData(response.data);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <PageContainer title="Mentor Dashboard" description="View your mentoring statistics and recent sessions">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Sessions"
              value={dashboardData.stats.totalSessions}
              icon={<TimelineIcon />}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Upcoming"
              value={dashboardData.stats.upcomingSessions}
              icon={<EventIcon />}
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Completed"
              value={dashboardData.stats.completedSessions}
              icon={<TrendUpIcon />}
              color={theme.palette.info.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Average Rating"
              value={dashboardData.stats.averageRating?.toFixed(1) || '0.0'}
              icon={<StarIcon />}
              color={theme.palette.warning.main}
            />
          </Grid>
        </Grid>

        {/* Chart and Recent Sessions */}
        <Grid container spacing={3}>
          {/* Chart */}
          <Grid item xs={12} md={8}>
            <Paper 
              sx={{ 
                p: 3, 
                height: '100%',
                background: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.light, 0.05)}, ${alpha(theme.palette.background.paper, 1)})`,
                borderRadius: 2,
                boxShadow: theme.shadows[2],
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                    Session Trends
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly session statistics
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {['Week', 'Month', 'Year'].map((period) => (
                    <Button
                      key={period}
                      size="small"
                      variant={period === 'Month' ? 'contained' : 'outlined'}
                      sx={{ 
                        minWidth: 60,
                        borderRadius: 2,
                        ...(period === 'Month' && {
                          boxShadow: 2,
                        })
                      }}
                    >
                      {period}
                    </Button>
                  ))}
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                  data={[
                    { month: 'Jan', completed: 20, upcoming: 10, total: 30 },
                    { month: 'Feb', completed: 25, upcoming: 15, total: 40 },
                    { month: 'Mar', completed: 20, upcoming: 15, total: 35 },
                    { month: 'Apr', completed: 30, upcoming: 20, total: 50 },
                    { month: 'May', completed: 29, upcoming: 20, total: 49 },
                    { month: 'Jun', completed: 35, upcoming: 25, total: 60 },
                  ]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorUpcoming" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={theme.palette.divider}
                    opacity={0.5}
                  />
                  <XAxis 
                    dataKey="month" 
                    stroke={theme.palette.text.secondary}
                    tick={{ fill: theme.palette.text.secondary }}
                  />
                  <YAxis 
                    stroke={theme.palette.text.secondary}
                    tick={{ fill: theme.palette.text.secondary }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ 
                      paddingTop: '20px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    name="Completed Sessions"
                    stroke={theme.palette.success.main}
                    fillOpacity={1}
                    fill="url(#colorCompleted)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="upcoming"
                    name="Upcoming Sessions"
                    stroke={theme.palette.primary.main}
                    fillOpacity={1}
                    fill="url(#colorUpcoming)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Recent Sessions */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Recent Sessions
              </Typography>
              <List>
                {dashboardData.recentSessions.length > 0 ? (
                  dashboardData.recentSessions.map((session, index) => (
                    <React.Fragment key={session._id}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          flexDirection: { xs: 'column', sm: 'row' },
                          gap: { xs: 2, sm: 0 },
                          py: 2,
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'flex-start',
                          width: '100%',
                          gap: 2 
                        }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                              <PeopleIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={session.student?.name || 'Unknown Student'}
                            secondary={
                              <React.Fragment>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >
                                  {new Date(session.startTime).toLocaleDateString()}
                                </Typography>
                                {session.feedback?.length > 0 && (
                                  <Box sx={{ mt: 1 }}>
                                    <Rating
                                      value={session.feedback.find(f => f.from === 'mentee')?.rating || 0}
                                      readOnly
                                      size="small"
                                    />
                                  </Box>
                                )}
                              </React.Fragment>
                            }
                          />
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1,
                          mt: { xs: 1, sm: 0 },
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          width: '100%',
                          flexWrap: 'wrap'
                        }}>
                          <StatusChip status={session.status} />
                          {session.status === 'approved' && session.meetingUrl && (
                            <IconButton
                              color="primary"
                              onClick={() => window.open(session.meetingUrl, '_blank')}
                              size="small"
                            >
                              <VideocamIcon />
                            </IconButton>
                          )}
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setSelectedSession(session);
                              setFeedbackDialog(true);
                            }}
                            disabled={session.feedback?.some(f => f.from === 'mentor')}
                          >
                            Feedback
                          </Button>
                        </Box>
                      </ListItem>
                      {index < dashboardData.recentSessions.length - 1 && (
                        <Divider component="li" sx={{ my: 1 }} />
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText 
                      primary="No recent sessions"
                      secondary="Your recent sessions will appear here"
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialog} onClose={handleCloseFeedback}>
        <DialogTitle>Provide Session Feedback</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography component="legend">Rating</Typography>
              <Rating
                value={feedback.rating}
                onChange={(event, newValue) => {
                  setFeedback(prev => ({ ...prev, rating: newValue }));
                }}
              />
            </Box>
            <TextField
              autoFocus
              margin="dense"
              label="Comments"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={feedback.comment}
              onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFeedback}>Cancel</Button>
          <Button onClick={handleFeedback} variant="contained" color="primary">
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

// Custom Status Chip component
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
      size="small"
      sx={{ 
        fontWeight: 500,
        borderRadius: 2,
        minWidth: { xs: '80px', sm: 'auto' }
      }}
    />
  );
}; 
