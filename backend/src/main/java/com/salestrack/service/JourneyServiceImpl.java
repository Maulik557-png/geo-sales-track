package com.salestrack.service;

import com.salestrack.dto.request.StartJourneyRequest;
import com.salestrack.dto.response.CompleteJourneyResponse;
import com.salestrack.dto.response.JourneyDetailsResponse;
import com.salestrack.dto.response.StartJourneyResponse;
import com.salestrack.entity.Journey;
import com.salestrack.entity.JourneyStatus;
import com.salestrack.exception.InvalidJourneyStateException;
import com.salestrack.exception.ResourceNotFoundException;
import com.salestrack.mapper.JourneyMapper;
import com.salestrack.repository.JourneyRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JourneyServiceImpl implements JourneyService {

    private final JourneyRepository journeyRepository;
    private final JourneyMapper journeyMapper;

    @Override
    @Transactional
    public StartJourneyResponse startJourney(StartJourneyRequest request) {
        Journey journey = journeyMapper.toEntity(request);
        Journey savedJourney = journeyRepository.save(journey);
        return journeyMapper.toStartJourneyResponse(savedJourney);
    }

    @Override
    @Transactional
    public CompleteJourneyResponse completeJourney(UUID journeyId) {
        Journey journey = findJourneyById(journeyId);
        if (journey.getStatus() == JourneyStatus.COMPLETED) {
            throw new InvalidJourneyStateException("Journey is already COMPLETED with id: " + journeyId);
        }
        journey.setStatus(JourneyStatus.COMPLETED);
        journey.setEndedAt(Instant.now());
        Journey updatedJourney = journeyRepository.save(journey);

        return CompleteJourneyResponse.builder()
                .journeyId(updatedJourney.getId())
                .status(updatedJourney.getStatus())
                .endedAt(updatedJourney.getEndedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public JourneyDetailsResponse getJourneyDetails(UUID journeyId) {
        Journey journey = findJourneyById(journeyId);
        return journeyMapper.toJourneyDetailsResponse(journey);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JourneyDetailsResponse> getActiveJourneys() {
        return journeyRepository.findByStatus(JourneyStatus.ACTIVE).stream()
                .map(journeyMapper::toJourneyDetailsResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JourneyDetailsResponse> getAllJourneys() {
        return journeyRepository.findAll().stream()
                .map(journeyMapper::toJourneyDetailsResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Journey findJourneyById(UUID journeyId) {
        return journeyRepository.findById(journeyId)
                .orElseThrow(() -> new ResourceNotFoundException("Journey not found with id: " + journeyId));
    }
}
