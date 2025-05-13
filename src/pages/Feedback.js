import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Rating,
  TextField,
  Button,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function Feedback() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [session, setSession] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
        console.log('28 is working')
      const response = await axios.get(`/api/sessions/${sessionId}`);
      setSession(response.data);
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/feedback/${sessionId}`, {
        rating,
        comment,
        role: currentUser.role,
      });
      navigate('/sessions');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  if (!session) return null;

  return (
    <Container maxWidth="md">
      <Paper>
        <Typography variant="h5" gutterBottom>
          Provide Feedback
        </Typography>
        <Typography variant="subtitle1">
          Session with {currentUser.role === 'mentor' ? session.mentee.name : session.mentor.name}
        </Typography>
        
        <div>
          <Typography component="legend">Rating</Typography>
          <Rating
            value={rating}
            onChange={(event, newValue) => setRating(newValue)}
            size="large"
          />
        </div>

        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          label="Comments"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmit}
        >
          Submit Feedback
        </Button>
      </Paper>
    </Container>
  );
} 