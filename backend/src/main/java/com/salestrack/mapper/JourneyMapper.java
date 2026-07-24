package com.salestrack.mapper;

import com.salestrack.dto.request.DestinationDto;
import com.salestrack.dto.request.StartJourneyRequest;
import com.salestrack.dto.response.JourneyDetailsResponse;
import com.salestrack.dto.response.StartJourneyResponse;
import com.salestrack.entity.Journey;
import com.salestrack.entity.JourneyStatus;

import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class JourneyMapper {

    public Journey toEntity(StartJourneyRequest request) {
        return Journey.builder()
                .employeeId(request.getEmployeeId())
                .destinationName(request.getDestination().getName())
                .destinationLatitude(request.getDestination().getLatitude())
                .destinationLongitude(request.getDestination().getLongitude())
                .status(JourneyStatus.ACTIVE)
                .startedAt(Instant.now())
                .build();
    }

    public StartJourneyResponse toStartJourneyResponse(Journey journey) {
        return StartJourneyResponse.builder()
                .journeyId(journey.getId())
                .status(journey.getStatus())
                .startedAt(journey.getStartedAt())
                .build();
    }

    public JourneyDetailsResponse toJourneyDetailsResponse(Journey journey) {
        DestinationDto destination = DestinationDto.builder()
                .name(journey.getDestinationName())
                .latitude(journey.getDestinationLatitude())
                .longitude(journey.getDestinationLongitude())
                .build();

        return JourneyDetailsResponse.builder()
                .journeyId(journey.getId())
                .employeeId(journey.getEmployeeId())
                .status(journey.getStatus())
                .destination(destination)
                .startedAt(journey.getStartedAt())
                .endedAt(journey.getEndedAt())
                .build();
    }
}
