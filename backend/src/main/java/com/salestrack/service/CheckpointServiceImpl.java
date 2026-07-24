package com.salestrack.service;

import com.salestrack.dto.request.CreateCheckpointRequest;
import com.salestrack.dto.response.CheckpointResponse;
import com.salestrack.dto.response.CheckpointWebSocketMessage;
import com.salestrack.entity.Checkpoint;
import com.salestrack.entity.CheckpointStatus;
import com.salestrack.entity.Journey;
import com.salestrack.entity.JourneyStatus;
import com.salestrack.exception.InvalidJourneyStateException;
import com.salestrack.exception.ResourceNotFoundException;
import com.salestrack.mapper.CheckpointMapper;
import com.salestrack.repository.CheckpointRepository;
import com.salestrack.websocket.WebSocketPublisher;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CheckpointServiceImpl implements CheckpointService {

    private final CheckpointRepository checkpointRepository;
    private final JourneyService journeyService;
    private final CheckpointMapper checkpointMapper;
    private final WebSocketPublisher webSocketPublisher;

    @Override
    @Transactional
    public CheckpointResponse addCheckpoint(UUID journeyId, CreateCheckpointRequest request) {
        Journey journey = journeyService.findJourneyById(journeyId);
        if (journey.getStatus() != JourneyStatus.ACTIVE) {
            throw new InvalidJourneyStateException("Cannot add checkpoint for journey with status: " + journey.getStatus());
        }

        Checkpoint checkpoint = checkpointMapper.toEntity(journeyId, request);
        Checkpoint savedCheckpoint = checkpointRepository.save(checkpoint);

        // Publish to WebSocket
        CheckpointWebSocketMessage wsMessage = checkpointMapper.toWebSocketMessage(savedCheckpoint, "CREATED");
        webSocketPublisher.publishCheckpointUpdate(wsMessage);

        return checkpointMapper.toResponse(savedCheckpoint);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CheckpointResponse> getJourneyCheckpoints(UUID journeyId) {
        journeyService.findJourneyById(journeyId);
        List<Checkpoint> checkpoints = checkpointRepository.findByJourneyIdOrderByCreatedAtAsc(journeyId);
        return checkpoints.stream()
                .map(checkpointMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CheckpointResponse markCheckpointVisited(UUID journeyId, Long checkpointId) {
        journeyService.findJourneyById(journeyId);
        Checkpoint checkpoint = checkpointRepository.findById(checkpointId)
                .orElseThrow(() -> new ResourceNotFoundException("Checkpoint not found with id: " + checkpointId));

        if (!checkpoint.getJourneyId().equals(journeyId)) {
            throw new InvalidJourneyStateException("Checkpoint does not belong to journey: " + journeyId);
        }

        checkpoint.setStatus(CheckpointStatus.VISITED);
        checkpoint.setVisitedAt(Instant.now());
        Checkpoint updated = checkpointRepository.save(checkpoint);

        // Publish to WebSocket
        CheckpointWebSocketMessage wsMessage = checkpointMapper.toWebSocketMessage(updated, "VISITED");
        webSocketPublisher.publishCheckpointUpdate(wsMessage);

        return checkpointMapper.toResponse(updated);
    }
}
