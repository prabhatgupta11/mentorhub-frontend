import { Box, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '200px',
  gap: theme.spacing(2),
}));

export const LoadingSpinner = ({ message = 'Loading...' }) => (
  <LoadingContainer>
    <CircularProgress size={40} />
    <Typography variant="body1" color="textSecondary">
      {message}
    </Typography>
  </LoadingContainer>
); 