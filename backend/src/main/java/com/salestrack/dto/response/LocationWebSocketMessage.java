package com.salestrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationWebSocketMessage {

    private UUID journeyId;
    private Long employeeId;
    private Double latitude;
    private Double longitude;
    private Double speed;
    private Double heading;
    private Instant recordedAt;
}
