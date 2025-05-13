import { Box, Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const PageWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const PageHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& h1': {
    fontSize: '2rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
  },
  '& p': {
    color: theme.palette.text.secondary,
  }
}));

const ContentWrapper = styled(Container)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
    },
  },
}));

export default function PageContainer({ title, description, children }) {
  return (
    <PageWrapper>
      <ContentWrapper maxWidth="lg">
        <PageHeader>
          <Typography variant="h1">{title}</Typography>
          {description && (
            <Typography variant="body1">{description}</Typography>
          )}
        </PageHeader>
        {children}
      </ContentWrapper>
    </PageWrapper>
  );
} 