import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Enhanced color palette
const COLORS = {
  primary: ['#2196f3', '#1976d2', '#0d47a1'],
  success: ['#4caf50', '#388e3c', '#1b5e20'],
  warning: ['#ff9800', '#f57c00', '#e65100'],
  error: ['#f44336', '#d32f2f', '#b71c1c'],
};

const STATUS_COLORS = {
  pending: COLORS.warning[1],
  approved: COLORS.success[1],
  completed: COLORS.primary[1],
  declined: COLORS.error[1],
};

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState({
    sessionsPerWeek: [],
    sessionsByStatus: [],
    ratings: [],
    totalSessions: 0,
    averageRating: 0,
    completionRate: 0,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <Typography variant="subtitle2">{label}</Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{ color: entry.color }}
            >
              {`${entry.name}: ${entry.value}`}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  const StatCard = ({ title, value, subtitle, color }) => (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        background: `linear-gradient(45deg, ${color[0]} 0%, ${color[1]} 100%)`,
        color: 'white',
      }}
    >
      <Typography variant="h4" sx={{ mb: 1 }}>
        {value}
      </Typography>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {subtitle}
        </Typography>
      )}
    </Paper>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading analytics...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, bgcolor: '#fff3f3' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Stats Overview */}
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Sessions"
            value={analytics.totalSessions}
            color={COLORS.primary}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Average Rating"
            value={analytics.averageRating.toFixed(1)}
            subtitle="out of 5.0"
            color={COLORS.success}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Completion Rate"
            value={`${(analytics.completionRate * 100).toFixed(0)}%`}
            color={COLORS.warning}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Active Sessions"
            value={analytics.sessionsByStatus.find(s => s.name === 'approved')?.value || 0}
            color={COLORS.error}
          />
        </Grid>

        {/* Sessions per Week Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Sessions Trend
            </Typography>
            <ResponsiveContainer>
              <AreaChart data={analytics.sessionsPerWeek}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary[0]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.primary[0]} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="sessions"
                  stroke={COLORS.primary[1]}
                  fillOpacity={1}
                  fill="url(#colorSessions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Session Status Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Session Status Distribution
            </Typography>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={analytics.sessionsByStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analytics.sessionsByStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name.toLowerCase()]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Ratings Distribution */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: '300px' }}>
            <Typography variant="h6" gutterBottom>
              Rating Distribution
            </Typography>
            <ResponsiveContainer>
              <LineChart data={analytics.ratings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={COLORS.success[1]}
                  strokeWidth={2}
                  dot={{ fill: COLORS.success[0] }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 