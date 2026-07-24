package com.salestrack.dto.response;

import com.salestrack.dto.request.DestinationDto;
import com.salestrack.entity.JourneyStatus;

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
public class JourneyDetailsResponse {

    private UUID journeyId;
    private Long employeeId;
    private JourneyStatus status;
    private DestinationDto destination;
    private Instant startedAt;
    private Instant endedAt;
}
