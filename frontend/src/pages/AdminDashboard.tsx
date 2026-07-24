import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Box,
  Paper,
  Typography,
  Chip,
  List,
  ListItem,
  Avatar,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Place as PlaceIcon,
  Logout as LogoutIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { Header } from '../components/Header';
import { JourneyMap } from '../components/JourneyMap';
import { AdminTelemetryPanel } from '../components/AdminTelemetryPanel';
import { UserTimelineModal } from '../components/UserTimelineModal';
import { useWebSocket } from '../hooks/useWebSocket';
import { journeyService } from '../services/journeyService';
import apiClient from '../services/apiClient';
import {
  Checkpoint,
  CheckpointWebSocketMessage,
  Destination,
  Journey,
  LocationPoint,
  LocationWebSocketMessage,
} from '../types/journey';
import { useSnackbar } from 'notistack';
import { formatDateTime } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

interface EmployeeUser {
  id: number;
  username: string;
  fullName: string;
  role: string;
  isOnline: boolean;
  lastActiveAt?: string | null;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [employeesList, setEmployeesList] = useState<EmployeeUser[]>([]);
  const [activeJourneysList, setActiveJourneysList] = useState<Journey[]>([]);
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);

  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationPoint | null>(null);
  const [selectedPath, setSelectedPath] = useState<[number, number][]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [selectedCheckpoints, setSelectedCheckpoints] = useState<Checkpoint[]>([]);

  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // User Timeline Modal State
  const [timelineModalOpen, setTimelineModalOpen] = useState<boolean>(false);
  const [timelineEmpId, setTimelineEmpId] = useState<number | null>(null);
  const [timelineEmpName, setTimelineEmpName] = useState<string>('');

  const handleOpenTimeline = (empId: number, empName: string) => {
    setTimelineEmpId(empId);
    setTimelineEmpName(empName);
    setTimelineModalOpen(true);
  };

  // Fetch all real database employees and active journeys
  const refreshDirectory = useCallback(async () => {
    setLoadingList(true);
    try {
      const [empRes, journeys] = await Promise.all([
        apiClient.get<EmployeeUser[]>('/users/employees'),
        journeyService.getActiveJourneys(),
      ]);

      setEmployeesList(empRes.data);
      setActiveJourneysList(journeys);

      if (journeys.length > 0 && !selectedJourneyId) {
        handleSelectEmployeeJourney(journeys[0].journeyId);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch employee directory:', err);
    } finally {
      setLoadingList(false);
    }
  }, [selectedJourneyId]);

  useEffect(() => {
    refreshDirectory();
  }, []);

  const handleLogout = () => {
    const username = localStorage.getItem('emgage_username');
    if (username) {
      apiClient.post(`/auth/logout/${username}`).catch(() => {});
    }
    localStorage.clear();
    enqueueSnackbar('Logged out successfully', { variant: 'info' });
    navigate('/login');
  };

  const handleSelectEmployeeJourney = async (journeyId: string) => {
    setSelectedJourneyId(journeyId);
    setLoadingDetails(true);

    try {
      const [journeyDetails, locations, checkpointsList] = await Promise.all([
        journeyService.getJourney(journeyId),
        journeyService.getJourneyLocations(journeyId),
        journeyService.getJourneyCheckpoints(journeyId),
      ]);

      setSelectedJourney(journeyDetails);
      setSelectedDestination(journeyDetails.destination);
      setSelectedCheckpoints(checkpointsList);

      const pathPoints: [number, number][] = locations.map((loc) => [loc.latitude, loc.longitude]);
      setSelectedPath(pathPoints);

      if (locations.length > 0) {
        setSelectedLocation(locations[locations.length - 1]);
      } else {
        setSelectedLocation(null);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch details for journey:', err);
      enqueueSnackbar('Failed to fetch details for selected employee', { variant: 'error' });
    } finally {
      setLoadingDetails(false);
    }
  };

  // STOMP WebSocket Callbacks
  const handleLiveWebSocketLocation = useCallback(
    (msg: LocationWebSocketMessage) => {
      if (selectedJourneyId === msg.journeyId) {
        const locPoint: LocationPoint = {
          latitude: msg.latitude,
          longitude: msg.longitude,
          accuracy: 5.0,
          speed: msg.speed,
          heading: msg.heading,
          recordedAt: msg.recordedAt,
        };
        setSelectedLocation(locPoint);
        setSelectedPath((prev) => [...prev, [msg.latitude, msg.longitude]]);
      }

      if (!activeJourneysList.some((j) => j.journeyId === msg.journeyId)) {
        refreshDirectory();
      }
    },
    [selectedJourneyId, activeJourneysList, refreshDirectory]
  );

  const handleLiveWebSocketCheckpoint = useCallback(
    (msg: CheckpointWebSocketMessage) => {
      if (selectedJourneyId === msg.journeyId) {
        const cp: Checkpoint = {
          id: msg.checkpointId,
          journeyId: msg.journeyId,
          companyName: msg.companyName,
          address: msg.address,
          purpose: msg.purpose,
          latitude: msg.latitude,
          longitude: msg.longitude,
          status: msg.status,
          createdAt: msg.timestamp,
        };

        setSelectedCheckpoints((prev) => {
          const exists = prev.some((c) => c.id === cp.id);
          if (exists) {
            return prev.map((c) => (c.id === cp.id ? { ...c, status: cp.status } : c));
          }
          return [...prev, cp];
        });
      }
      enqueueSnackbar(`Live Checkpoint ${msg.eventType}: ${msg.companyName}`, { variant: 'info' });
    },
    [selectedJourneyId, enqueueSnackbar]
  );

  const { isConnected } = useWebSocket({
    onLocationUpdate: handleLiveWebSocketLocation,
    onCheckpointUpdate: handleLiveWebSocketCheckpoint,
    autoConnect: true,
  });

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <Header wsConnected={isConnected} />

      <Container maxWidth="xl" sx={{ py: 3, flexGrow: 1 }}>
        {/* Admin Bar with Logout */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 3, backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Administrator Control Center
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Connected to PostgreSQL Database `emgage_tracking` — Live STOMP Telemetry
            </Typography>
          </Box>

          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Sign Out
          </Button>
        </Paper>

        <Grid container spacing={3}>
          {/* Left Column: Live Database Employees Directory */}
          <Grid item xs={12} md={4} lg={3}>
            <Paper elevation={3} sx={{ p: 2.5, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Field Employees Directory
                </Typography>
                <Button
                  size="small"
                  startIcon={loadingList ? <CircularProgress size={14} color="inherit" /> : <RefreshIcon />}
                  onClick={refreshDirectory}
                  sx={{ textTransform: 'none' }}
                >
                  Refresh
                </Button>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {employeesList.length === 0 ? (
                <Typography variant="caption" color="text.secondary">
                  Loading field employees directory...
                </Typography>
              ) : (
                <List disablePadding sx={{ overflowY: 'auto', flexGrow: 1 }}>
                  {employeesList.map((emp) => {
                    const activeJourney = activeJourneysList.find((j) => j.employeeId === emp.id);
                    const isSelected = activeJourney && activeJourney.journeyId === selectedJourneyId;

                    return (
                      <ListItem
                        key={emp.id}
                        onClick={() => activeJourney && handleSelectEmployeeJourney(activeJourney.journeyId)}
                        sx={{
                          p: 1.5,
                          mb: 1.5,
                          borderRadius: 2.5,
                          cursor: activeJourney ? 'pointer' : 'default',
                          backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                          border: `2px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                          transition: 'all 0.2s',
                          '&:hover': activeJourney ? { borderColor: '#2563eb' } : {},
                        }}
                      >
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              #{emp.id} {emp.fullName}
                            </Typography>
                            <Chip
                              label={activeJourney ? 'ACTIVE' : emp.isOnline ? 'ONLINE' : 'OFFLINE'}
                              color={activeJourney ? 'success' : emp.isOnline ? 'info' : 'default'}
                              size="small"
                              sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }}
                            />
                          </Box>

                          <Typography variant="caption" color="text.secondary" display="block">
                            {emp.username}
                          </Typography>

                          {activeJourney && (
                            <Typography variant="caption" color="primary" display="block" sx={{ mt: 0.5, fontWeight: 600 }}>
                              <PlaceIcon fontSize="inherit" /> Target: {activeJourney.destination.name}
                            </Typography>
                          )}

                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="secondary"
                              startIcon={<HistoryIcon fontSize="small" />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenTimeline(emp.id, emp.fullName);
                              }}
                              sx={{ textTransform: 'none', fontSize: '0.7rem', py: 0.2, px: 1, borderRadius: 1.5 }}
                            >
                              Timeline History
                            </Button>
                          </Box>
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Paper>
          </Grid>

          {/* Middle Column: Interactive Live Map */}
          <Grid item xs={12} md={8} lg={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3, backgroundColor: '#ffffff' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {selectedJourney ? `Live Track: Employee #${selectedJourney.employeeId}` : 'Multi-Employee Real-Time Map'}
                </Typography>

                {selectedJourney && (
                  <Chip
                    label={`Destination: ${selectedDestination?.name}`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>

              <JourneyMap
                currentLocation={selectedLocation}
                destination={selectedDestination}
                checkpoints={selectedCheckpoints}
                path={selectedPath}
                height={600}
              />
            </Paper>
          </Grid>

          {/* Right Column: Telemetry & Inspector Panel */}
          <Grid item xs={12} lg={3}>
            <AdminTelemetryPanel
              journey={selectedJourney}
              currentLocation={selectedLocation}
              travelledPath={selectedPath}
              destination={selectedDestination}
              checkpoints={selectedCheckpoints}
              wsConnected={isConnected}
              onSelectJourneyId={handleSelectEmployeeJourney}
              loadingHistory={loadingDetails}
              onOpenTimeline={() => {
                if (selectedJourney) {
                  const emp = employeesList.find((e) => e.id === selectedJourney.employeeId);
                  handleOpenTimeline(selectedJourney.employeeId, emp ? emp.fullName : `Employee #${selectedJourney.employeeId}`);
                }
              }}
            />
          </Grid>
        </Grid>
      </Container>

      {/* User Timeline History Modal */}
      <UserTimelineModal
        open={timelineModalOpen}
        onClose={() => setTimelineModalOpen(false)}
        employeeId={timelineEmpId}
        employeeName={timelineEmpName}
        journeys={selectedJourney && selectedJourney.employeeId === timelineEmpId ? [selectedJourney] : activeJourneysList.filter((j) => j.employeeId === timelineEmpId)}
        checkpoints={selectedJourney && selectedJourney.employeeId === timelineEmpId ? selectedCheckpoints : []}
      />
    </Box>
  );
};
