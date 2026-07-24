package com.salestrack.service;

import com.salestrack.dto.request.UpdateLocationRequest;
import com.salestrack.dto.response.LocationResponse;
import com.salestrack.dto.response.LocationWebSocketMessage;
import com.salestrack.dto.response.UpdateLocationResponse;
import com.salestrack.entity.Journey;
import com.salestrack.entity.JourneyStatus;
import com.salestrack.entity.Location;
import com.salestrack.exception.InvalidJourneyStateException;
import com.salestrack.mapper.LocationMapper;
import com.salestrack.repository.LocationRepository;
import com.salestrack.websocket.WebSocketPublisher;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocationServiceImpl implements LocationService {

    private final LocationRepository locationRepository;
    private final JourneyService journeyService;
    private final LocationMapper locationMapper;
    private final WebSocketPublisher webSocketPublisher;

    @Override
    @Transactional
    public UpdateLocationResponse recordLocation(UUID journeyId, UpdateLocationRequest request) {
        Journey journey = journeyService.findJourneyById(journeyId);
        if (journey.getStatus() != JourneyStatus.ACTIVE) {
            throw new InvalidJourneyStateException("Cannot record location for journey with status: " + journey.getStatus());
        }

        Location location = locationMapper.toEntity(journeyId, request);
        Location savedLocation = locationRepository.save(location);

        LocationWebSocketMessage wsMessage = locationMapper.toWebSocketMessage(journey.getEmployeeId(), savedLocation);
        webSocketPublisher.publishLocationUpdate(wsMessage);

        return UpdateLocationResponse.builder()
                .received(true)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationResponse> getJourneyLocations(UUID journeyId) {
        // Ensures journey exists or throws ResourceNotFoundException
        journeyService.findJourneyById(journeyId);

        List<Location> locations = locationRepository.findByJourneyIdOrderByRecordedAtAsc(journeyId);
        return locations.stream()
                .map(locationMapper::toResponse)
                .collect(Collectors.toList());
    }
}
