export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
};

export const formatSpeed = (speedInMps: number | null | undefined): string => {
  if (speedInMps == null || isNaN(speedInMps)) return '0.0 km/h';
  const speedInKmh = speedInMps * 3.6;
  return `${speedInKmh.toFixed(1)} km/h`;
};

export const formatHeading = (heading: number | null | undefined): string => {
  if (heading == null || isNaN(heading)) return 'N/A';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(heading / 45) % 8;
  return `${heading.toFixed(0)}° (${directions[index]})`;
};

export const formatDateTime = (isoString?: string | null): string => {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return isoString;
  }
};

export const formatCoordinate = (coord: number | null | undefined): string => {
  if (coord == null || isNaN(coord)) return '0.0000';
  return coord.toFixed(4);
};

// Calculate Haversine distance in km between two lat/lng coordinates
export const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate Estimated Time of Arrival (ETA) to Next Checkpoint / Destination
export const calculateETA = (
  currentLat?: number | null,
  currentLng?: number | null,
  targetLat?: number | null,
  targetLng?: number | null,
  currentSpeedMps?: number | null
): { distanceKm: number; etaText: string } => {
  if (
    currentLat == null ||
    currentLng == null ||
    targetLat == null ||
    targetLng == null
  ) {
    return { distanceKm: 0, etaText: 'N/A' };
  }

  const distanceKm = calculateDistanceKm(currentLat, currentLng, targetLat, targetLng);

  if (distanceKm < 0.05) {
    return { distanceKm: 0, etaText: 'Arriving Now' };
  }

  // Convert speed from m/s to km/h, default to 35 km/h for urban transit if stationary
  const speedKmh = currentSpeedMps && currentSpeedMps > 1 ? currentSpeedMps * 3.6 : 35.0;

  const hours = distanceKm / speedKmh;
  const totalMinutes = Math.max(1, Math.round(hours * 60));

  if (totalMinutes < 60) {
    return { distanceKm, etaText: `~${totalMinutes} mins` };
  }

  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return { distanceKm, etaText: `~${hrs} hr ${mins} mins` };
};
