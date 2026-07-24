package com.salestrack.mapper;

import com.salestrack.dto.request.CreateCheckpointRequest;
import com.salestrack.dto.response.CheckpointResponse;
import com.salestrack.dto.response.CheckpointWebSocketMessage;
import com.salestrack.entity.Checkpoint;
import com.salestrack.entity.CheckpointStatus;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

@Component
public class CheckpointMapper {

    public Checkpoint toEntity(UUID journeyId, CreateCheckpointRequest request) {
        return Checkpoint.builder()
                .journeyId(journeyId)
                .companyName(request.getCompanyName())
                .address(request.getAddress())
                .purpose(request.getPurpose())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .status(CheckpointStatus.PENDING)
                .createdAt(Instant.now())
                .build();
    }

    public CheckpointResponse toResponse(Checkpoint checkpoint) {
        return CheckpointResponse.builder()
                .id(checkpoint.getId())
                .journeyId(checkpoint.getJourneyId())
                .companyName(checkpoint.getCompanyName())
                .address(checkpoint.getAddress())
                .purpose(checkpoint.getPurpose())
                .latitude(checkpoint.getLatitude())
                .longitude(checkpoint.getLongitude())
                .status(checkpoint.getStatus())
                .createdAt(checkpoint.getCreatedAt())
                .visitedAt(checkpoint.getVisitedAt())
                .build();
    }

    public CheckpointWebSocketMessage toWebSocketMessage(Checkpoint checkpoint, String eventType) {
        return CheckpointWebSocketMessage.builder()
                .journeyId(checkpoint.getJourneyId())
                .checkpointId(checkpoint.getId())
                .companyName(checkpoint.getCompanyName())
                .address(checkpoint.getAddress())
                .purpose(checkpoint.getPurpose())
                .latitude(checkpoint.getLatitude())
                .longitude(checkpoint.getLongitude())
                .status(checkpoint.getStatus())
                .eventType(eventType)
                .timestamp(Instant.now())
                .build();
    }
}
