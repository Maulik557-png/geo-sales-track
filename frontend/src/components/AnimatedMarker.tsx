import React, { useEffect, useRef, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { createGoogleNavigationArrowIcon } from '../utils/leafletIcons';
import { formatCoordinate, formatSpeed, formatHeading, formatDateTime } from '../utils/formatters';
import { LocationPoint } from '../types/journey';

interface AnimatedMarkerProps {
  location: LocationPoint;
}

export const AnimatedMarker: React.FC<AnimatedMarkerProps> = ({ location }) => {
  const [currentPos, setCurrentPos] = useState<[number, number]>([
    location.latitude,
    location.longitude,
  ]);

  const prevPosRef = useRef<[number, number]>([location.latitude, location.longitude]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const startPos = prevPosRef.current;
    const targetPos: [number, number] = [location.latitude, location.longitude];

    // If positions are identical or initial render, set directly
    if (startPos[0] === targetPos[0] && startPos[1] === targetPos[1]) {
      setCurrentPos(targetPos);
      return;
    }

    const startTime = performance.now();
    const duration = 1000; // 1-second smooth glide animation

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1.0);

      // Smooth ease-out quadratic formula
      const easeProgress = 1 - Math.pow(1 - progress, 2);

      const lat = startPos[0] + (targetPos[0] - startPos[0]) * easeProgress;
      const lng = startPos[1] + (targetPos[1] - startPos[1]) * easeProgress;

      setCurrentPos([lat, lng]);

      if (progress < 1.0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        prevPosRef.current = targetPos;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [location.latitude, location.longitude]);

  const googleArrowIcon = createGoogleNavigationArrowIcon(location.heading || 0);

  return (
    <Marker position={currentPos} icon={googleArrowIcon}>
      <Popup>
        <strong>📍 Live Google-Style Navigation Position</strong>
        <br />
        Speed: {formatSpeed(location.speed)}
        <br />
        Heading: {formatHeading(location.heading)}
        <br />
        Updated: {formatDateTime(location.recordedAt)}
        <br />
        Coordinates: {formatCoordinate(currentPos[0])},{' '}
        {formatCoordinate(currentPos[1])}
      </Popup>
    </Marker>
  );
};
