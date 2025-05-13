import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          MentorHub
        </Typography>
        {currentUser ? (
          <>
            <Button color="inherit" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
            {currentUser.role === 'mentee' ? (
              <>
                <Button color="inherit" onClick={() => navigate('/mentors')}>
                  Find Mentors
                </Button>
                <Button color="inherit" onClick={() => navigate('/requests')}>
                  My Requests
                </Button>
              </>
            ) : (
              <Button color="inherit" onClick={() => navigate('/sessions')}>
                Session Requests
              </Button>
            )}
            <Button color="inherit" onClick={() => navigate('/calendar')}>
              Calendar
            </Button>
            <Button color="inherit" onClick={() => navigate('/profile')}>
              Profile
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button color="inherit" onClick={() => navigate('/register')}>
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
} 