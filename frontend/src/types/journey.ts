export type JourneyStatus = 'ACTIVE' | 'COMPLETED';

export type CheckpointStatus = 'PENDING' | 'VISITED' | 'SKIPPED';

export interface Destination {
  name: string;
  latitude: number;
  longitude: number;
}

export interface Journey {
  journeyId: string;
  employeeId: number;
  status: JourneyStatus;
  destination: Destination;
  startedAt: string;
  endedAt: string | null;
}

export interface LocationPoint {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number;
  heading?: number | null;
  recordedAt: string;
}

export interface Checkpoint {
  id: number;
  journeyId: string;
  companyName: string;
  address: string;
  purpose: string;
  latitude: number;
  longitude: number;
  status: CheckpointStatus;
  createdAt: string;
  visitedAt?: string | null;
}

export interface CreateCheckpointRequest {
  companyName: string;
  address: string;
  purpose: string;
  latitude: number;
  longitude: number;
}

export interface CheckpointWebSocketMessage {
  journeyId: string;
  checkpointId: number;
  companyName: string;
  address: string;
  purpose: string;
  latitude: number;
  longitude: number;
  status: CheckpointStatus;
  eventType: string;
  timestamp: string;
}

export interface StartJourneyRequest {
  employeeId: number;
  destination: Destination;
}

export interface StartJourneyResponse {
  journeyId: string;
  status: JourneyStatus;
  startedAt: string;
}

export interface UpdateLocationRequest {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number;
  heading?: number | null;
  recordedAt?: string;
}

export interface UpdateLocationResponse {
  received: boolean;
}

export interface LocationWebSocketMessage {
  journeyId: string;
  employeeId: number;
  latitude: number;
  longitude: number;
  speed: number;
  heading?: number | null;
  recordedAt: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  path: string;
}
