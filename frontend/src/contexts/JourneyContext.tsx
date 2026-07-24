import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Checkpoint, Destination, Journey, JourneyStatus, LocationPoint } from '../types/journey';

interface JourneyContextType {
  activeJourney: Journey | null;
  currentLocation: LocationPoint | null;
  travelledPath: [number, number][];
  destination: Destination | null;
  checkpoints: Checkpoint[];
  status: JourneyStatus | null;
  isTracking: boolean;
  isSimulationMode: boolean;

  setActiveJourney: (journey: Journey | null) => void;
  setCurrentLocation: (location: LocationPoint | null) => void;
  setTravelledPath: (path: [number, number][]) => void;
  addLocationPoint: (point: LocationPoint) => void;
  setDestination: (dest: Destination | null) => void;
  setCheckpoints: (checkpoints: Checkpoint[]) => void;
  addCheckpoint: (checkpoint: Checkpoint) => void;
  updateCheckpointStatus: (checkpointId: number, status: 'VISITED' | 'SKIPPED') => void;
  setStatus: (status: JourneyStatus | null) => void;
  setIsTracking: (tracking: boolean) => void;
  setIsSimulationMode: (sim: boolean) => void;
  resetJourney: () => void;
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

export const JourneyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const [travelledPath, setTravelledPath] = useState<[number, number][]>([]);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [status, setStatus] = useState<JourneyStatus | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);

  const addLocationPoint = (point: LocationPoint) => {
    setCurrentLocation(point);
    setTravelledPath((prev) => [...prev, [point.latitude, point.longitude]]);
  };

  const addCheckpoint = (checkpoint: Checkpoint) => {
    setCheckpoints((prev) => [...prev, checkpoint]);
  };

  const updateCheckpointStatus = (checkpointId: number, newStatus: 'VISITED' | 'SKIPPED') => {
    setCheckpoints((prev) =>
      prev.map((c) => (c.id === checkpointId ? { ...c, status: newStatus } : c))
    );
  };

  const resetJourney = () => {
    setActiveJourney(null);
    setCurrentLocation(null);
    setTravelledPath([]);
    setDestination(null);
    setCheckpoints([]);
    setStatus(null);
    setIsTracking(false);
  };

  return (
    <JourneyContext.Provider
      value={{
        activeJourney,
        currentLocation,
        travelledPath,
        destination,
        checkpoints,
        status,
        isTracking,
        isSimulationMode,
        setActiveJourney,
        setCurrentLocation,
        setTravelledPath,
        addLocationPoint,
        setDestination,
        setCheckpoints,
        addCheckpoint,
        updateCheckpointStatus,
        setStatus,
        setIsTracking,
        setIsSimulationMode,
        resetJourney,
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
};

export const useJourney = (): JourneyContextType => {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
};
