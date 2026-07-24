import { useEffect, useRef, useCallback } from 'react';
import { useJourney } from '../contexts/JourneyContext';
import { journeyService } from '../services/journeyService';
import { LocationPoint, UpdateLocationRequest } from '../types/journey';
import { useSnackbar } from 'notistack';

export const useTracking = () => {
  const {
    activeJourney,
    currentLocation,
    isTracking,
    isSimulationMode,
    addLocationPoint,
    setCurrentLocation,
  } = useJourney();
  const { enqueueSnackbar } = useSnackbar();

  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastLocationRef = useRef<LocationPoint | null>(null);

  // Default start origin coordinate (Vadodara center)
  const simStepRef = useRef<number>(0);
  const startLat = currentLocation?.latitude ?? (activeJourney ? activeJourney.destination.latitude - 0.02 : 22.290000);
  const startLng = currentLocation?.longitude ?? (activeJourney ? activeJourney.destination.longitude - 0.02 : 73.160000);

  const sendLocationUpdate = useCallback(
    async (lat: number, lng: number, speed: number = 32.5, heading: number = 180.0, accuracy: number = 5.0) => {
      if (!activeJourney || activeJourney.status !== 'ACTIVE') return;

      const recordedAt = new Date().toISOString();
      const req: UpdateLocationRequest = {
        latitude: parseFloat(lat.toFixed(6)),
        longitude: parseFloat(lng.toFixed(6)),
        accuracy,
        speed,
        heading,
        recordedAt,
      };

      const locPoint: LocationPoint = {
        latitude: req.latitude,
        longitude: req.longitude,
        accuracy: req.accuracy,
        speed: req.speed,
        heading: req.heading,
        recordedAt: req.recordedAt!,
      };

      try {
        await journeyService.updateLocation(activeJourney.journeyId, req);
        addLocationPoint(locPoint);
        lastLocationRef.current = locPoint;
      } catch (err: unknown) {
        console.error('Failed to post location update:', err);
        enqueueSnackbar('Failed to send location update to server', { variant: 'error' });
      }
    },
    [activeJourney, addLocationPoint, enqueueSnackbar]
  );

  // Simulation mode logic: step linearly towards destination every 5s
  const simulateStep = useCallback(() => {
    if (!activeJourney) return;

    simStepRef.current += 1;
    const steps = 30; // 30 steps total
    const progress = Math.min(simStepRef.current / steps, 1.0);

    const destLat = activeJourney.destination.latitude;
    const destLng = activeJourney.destination.longitude;

    // Add slight natural jitter to simulation coordinates
    const jitterLat = (Math.random() - 0.5) * 0.0003;
    const jitterLng = (Math.random() - 0.5) * 0.0003;

    const currentLat = startLat + (destLat - startLat) * progress + jitterLat;
    const currentLng = startLng + (destLng - startLng) * progress + jitterLng;

    const speed = progress < 1.0 ? 30 + Math.random() * 15 : 0;
    const heading = Math.atan2(destLng - startLng, destLat - startLat) * (180 / Math.PI);

    sendLocationUpdate(currentLat, currentLng, speed, heading);
  }, [activeJourney, sendLocationUpdate, startLat, startLng]);

  useEffect(() => {
    if (!isTracking || !activeJourney || activeJourney.status !== 'ACTIVE') {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      return;
    }

    if (isSimulationMode) {
      // Send initial position immediately
      simulateStep();
      // Repeat every 5 seconds as specified
      intervalIdRef.current = setInterval(() => {
        simulateStep();
      }, 5000);
    } else {
      // Real Geolocation Mode (High accuracy GPS)
      if ('geolocation' in navigator) {
        const handlePosition = (pos: GeolocationPosition) => {
          const { latitude, longitude, speed, heading, accuracy } = pos.coords;
          const locPoint: LocationPoint = {
            latitude,
            longitude,
            accuracy: accuracy || 5.0,
            speed: speed ? speed * 3.6 : 0, // m/s to km/h
            heading: heading || 0,
            recordedAt: new Date(pos.timestamp).toISOString(),
          };
          setCurrentLocation(locPoint);
          lastLocationRef.current = locPoint;
          sendLocationUpdate(latitude, longitude, locPoint.speed, locPoint.heading ?? 0, locPoint.accuracy);
        };

        // Immediately request current high-accuracy position
        navigator.geolocation.getCurrentPosition(
          handlePosition,
          (err) => console.warn('Initial GPS fetch notice:', err),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        // Continuous watch for real GPS updates
        watchIdRef.current = navigator.geolocation.watchPosition(
          handlePosition,
          (err) => {
            console.error('Geolocation permission error:', err);
            enqueueSnackbar('Location permission denied or unavailable', { variant: 'warning' });
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        // Push location every 5 seconds to backend
        intervalIdRef.current = setInterval(() => {
          if (lastLocationRef.current) {
            const loc = lastLocationRef.current;
            sendLocationUpdate(loc.latitude, loc.longitude, loc.speed, loc.heading || 0, loc.accuracy);
          }
        }, 5000);
      } else {
        enqueueSnackbar('Browser Geolocation is not supported by your browser', { variant: 'error' });
      }
    }

    return () => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isTracking, activeJourney, isSimulationMode, simulateStep, setCurrentLocation, sendLocationUpdate, enqueueSnackbar]);

  return {
    isTracking,
    sendLocationUpdate,
  };
};
