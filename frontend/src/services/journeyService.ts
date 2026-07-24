import apiClient from './apiClient';
import {
  Checkpoint,
  CreateCheckpointRequest,
  Journey,
  JourneyStatus,
  LocationPoint,
  StartJourneyRequest,
  StartJourneyResponse,
  UpdateLocationRequest,
  UpdateLocationResponse,
} from '../types/journey';

export const journeyService = {
  async startJourney(request: StartJourneyRequest): Promise<StartJourneyResponse> {
    const response = await apiClient.post<StartJourneyResponse>('/journeys', request);
    return response.data;
  },

  async getActiveJourneys(): Promise<Journey[]> {
    const response = await apiClient.get<Journey[]>('/journeys/active');
    return response.data;
  },

  async getAllJourneys(): Promise<Journey[]> {
    const response = await apiClient.get<Journey[]>('/journeys');
    return response.data;
  },

  async updateLocation(
    journeyId: string,
    request: UpdateLocationRequest
  ): Promise<UpdateLocationResponse> {
    const response = await apiClient.post<UpdateLocationResponse>(
      `/journeys/${journeyId}/locations`,
      request
    );
    return response.data;
  },

  async completeJourney(journeyId: string): Promise<{ journeyId: string; status: JourneyStatus; endedAt: string }> {
    const response = await apiClient.patch<{ journeyId: string; status: JourneyStatus; endedAt: string }>(`/journeys/${journeyId}/complete`);
    return response.data;
  },

  async getJourney(journeyId: string): Promise<Journey> {
    const response = await apiClient.get<Journey>(`/journeys/${journeyId}`);
    return response.data;
  },

  async getJourneyLocations(journeyId: string): Promise<LocationPoint[]> {
    const response = await apiClient.get<LocationPoint[]>(`/journeys/${journeyId}/locations`);
    return response.data;
  },

  async addCheckpoint(
    journeyId: string,
    request: CreateCheckpointRequest
  ): Promise<Checkpoint> {
    const response = await apiClient.post<Checkpoint>(
      `/journeys/${journeyId}/checkpoints`,
      request
    );
    return response.data;
  },

  async getJourneyCheckpoints(journeyId: string): Promise<Checkpoint[]> {
    const response = await apiClient.get<Checkpoint[]>(
      `/journeys/${journeyId}/checkpoints`
    );
    return response.data;
  },

  async markCheckpointVisited(
    journeyId: string,
    checkpointId: number
  ): Promise<Checkpoint> {
    const response = await apiClient.patch<Checkpoint>(
      `/journeys/${journeyId}/checkpoints/${checkpointId}/visit`
    );
    return response.data;
  },
};
