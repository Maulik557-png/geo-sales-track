import React, { useState, useEffect } from 'react';
import { Container, Grid, Box, Button, Typography, Paper, Alert, Chip, Avatar } from '@mui/material';
import { PlayArrow as PlayIcon, Stop as StopIcon, AddLocationAlt as AddLocationIcon, Person as PersonIcon, Logout as LogoutIcon, MyLocation as MyLocationIcon } from '@mui/icons-material';
import { Header } from '../components/Header';
import { JourneyMap } from '../components/JourneyMap';
import { JourneyInfoCard } from '../components/JourneyInfoCard';
import { StartJourneyModal } from '../components/StartJourneyModal';
import { AddCheckpointModal } from '../components/AddCheckpointModal';
import { useJourney } from '../contexts/JourneyContext';
import { useTracking } from '../hooks/useTracking';
import { useWebSocket } from '../hooks/useWebSocket';
import { journeyService } from '../services/journeyService';
import apiClient from '../services/apiClient';
import { CreateCheckpointRequest, StartJourneyRequest } from '../types/journey';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

export const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeJourney,
    currentLocation,
    travelledPath,
    destination,
    checkpoints,
    status,
    setActiveJourney,
    setCurrentLocation,
    setDestination,
    setStatus,
    setIsTracking,
    setIsSimulationMode,
    addCheckpoint,
    resetJourney,
  } = useJourney();

  const { isConnected } = useWebSocket({ autoConnect: true });
  useTracking();
  const { enqueueSnackbar } = useSnackbar();

  const [loggedInEmpId, setLoggedInEmpId] = useState<number>(101);
  const [loggedInEmpName, setLoggedInEmpName] = useState<string>('Alex Johnson');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [checkpointModalOpen, setCheckpointModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const savedId = localStorage.getItem('emgage_emp_id');
    const savedName = localStorage.getItem('emgage_emp_name');
    if (savedId) setLoggedInEmpId(Number(savedId));
    if (savedName) setLoggedInEmpName(savedName);

    // Auto-fetch employee current location immediately after login
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, speed, heading, accuracy } = pos.coords;
          setCurrentLocation({
            latitude,
            longitude,
            accuracy: accuracy || 5.0,
            speed: speed ? speed * 3.6 : 0,
            heading: heading || 0,
            recordedAt: new Date(pos.timestamp).toISOString(),
          });
          enqueueSnackbar('Live location acquired!', { variant: 'success' });
        },
        (err) => {
          console.warn('Initial location prompt notice:', err);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, [setCurrentLocation, enqueueSnackbar]);

  const handleLogout = () => {
    const username = localStorage.getItem('emgage_username');
    if (username) {
      apiClient.post(`/auth/logout/${username}`).catch(() => {});
    }
    localStorage.clear();
    enqueueSnackbar('Logged out successfully', { variant: 'info' });
    navigate('/login');
  };

  const handleStartJourneySubmit = async (request: StartJourneyRequest, isSimulation: boolean) => {
    setLoading(true);
    try {
      const response = await journeyService.startJourney(request);

      const journeyData = {
        journeyId: response.journeyId,
        employeeId: request.employeeId,
        status: response.status,
        destination: request.destination,
        startedAt: response.startedAt,
        endedAt: null,
      };

      setActiveJourney(journeyData);
      setDestination(request.destination);
      setStatus('ACTIVE');
      setIsSimulationMode(isSimulation);
      setIsTracking(true);

      enqueueSnackbar(`Journey started for Employee #${request.employeeId}!`, { variant: 'success' });
      setModalOpen(false);
    } catch (err: unknown) {
      console.error('Error starting journey:', err);
      enqueueSnackbar('Failed to start journey. Check backend server.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCheckpointSubmit = async (request: CreateCheckpointRequest) => {
    if (!activeJourney) return;
    setLoading(true);
    try {
      const newCheckpoint = await journeyService.addCheckpoint(activeJourney.journeyId, request);
      addCheckpoint(newCheckpoint);
      enqueueSnackbar(`Checkpoint logged: ${newCheckpoint.companyName}!`, { variant: 'success' });
      setCheckpointModalOpen(false);
    } catch (err: unknown) {
      console.error('Error adding checkpoint:', err);
      enqueueSnackbar('Failed to add checkpoint.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEndJourney = async () => {
    if (!activeJourney) return;

    setLoading(true);
    try {
      const response = await journeyService.completeJourney(activeJourney.journeyId);
      setStatus('COMPLETED');
      setIsTracking(false);

      setActiveJourney({
        ...activeJourney,
        status: 'COMPLETED',
        endedAt: response.endedAt || new Date().toISOString(),
      });

      enqueueSnackbar('Journey completed successfully!', { variant: 'info' });
    } catch (err: unknown) {
      console.error('Error ending journey:', err);
      enqueueSnackbar('Failed to complete journey.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <Header wsConnected={isConnected} />

      <Container maxWidth="xl" sx={{ py: 3, flexGrow: 1 }}>
        {/* Logged in Employee Session Banner with Logout */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 3, backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#2563eb' }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {loggedInEmpName} <Chip label={`ID: #${loggedInEmpId}`} size="small" color="primary" sx={{ ml: 1, fontWeight: 700 }} />
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Spring Security Authenticated Session — Live Telemetry Node
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<MyLocationIcon />}
              onClick={() => {
                if ('geolocation' in navigator) {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      const { latitude, longitude, speed, heading, accuracy } = pos.coords;
                      setCurrentLocation({
                        latitude,
                        longitude,
                        accuracy: accuracy || 5.0,
                        speed: speed ? speed * 3.6 : 0,
                        heading: heading || 0,
                        recordedAt: new Date(pos.timestamp).toISOString(),
                      });
                      enqueueSnackbar(`Location acquired: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, { variant: 'success' });
                    },
                    (err) => {
                      enqueueSnackbar(`GPS Error: ${err.message}`, { variant: 'error' });
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                  );
                }
              }}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Fetch Real GPS
            </Button>
            <Typography variant="body2" sx={{ fontWeight: 600, color: status === 'ACTIVE' ? '#16a34a' : '#64748b' }}>
              {status === 'ACTIVE' ? '🟢 LIVE GPS TRACKING ACTIVE' : '⚪ Session Ready'}
            </Typography>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ textTransform: 'none' }}
            >
              Sign Out
            </Button>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Main Map Panel */}
          <Grid item xs={12} lg={8}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3, backgroundColor: '#ffffff' }}>
              <Box
                sx={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Live Movement & Route Map
                </Typography>

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {status === 'ACTIVE' && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<AddLocationIcon />}
                      onClick={() => setCheckpointModalOpen(true)}
                      sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                    >
                      Add Checkpoint
                    </Button>
                  )}

                  {!activeJourney || status === 'COMPLETED' ? (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<PlayIcon />}
                      onClick={() => setModalOpen(true)}
                      disabled={loading}
                      sx={{ textTransform: 'none', fontWeight: 600, px: 2.5, borderRadius: 2 }}
                    >
                      Start Journey
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<StopIcon />}
                      onClick={handleEndJourney}
                      disabled={loading || status !== 'ACTIVE'}
                      sx={{ textTransform: 'none', fontWeight: 600, px: 2.5, borderRadius: 2 }}
                    >
                      {loading ? 'Completing...' : 'End Journey'}
                    </Button>
                  )}

                  {status === 'COMPLETED' && (
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={resetJourney}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      New Journey
                    </Button>
                  )}
                </Box>
              </Box>

              {status === 'ACTIVE' && (
                <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                  Live GPS tracking active for Employee #{loggedInEmpId}. Position updates broadcast every 5 seconds.
                </Alert>
              )}

              <JourneyMap
                currentLocation={currentLocation}
                destination={destination}
                checkpoints={checkpoints}
                path={travelledPath}
                height={550}
              />
            </Paper>
          </Grid>

          {/* Telemetry & Info Panel */}
          <Grid item xs={12} lg={4}>
            <JourneyInfoCard onOpenAddCheckpoint={() => setCheckpointModalOpen(true)} />
          </Grid>
        </Grid>
      </Container>

      {/* Start Journey Modal */}
      <StartJourneyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleStartJourneySubmit}
        loading={loading}
      />

      {/* Add Checkpoint Modal */}
      <AddCheckpointModal
        open={checkpointModalOpen}
        onClose={() => setCheckpointModalOpen(false)}
        onSubmit={handleAddCheckpointSubmit}
        currentLocation={currentLocation}
        loading={loading}
      />
    </Box>
  );
};
