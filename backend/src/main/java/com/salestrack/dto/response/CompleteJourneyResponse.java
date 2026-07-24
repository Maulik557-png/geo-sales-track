package com.salestrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

import com.salestrack.entity.JourneyStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompleteJourneyResponse {

    private UUID journeyId;
    private JourneyStatus status;
    private Instant endedAt;
}
