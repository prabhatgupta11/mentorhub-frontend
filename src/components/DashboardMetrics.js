import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const IconWrapper = styled(Box)(({ theme, color }) => ({
  backgroundColor: theme.palette[color].light,
  color: theme.palette[color].main,
  padding: theme.spacing(1.5),
  borderRadius: '50%',
  marginBottom: theme.spacing(1),
}));

const MetricValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 'bold',
  color: theme.palette.text.primary,
}));

const MetricLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

export default function DashboardMetrics({ metrics }) {
  const metricConfigs = [
    {
      icon: <PeopleIcon />,
      label: 'Total Sessions',
      value: metrics.totalSessions,
      color: 'primary',
    },
    {
      icon: <EventAvailableIcon />,
      label: 'Upcoming Sessions',
      value: metrics.upcomingSessions,
      color: 'success',
    },
    {
      icon: <StarIcon />,
      label: 'Average Rating',
      value: metrics.averageRating?.toFixed(1) || 'N/A',
      color: 'warning',
    },
    {
      icon: <AccessTimeIcon />,
      label: 'Hours Mentored',
      value: metrics.totalHours,
      color: 'info',
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {metricConfigs.map((metric, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <MetricCard elevation={2}>
            <IconWrapper color={metric.color}>
              {metric.icon}
            </IconWrapper>
            <MetricValue variant="h4">
              {metric.value}
            </MetricValue>
            <MetricLabel variant="subtitle2">
              {metric.label}
            </MetricLabel>
          </MetricCard>
        </Grid>
      ))}
    </Grid>
  );
} 