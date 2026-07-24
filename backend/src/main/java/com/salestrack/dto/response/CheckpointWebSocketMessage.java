package com.salestrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

import com.salestrack.entity.CheckpointStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckpointWebSocketMessage {

    private UUID journeyId;
    private Long checkpointId;
    private String companyName;
    private String address;
    private String purpose;
    private Double latitude;
    private Double longitude;
    private CheckpointStatus status;
    private String eventType; // "CREATED" or "VISITED"
    private Instant timestamp;
}
