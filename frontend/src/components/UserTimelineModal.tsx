import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Paper,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Person as PersonIcon,
  PlayCircleFilled as StartIcon,
  CheckCircle as CheckCircleIcon,
  Flag as FlagIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Checkpoint, Journey } from '../types/journey';
import { formatDateTime } from '../utils/formatters';

export interface TimelineEvent {
  id: string;
  type: 'LOGIN' | 'JOURNEY_START' | 'CHECKPOINT' | 'JOURNEY_END';
  timestamp: string;
  title: string;
  subtitle: string;
  details?: string;
  status?: string;
  locationName?: string;
}

interface UserTimelineModalProps {
  open: boolean;
  onClose: () => void;
  employeeId: number | null;
  employeeName: string;
  journeys: Journey[];
  checkpoints: Checkpoint[];
}

export const UserTimelineModal: React.FC<UserTimelineModalProps> = ({
  open,
  onClose,
  employeeId,
  employeeName,
  journeys = [],
  checkpoints = [],
}) => {
  // Aggregate all events into a unified chronological timeline
  const events: TimelineEvent[] = [];

  // Add Employee Session Login Event
  events.push({
    id: 'login-event',
    type: 'LOGIN',
    timestamp: new Date().toISOString(),
    title: 'Employee Session Active',
    subtitle: `Authenticated Spring Security Session for ${employeeName}`,
    details: 'System online telemetry channel connected',
  });

  // Add Journey Events
  journeys.forEach((j) => {
    events.push({
      id: `j-start-${j.journeyId}`,
      type: 'JOURNEY_START',
      timestamp: j.startedAt,
      title: `Started Journey #${j.journeyId.slice(0, 8)}`,
      subtitle: `Target Destination: ${j.destination.name}`,
      details: `Destination Coordinates: ${j.destination.latitude.toFixed(4)}, ${j.destination.longitude.toFixed(4)}`,
      status: j.status,
    });

    if (j.endedAt) {
      events.push({
        id: `j-end-${j.journeyId}`,
        type: 'JOURNEY_END',
        timestamp: j.endedAt,
        title: `Completed Journey #${j.journeyId.slice(0, 8)}`,
        subtitle: `Successfully arrived at ${j.destination.name}`,
        status: 'COMPLETED',
      });
    }
  });

  // Add Checkpoint Events
  checkpoints.forEach((cp) => {
    events.push({
      id: `cp-${cp.id}`,
      type: 'CHECKPOINT',
      timestamp: cp.createdAt,
      title: `Checkpoint: ${cp.companyName}`,
      subtitle: `Address: ${cp.address}`,
      details: `Purpose: ${cp.purpose}`,
      status: cp.status,
      locationName: cp.companyName,
    });
  });

  // Sort events chronologically descending (newest first)
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const visitedCount = checkpoints.filter((c) => c.status === 'VISITED').length;
  const pendingCount = checkpoints.filter((c) => c.status === 'PENDING').length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ style: { borderRadius: 16 } }}>
      <DialogTitle sx={{ p: 2.5, backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: '#2563eb' }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Timeline History — #{employeeId} {employeeName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Chronological Audit Trail & Field Activity Log
            </Typography>
          </Box>
        </Box>
        <Button onClick={onClose} sx={{ color: '#ffffff', minWidth: 'auto' }}>
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 3, backgroundColor: '#f8fafc' }}>
        {/* Metric Summary Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2, mb: 3 }}>
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2.5, backgroundColor: '#ffffff', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Total Journeys
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#2563eb' }}>
              {journeys.length}
            </Typography>
          </Paper>

          <Paper elevation={1} sx={{ p: 2, borderRadius: 2.5, backgroundColor: '#ffffff', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Checkpoints Logged
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
              {checkpoints.length}
            </Typography>
          </Paper>

          <Paper elevation={1} sx={{ p: 2, borderRadius: 2.5, backgroundColor: '#ffffff', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Visited / Completed
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#16a34a' }}>
              {visitedCount}
            </Typography>
          </Paper>

          <Paper elevation={1} sx={{ p: 2, borderRadius: 2.5, backgroundColor: '#ffffff', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Pending Visits
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#d97706' }}>
              {pendingCount}
            </Typography>
          </Paper>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Custom Pure MUI Timeline Stream */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 2 }}>
          Activity Timeline Stream ({events.length} Events)
        </Typography>

        {events.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No activity history recorded for this employee yet.
          </Typography>
        ) : (
          <Box sx={{ position: 'relative', pl: 3, borderLeft: '3px solid #cbd5e1', ml: 1 }}>
            {events.map((item, idx) => {
              let dotBg = '#2563eb';
              let icon = <ScheduleIcon fontSize="small" style={{ color: '#ffffff' }} />;

              if (item.type === 'LOGIN') {
                dotBg = '#0284c7';
                icon = <PersonIcon fontSize="small" style={{ color: '#ffffff' }} />;
              } else if (item.type === 'JOURNEY_START') {
                dotBg = '#2563eb';
                icon = <StartIcon fontSize="small" style={{ color: '#ffffff' }} />;
              } else if (item.type === 'CHECKPOINT') {
                dotBg = item.status === 'VISITED' ? '#16a34a' : '#d97706';
                icon = item.status === 'VISITED' ? <CheckCircleIcon fontSize="small" style={{ color: '#ffffff' }} /> : <LocationIcon fontSize="small" style={{ color: '#ffffff' }} />;
              } else if (item.type === 'JOURNEY_END') {
                dotBg = '#16a34a';
                icon = <FlagIcon fontSize="small" style={{ color: '#ffffff' }} />;
              }

              return (
                <Box key={item.id} sx={{ position: 'relative', mb: 3, pl: 2 }}>
                  {/* Timeline Badge Bullet */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: -37,
                      top: 4,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: dotBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    }}
                  >
                    {icon}
                  </Box>

                  {/* Card Body */}
                  <Paper elevation={1} sx={{ p: 2, borderRadius: 2.5, backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {item.title}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>
                          {formatDateTime(item.timestamp)}
                        </Typography>
                        {item.status && (
                          <Chip
                            label={item.status}
                            size="small"
                            color={item.status === 'VISITED' || item.status === 'COMPLETED' ? 'success' : 'warning'}
                            sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }}
                          />
                        )}
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {item.subtitle}
                    </Typography>

                    {item.details && (
                      <Typography variant="caption" sx={{ color: '#475569', display: 'block', backgroundColor: '#f1f5f9', p: 1, borderRadius: 1.5, mt: 1 }}>
                        {item.details}
                      </Typography>
                    )}
                  </Paper>
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, backgroundColor: '#ffffff' }}>
        <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}>
          Close Timeline
        </Button>
      </DialogActions>
    </Dialog>
  );
};
