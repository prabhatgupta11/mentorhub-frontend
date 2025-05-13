import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { theme } from './theme';
import Login from './pages/Login';
import Register from './pages/Register';
import MentorDashboard from './pages/MentorDashboard';
import MenteeDashboard from './pages/MenteeDashboard';
import Profile from './pages/Profile';
import MentorList from './pages/MentorList';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SessionRequests from './pages/SessionRequests';
import Calendar from './pages/Calendar';
import Feedback from './pages/Feedback';
import SessionList from './pages/SessionList';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <DashboardRouter />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/mentors" element={
              <PrivateRoute>
                <MentorList />
              </PrivateRoute>
            } />
            <Route
              path="/requests"
              element={
                <PrivateRoute>
                  <SessionRequests />
                </PrivateRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <PrivateRoute>
                  <Calendar />
                </PrivateRoute>
              }
            />
            <Route
              path="/feedback/:sessionId"
              element={
                <PrivateRoute>
                  <Feedback />
                </PrivateRoute>
              }
            />
            <Route path="/sessions" element={
              <PrivateRoute>
                <SessionList />
              </PrivateRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Component to route to appropriate dashboard based on user role
function DashboardRouter() {
  const { currentUser } = useAuth();
  return currentUser?.role === 'mentor' ? <MentorDashboard /> : <MenteeDashboard />;
}

export default App; 