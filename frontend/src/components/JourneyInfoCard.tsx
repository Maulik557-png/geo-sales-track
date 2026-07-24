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
  Button,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Navigation as NavigationIcon,
  Place as PlaceIcon,
  AccessTime as TimeIcon,
  AddLocationAlt as AddLocationIcon,
} from '@mui/icons-material';
import { useJourney } from '../contexts/JourneyContext';
import {
  formatCoordinate,
  formatDateTime,
  formatHeading,
  formatSpeed,
  calculateETA,
} from '../utils/formatters';

interface JourneyInfoCardProps {
  onOpenAddCheckpoint?: () => void;
}

export const JourneyInfoCard: React.FC<JourneyInfoCardProps> = ({ onOpenAddCheckpoint }) => {
  const { activeJourney, currentLocation, destination, checkpoints, status } = useJourney();

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Live Telemetry & ETA
          </Typography>
          <Chip
            label={status}
            color={status === 'ACTIVE' ? 'success' : status === 'COMPLETED' ? 'primary' : 'default'}
            size="small"
            sx={{ fontWeight: 700 }}
          />
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {/* Current Realtime Position Panel */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2563eb', mb: 1 }}>
          Current Location at Current Time
        </Typography>

        <Box sx={{ p: 2, borderRadius: 2.5, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', mb: 2.5 }}>
          <GridContainer>
            <InfoItem
              icon={<TimeIcon fontSize="small" color="action" />}
              label="Recorded Time"
              value={formatDateTime(currentLocation?.recordedAt)}
            />
            <InfoItem
              icon={<PlaceIcon fontSize="small" color="primary" />}
              label="Coordinates"
              value={
                currentLocation
                  ? `${formatCoordinate(currentLocation.latitude)}, ${formatCoordinate(currentLocation.longitude)}`
                  : 'N/A'
              }
            />
            <InfoItem
              icon={<SpeedIcon fontSize="small" color="action" />}
              label="Current Speed"
              value={formatSpeed(currentLocation?.speed)}
            />
            <InfoItem
              icon={<NavigationIcon fontSize="small" color="action" />}
              label="Heading"
              value={formatHeading(currentLocation?.heading)}
            />
          </GridContainer>
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
                Distance to Checkpoint
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

        {/* Checkpoint Quick Add Button */}
        {status === 'ACTIVE' && onOpenAddCheckpoint && (
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            startIcon={<AddLocationIcon />}
            onClick={onOpenAddCheckpoint}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5, py: 1.2 }}
          >
            Add Next Checkpoint
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const GridContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>{children}</Box>
);

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    {icon}
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
        {value}
      </Typography>
    </Box>
  </Box>
);
