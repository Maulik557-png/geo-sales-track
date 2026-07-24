package com.salestrack.mapper;

import com.salestrack.dto.request.UpdateLocationRequest;
import com.salestrack.dto.response.LocationResponse;
import com.salestrack.dto.response.LocationWebSocketMessage;
import com.salestrack.entity.Location;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

@Component
public class LocationMapper {

    public Location toEntity(UUID journeyId, UpdateLocationRequest request) {
        return Location.builder()
                .journeyId(journeyId)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .accuracy(request.getAccuracy())
                .speed(request.getSpeed())
                .heading(request.getHeading())
                .recordedAt(request.getRecordedAt() != null ? request.getRecordedAt() : Instant.now())
                .build();
    }

    public LocationResponse toResponse(Location location) {
        return LocationResponse.builder()
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .accuracy(location.getAccuracy())
                .speed(location.getSpeed())
                .heading(location.getHeading())
                .recordedAt(location.getRecordedAt())
                .build();
    }

    public LocationWebSocketMessage toWebSocketMessage(Long employeeId, Location location) {
        return LocationWebSocketMessage.builder()
                .journeyId(location.getJourneyId())
                .employeeId(employeeId)
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .speed(location.getSpeed())
                .heading(location.getHeading())
                .recordedAt(location.getRecordedAt())
                .build();
    }
}
