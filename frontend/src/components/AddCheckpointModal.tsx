import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { CreateCheckpointRequest, LocationPoint } from '../types/journey';
import { geocodeCityOrAddress } from '../utils/geocoding';

interface AddCheckpointModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (request: CreateCheckpointRequest) => Promise<void>;
  currentLocation: LocationPoint | null;
  loading?: boolean;
}

export const AddCheckpointModal: React.FC<AddCheckpointModalProps> = ({
  open,
  onClose,
  onSubmit,
  currentLocation,
  loading = false,
}) => {
  const [companyName, setCompanyName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [geocoding, setGeocoding] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeocoding(true);

    try {
      let lat = currentLocation?.latitude;
      let lng = currentLocation?.longitude;

      // If current GPS location isn't available, automatically geocode the address
      if (!lat || !lng) {
        const geoResult = await geocodeCityOrAddress(address);
        lat = geoResult.latitude;
        lng = geoResult.longitude;
      }

      const req: CreateCheckpointRequest = {
        companyName,
        address,
        purpose,
        latitude: lat,
        longitude: lng,
      };
      await onSubmit(req);

      setCompanyName('');
      setAddress('');
      setPurpose('');
    } catch (err: unknown) {
      console.error('Error submitting checkpoint:', err);
    } finally {
      setGeocoding(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationIcon color="primary" />
          Add Client Checkpoint
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {currentLocation ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: 2, backgroundColor: '#f1f5f9' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  GPS Location Fetched
                </Typography>
                <Chip
                  label={`${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`}
                  size="small"
                  color="success"
                />
              </Box>
            ) : (
              <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#eff6ff' }}>
                <Typography variant="caption" color="primary">
                  Auto-Geocoding enabled: Coordinates will be resolved automatically from your Address / City input.
                </Typography>
              </Box>
            )}

            <TextField
              label="Company / Client Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              fullWidth
              variant="outlined"
              placeholder="e.g. Reliance Retail Corp"
            />

            <TextField
              label="Address / City Location"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              fullWidth
              variant="outlined"
              placeholder="e.g. 102 Crystal Plaza, Alkapuri, Vadodara"
            />

            <TextField
              label="Purpose of Visit"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              placeholder="e.g. Product Demo & Contract Signing"
            />
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
            {geocoding ? 'Saving Checkpoint...' : loading ? 'Adding...' : 'Add Checkpoint'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
