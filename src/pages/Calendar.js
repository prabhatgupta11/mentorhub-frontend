import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment-timezone';
import {
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  useTheme,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { styled } from '@mui/material/styles';
import PageContainer from '../components/PageContainer';

const localizer = momentLocalizer(moment);

const StyledCalendar = styled(Box)(({ theme }) => ({
  '& .rbc-calendar': {
    backgroundColor: '#fff',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
    height: 'calc(100vh - 200px)',
  },
  '& .rbc-event': {
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.spacing(0.5),
    padding: theme.spacing(0.5),
  },
  '& .rbc-today': {
    backgroundColor: theme.palette.primary.light + '20',
  },
  '& .rbc-toolbar button': {
    borderRadius: theme.spacing(1),
  },
  '& .rbc-toolbar button:hover': {
    backgroundColor: theme.palette.primary.light,
    borderColor: theme.palette.primary.main,
  },
  '& .rbc-active': {
    backgroundColor: `${theme.palette.primary.main} !important`,
    borderColor: `${theme.palette.primary.dark} !important`,
    color: 'white !important',
  },
}));

export default function Calendar() {
  const theme = useTheme();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { currentUser } = useAuth();
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get('/api/sessions');
      const formattedEvents = response.data
        .filter(session => session.status === 'approved' || session.status === 'completed')
        .map(session => ({
          id: session._id,
          title: `Session with ${
            currentUser.role === 'mentor' ? session.mentee.name : session.mentor.name
          }`,
          start: new Date(session.startTime),
          end: new Date(session.endTime),
          meetingUrl: session.meetingUrl,
          status: session.status,
          notes: session.notes,
        }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setOpenDialog(true);
  };

  const eventStyleGetter = (event) => {
    let style = {
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
    };

    switch (event.status) {
      case 'approved':
        style.backgroundColor = theme.palette.success.main;
        break;
      case 'completed':
        style.backgroundColor = theme.palette.info.main;
        break;
      default:
        style.backgroundColor = theme.palette.primary.main;
    }

    return { style };
  };

  return (
    <PageContainer 
      title="Calendar" 
      description="Manage your mentoring schedule"
    >
      <Paper 
        elevation={0}
        sx={{ 
          p: 3,
          backgroundColor: 'background.paper',
          borderRadius: 2,
        }}
      >
        <StyledCalendar>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 'calc(100vh - 250px)' }}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleEventClick}
            timeslots={2}
            step={30}
            views={['month', 'week', 'day']}
            defaultView="month"
            tooltipAccessor={event => event.title}
          />
        </StyledCalendar>
      </Paper>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 2,
            maxWidth: 400
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          {selectedEvent?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 1 }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Start: {selectedEvent && moment(selectedEvent.start).format('MMMM Do YYYY, h:mm a')}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              End: {selectedEvent && moment(selectedEvent.end).format('MMMM Do YYYY, h:mm a')}
            </Typography>
            {selectedEvent?.notes && (
              <Typography variant="body1" sx={{ mt: 2 }}>
                Notes: {selectedEvent.notes}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          {selectedEvent?.meetingUrl && (
            <Button
              variant="contained"
              color="primary"
              href={selectedEvent.meetingUrl}
              target="_blank"
              sx={{ borderRadius: 1 }}
            >
              Join Meeting
            </Button>
          )}
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{ borderRadius: 1 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
} 