import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
  },
}));

const RatingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

export const FeedbackDialog = ({ open, onClose, onSubmit, feedback, setFeedback }) => (
  <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>
      <Typography variant="h5" component="div">
        Provide Feedback
      </Typography>
    </DialogTitle>
    <DialogContent>
      <RatingContainer>
        <Typography variant="body1">How would you rate this session?</Typography>
        <Rating
          size="large"
          value={feedback.rating}
          onChange={(_, newValue) => setFeedback(prev => ({ ...prev, rating: newValue }))}
        />
      </RatingContainer>
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Your Comments"
        value={feedback.comment}
        onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
        variant="outlined"
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="inherit">
        Cancel
      </Button>
      <Button
        onClick={onSubmit}
        variant="contained"
        disabled={!feedback.rating || !feedback.comment}
      >
        Submit Feedback
      </Button>
    </DialogActions>
  </StyledDialog>
); 