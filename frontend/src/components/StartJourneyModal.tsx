import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Place as PlaceIcon } from '@mui/icons-material';
import { StartJourneyRequest } from '../types/journey';
import { geocodeCityOrAddress } from '../utils/geocoding';
import { useSnackbar } from 'notistack';

interface StartJourneyModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (request: StartJourneyRequest, isSimulation: boolean) => Promise<void>;
  loading?: boolean;
}

export const StartJourneyModal: React.FC<StartJourneyModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [employeeId, setEmployeeId] = useState<number>(101);
  const [destinationName, setDestinationName] = useState<string>('');
  const [isSimulation, setIsSimulation] = useState<boolean>(false);
  const [geocoding, setGeocoding] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const savedId = localStorage.getItem('emgage_emp_id');
    if (savedId) {
      setEmployeeId(Number(savedId));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeocoding(true);

    try {
      // Automatically resolve City / Address name to latitude & longitude
      const geoResult = await geocodeCityOrAddress(destinationName);

      const req: StartJourneyRequest = {
        employeeId: Number(employeeId),
        destination: {
          name: destinationName,
          latitude: geoResult.latitude,
          longitude: geoResult.longitude,
        },
      };

      await onSubmit(req, isSimulation);
    } catch (err: unknown) {
      console.error('Geocoding error:', err);
      enqueueSnackbar('Failed to resolve city location.', { variant: 'error' });
    } finally {
      setGeocoding(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
          <PlaceIcon color="primary" />
          Start New Employee Journey
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField
              label="Employee ID"
              type="number"
              value={employeeId}
              onChange={(e) => setEmployeeId(Number(e.target.value))}
              required
              fullWidth
              variant="outlined"
            />

            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#475569', mt: 1 }}>
              Target Destination Location
            </Typography>

            <TextField
              label="City or Address Name"
              value={destinationName}
              onChange={(e) => setDestinationName(e.target.value)}
              required
              fullWidth
              variant="outlined"
              placeholder="e.g. Vadodara, Mumbai, Ahmedabad, or Client Office"
              helperText="Type any city or place name. Coordinates are geocoded automatically."
            />

            <Divider />

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  GPS Simulation Mode
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Simulates motion every 5s towards destination (Ideal for testing)
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={isSimulation}
                    onChange={(e) => setIsSimulation(e.target.checked)}
                    color="primary"
                  />
                }
                label={isSimulation ? 'Simulated' : 'Browser GPS'}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading || geocoding} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || geocoding}
            startIcon={(loading || geocoding) && <CircularProgress size={16} color="inherit" />}
            sx={{ textTransform: 'none', fontWeight: 600, px: 3 }}
          >
            {geocoding ? 'Resolving City...' : loading ? 'Starting...' : 'Start Journey'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
