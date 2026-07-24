package com.salestrack.service;

import com.salestrack.dto.request.CreateCheckpointRequest;
import com.salestrack.dto.response.CheckpointResponse;

import java.util.List;
import java.util.UUID;

public interface CheckpointService {
    CheckpointResponse addCheckpoint(UUID journeyId, CreateCheckpointRequest request);
    List<CheckpointResponse> getJourneyCheckpoints(UUID journeyId);
    CheckpointResponse markCheckpointVisited(UUID journeyId, Long checkpointId);
}
