import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Chip,
  List,
  ListItem,
  CircularProgress,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Navigation as NavigationIcon,
  Place as PlaceIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { Checkpoint, Destination, Journey, LocationPoint } from '../types/journey';
import {
  formatCoordinate,
  formatDateTime,
  formatHeading,
  formatSpeed,
  calculateETA,
} from '../utils/formatters';

import { History as HistoryIcon } from '@mui/icons-material';

interface AdminTelemetryPanelProps {
  journey: Journey | null;
  currentLocation: LocationPoint | null;
  travelledPath: [number, number][];
  destination: Destination | null;
  checkpoints: Checkpoint[];
  wsConnected: boolean;
  onSelectJourneyId: (journeyId: string) => void;
  loadingHistory?: boolean;
  onOpenTimeline?: () => void;
}

export const AdminTelemetryPanel: React.FC<AdminTelemetryPanelProps> = ({
  journey,
  currentLocation,
  destination,
  checkpoints = [],
  wsConnected,
  loadingHistory = false,
  onOpenTimeline,
}) => {
  if (loadingHistory) {
    return (
      <Card elevation={3} sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2, color: '#64748b' }}>
          Loading employee telemetry...
        </Typography>
      </Card>
    );
  }

  if (!journey) {
    return (
      <Card elevation={3} sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>
          Select an Employee to Inspect Live Telemetry & ETA
        </Typography>
      </Card>
    );
  }

  const nextCheckpoint = checkpoints.find((cp) => cp.status === 'PENDING');
  const targetLocation = nextCheckpoint
    ? { name: nextCheckpoint.companyName, latitude: nextCheckpoint.latitude, longitude: nextCheckpoint.longitude }
    : destination
    ? { name: destination.name, latitude: destination.latitude, longitude: destination.longitude }
    : null;

  const { distanceKm, etaText } = calculateETA(
    currentLocation?.latitude,
    currentLocation?.longitude,
    targetLocation?.latitude,
    targetLocation?.longitude,
    currentLocation?.speed
  );

  return (
    <Card elevation={3} sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Inspector & Telemetry
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label={`Emp #${journey.employeeId}`} color="primary" size="small" sx={{ fontWeight: 700 }} />
            {onOpenTimeline && (
              <Chip
                icon={<HistoryIcon />}
                label="Timeline History"
                color="secondary"
                size="small"
                onClick={onOpenTimeline}
                clickable
                sx={{ fontWeight: 700 }}
              />
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {/* Current Realtime Position Panel */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2563eb', mb: 1 }}>
          Current Location at Current Time
        </Typography>

        <Box sx={{ p: 2, borderRadius: 2.5, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', mb: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Recorded Time
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {formatDateTime(currentLocation?.recordedAt)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Current Speed
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {formatSpeed(currentLocation?.speed)}
              </Typography>
            </Box>

            <Box sx={{ gridColumn: 'span 2' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Coordinates
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {currentLocation
                  ? `${formatCoordinate(currentLocation.latitude)}, ${formatCoordinate(currentLocation.longitude)}`
                  : 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Next Checkpoint & ETA Panel */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#7c3aed', mb: 1 }}>
          Next Checkpoint & ETA
        </Typography>

        <Box sx={{ p: 2, borderRadius: 2.5, backgroundColor: '#f3e8ff', border: '1px solid #d8b4fe', mb: 2.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#581c87' }}>
            Target: {targetLocation?.name || 'None Set'}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Distance
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {distanceKm.toFixed(2)} km
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">
                Expected Time to Reach (ETA)
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#7c3aed' }}>
                {etaText}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Checkpoints Status List */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
          Checkpoints ({checkpoints.length})
        </Typography>

        {checkpoints.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            No checkpoints added by employee yet.
          </Typography>
        ) : (
          <List disablePadding sx={{ maxHeight: 200, overflowY: 'auto' }}>
            {checkpoints.map((cp) => (
              <ListItem key={cp.id} sx={{ p: 1, mb: 1, borderRadius: 2, backgroundColor: '#f1f5f9' }}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {cp.companyName}
                    </Typography>
                    <Chip
                      label={cp.status}
                      size="small"
                      color={cp.status === 'VISITED' ? 'success' : 'warning'}
                      sx={{ fontSize: '0.65rem', height: 18 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {cp.address}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};
