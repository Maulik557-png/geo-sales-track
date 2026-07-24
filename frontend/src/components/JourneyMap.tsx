import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Checkpoint, Destination, LocationPoint } from '../types/journey';
import {
  checkpointPendingIcon,
  checkpointVisitedIcon,
  destinationMarkerIcon,
} from '../utils/leafletIcons';
import { AnimatedMarker } from './AnimatedMarker';
import { formatCoordinate, formatDateTime, calculateETA } from '../utils/formatters';

interface JourneyMapProps {
  currentLocation?: LocationPoint | null;
  destination?: Destination | null;
  checkpoints?: Checkpoint[];
  path?: [number, number][];
  height?: string | number;
}

// Controller component to auto-center map bounds dynamically around current location & next checkpoint
const MapBoundsController: React.FC<{
  currentLocation?: LocationPoint | null;
  target?: { latitude: number; longitude: number } | null;
}> = ({ currentLocation, target }) => {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = [];

    if (currentLocation) {
      points.push([currentLocation.latitude, currentLocation.longitude]);
    }
    if (target) {
      points.push([target.latitude, target.longitude]);
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16, animate: true });
    }
  }, [map, currentLocation, target]);

  return null;
};

export const JourneyMap: React.FC<JourneyMapProps> = ({
  currentLocation,
  destination,
  checkpoints = [],
  height = '500px',
}) => {
  // Identify the Next Target Checkpoint (Pending checkpoint or final destination)
  const nextCheckpoint = checkpoints.find((cp) => cp.status === 'PENDING');
  const targetLocation = nextCheckpoint
    ? { name: nextCheckpoint.companyName, latitude: cpLatitude(nextCheckpoint), longitude: cpLongitude(nextCheckpoint) }
    : destination
    ? { name: destination.name, latitude: destination.latitude, longitude: destination.longitude }
    : null;

  function cpLatitude(cp: Checkpoint) {
    return cp.latitude;
  }
  function cpLongitude(cp: Checkpoint) {
    return cp.longitude;
  }

  // Calculate ETA to Next Checkpoint
  const { distanceKm, etaText } = calculateETA(
    currentLocation?.latitude,
    currentLocation?.longitude,
    targetLocation?.latitude,
    targetLocation?.longitude,
    currentLocation?.speed
  );

  // Default Vadodara city coordinates if no location active
  const defaultCenter: [number, number] = currentLocation
    ? [currentLocation.latitude, currentLocation.longitude]
    : targetLocation
    ? [targetLocation.latitude, targetLocation.longitude]
    : [22.307159, 73.181219];

  return (
    <div style={{ height: height, width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Target Next Checkpoint / Destination Marker (Red Pin) */}
        {targetLocation && (
          <Marker
            position={[targetLocation.latitude, targetLocation.longitude]}
            icon={destinationMarkerIcon}
          >
            <Popup>
              <strong>Next Target: {targetLocation.name}</strong>
              <br />
              Distance: {distanceKm.toFixed(2)} km
              <br />
              <strong>Expected Time to Reach (ETA):</strong> {etaText}
            </Popup>
          </Marker>
        )}

        {/* Visited / Pending Checkpoint Markers */}
        {checkpoints.map((cp) => (
          <Marker
            key={cp.id}
            position={[cp.latitude, cp.longitude]}
            icon={cp.status === 'VISITED' ? checkpointVisitedIcon : checkpointPendingIcon}
          >
            <Popup>
              <strong>Checkpoint: {cp.companyName}</strong>
              <br />
              Address: {cp.address}
              <br />
              Purpose: {cp.purpose}
              <br />
              Status: {cp.status}
              <br />
              Created: {formatDateTime(cp.createdAt)}
            </Popup>
          </Marker>
        ))}

        {/* Current Employee Location Marker (Live Time) */}
        {currentLocation && <AnimatedMarker location={currentLocation} />}

        {/* Auto fit bounds around Current Location & Next Checkpoint */}
        <MapBoundsController currentLocation={currentLocation} target={targetLocation} />
      </MapContainer>
    </div>
  );
};
