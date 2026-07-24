package com.salestrack.service;

import com.salestrack.dto.request.StartJourneyRequest;
import com.salestrack.dto.response.CompleteJourneyResponse;
import com.salestrack.dto.response.JourneyDetailsResponse;
import com.salestrack.dto.response.StartJourneyResponse;
import com.salestrack.entity.Journey;

import java.util.List;
import java.util.UUID;

public interface JourneyService {
    StartJourneyResponse startJourney(StartJourneyRequest request);
    CompleteJourneyResponse completeJourney(UUID journeyId);
    JourneyDetailsResponse getJourneyDetails(UUID journeyId);
    List<JourneyDetailsResponse> getActiveJourneys();
    List<JourneyDetailsResponse> getAllJourneys();
    Journey findJourneyById(UUID journeyId);
}
