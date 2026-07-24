package com.salestrack.service;

import com.salestrack.dto.request.UpdateLocationRequest;
import com.salestrack.dto.response.LocationResponse;
import com.salestrack.dto.response.UpdateLocationResponse;

import java.util.List;
import java.util.UUID;

public interface LocationService {
    UpdateLocationResponse recordLocation(UUID journeyId, UpdateLocationRequest request);
    List<LocationResponse> getJourneyLocations(UUID journeyId);
}
