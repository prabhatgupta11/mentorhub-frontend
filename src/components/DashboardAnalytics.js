import React, { useMemo } from 'react';
import { Grid, Paper, Typography, Box, useTheme, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  People as PeopleIcon,
} from '@mui/icons-material';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  height: '100%',
  minHeight: '120px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: '#fff',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
  [theme.breakpoints.down('sm')]: {
    minHeight: '100px',
  },
}));

const IconBox = styled(Box)(({ theme, color }) => ({
  backgroundColor: theme.palette[color].light,
  borderRadius: '50%',
  padding: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    color: theme.palette[color].main,
    fontSize: '1.5rem',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.75),
    '& svg': {
      fontSize: '1.25rem',
    },
  },
}));

const ChartCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  height: '400px',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fff',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
  [theme.breakpoints.down('md')]: {
    height: '350px',
  },
  [theme.breakpoints.down('sm')]: {
    height: '300px',
  },
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  position: 'relative',
  minHeight: 0,
  width: '100%',
  height: '100%',
  maxHeight: '300px',
  [theme.breakpoints.down('sm')]: {
    maxHeight: '250px',
  },
}));

const getMonthlyData = (sessions) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const last6Months = months.slice(currentMonth - 5, currentMonth + 1);

  const completedData = new Array(6).fill(0);
  const upcomingData = new Array(6).fill(0);

  sessions.forEach(session => {
    const sessionMonth = new Date(session.startTime).getMonth();
    const monthIndex = last6Months.indexOf(months[sessionMonth]);
    if (monthIndex !== -1) {
      if (session.status === 'completed') {
        completedData[monthIndex]++;
      } else if (session.status === 'approved' && new Date(session.startTime) > new Date()) {
        upcomingData[monthIndex]++;
      }
    }
  });

  return {
    labels: last6Months,
    completedData,
    upcomingData,
  };
};

export default function DashboardAnalytics({ sessions, role }) {
  const theme = useTheme();

  const stats = useMemo(() => {
    const completed = sessions.filter(s => s.status === 'completed').length;
    const upcoming = sessions.filter(s => 
      s.status === 'approved' && new Date(s.startTime) > new Date()
    ).length;
    const pending = sessions.filter(s => s.status === 'pending').length;
    const total = sessions.length;

    return {
      completed,
      upcoming,
      pending,
      total,
      completionRate: total ? (completed / total * 100).toFixed(1) : 0
    };
  }, [sessions]);

  const { labels, completedData, upcomingData } = useMemo(() => 
    getMonthlyData(sessions), [sessions]
  );

  const chartData = useMemo(() => ({
    labels: ['Completed', 'Upcoming', 'Pending'],
    datasets: [{
      data: [stats.completed, stats.upcoming, stats.pending],
      backgroundColor: [
        theme.palette.success.main,
        theme.palette.primary.main,
        theme.palette.warning.main,
      ],
      borderWidth: 0,
      borderRadius: 4,
    }],
  }), [stats, theme]);

  const barData = {
    labels,
    datasets: [
      {
        label: 'Completed',
        data: completedData,
        backgroundColor: theme.palette.success.main,
      },
      {
        label: 'Upcoming',
        data: upcomingData,
        backgroundColor: theme.palette.primary.main,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: { size: 12 },
        },
      },
    },
    cutout: '70%',
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { 
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: { 
        stacked: true,
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { 
          font: { size: 12 },
          usePointStyle: true,
        },
      },
    },
  };

  return (
    <Grid container spacing={3}>
      {/* Stats Cards */}
      <Grid item xs={6} sm={6} md={3}>
        <StatCard elevation={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <IconBox color="primary">
              <TrendingUpIcon />
            </IconBox>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              fontSize: { xs: '1.25rem', sm: '1.5rem' } 
            }}>
              {stats.total}
            </Typography>
          </Box>
          <Typography color="textSecondary" variant="body2" sx={{ mb: 1 }}>
            Total Sessions
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={100} 
            sx={{ height: 4, borderRadius: 2 }} 
          />
        </StatCard>
      </Grid>

      <Grid item xs={6} sm={6} md={3}>
        <StatCard elevation={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <IconBox color="success">
              <ScheduleIcon />
            </IconBox>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              fontSize: { xs: '1.25rem', sm: '1.5rem' } 
            }}>
              {stats.completed}
            </Typography>
          </Box>
          <Typography color="textSecondary" variant="body2" sx={{ mb: 1 }}>
            Completed Sessions
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(stats.completed / stats.total) * 100} 
            color="success"
            sx={{ height: 4, borderRadius: 2 }} 
          />
        </StatCard>
      </Grid>

      <Grid item xs={6} sm={6} md={3}>
        <StatCard elevation={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <IconBox color="warning">
              <StarIcon />
            </IconBox>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              fontSize: { xs: '1.25rem', sm: '1.5rem' } 
            }}>
              {stats.upcoming}
            </Typography>
          </Box>
          <Typography color="textSecondary" variant="body2" sx={{ mb: 1 }}>
            Upcoming Sessions
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(stats.upcoming / stats.total) * 100} 
            color="warning"
            sx={{ height: 4, borderRadius: 2 }} 
          />
        </StatCard>
      </Grid>

      <Grid item xs={6} sm={6} md={3}>
        <StatCard elevation={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <IconBox color="info">
              <PeopleIcon />
            </IconBox>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              fontSize: { xs: '1.25rem', sm: '1.5rem' } 
            }}>
              {stats.pending}
            </Typography>
          </Box>
          <Typography color="textSecondary" variant="body2" sx={{ mb: 1 }}>
            Pending Requests
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(stats.pending / stats.total) * 100} 
            color="info"
            sx={{ height: 4, borderRadius: 2 }} 
          />
        </StatCard>
      </Grid>

      {/* Charts */}
      <Grid item xs={12} md={8}>
        <ChartCard elevation={0}>
          <Typography variant="h6" gutterBottom sx={{ 
            fontWeight: 600,
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}>
            Session Progress
          </Typography>
          <ChartContainer>
            <Bar data={barData} options={barOptions} />
          </ChartContainer>
        </ChartCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <ChartCard elevation={0}>
          <Typography variant="h6" gutterBottom sx={{ 
            fontWeight: 600,
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}>
            Sessions Overview
          </Typography>
          <ChartContainer>
            <Doughnut data={chartData} options={chartOptions} />
          </ChartContainer>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}>
              {stats.completionRate}%
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Completion Rate
            </Typography>
          </Box>
        </ChartCard>
      </Grid>
    </Grid>
  );
} 