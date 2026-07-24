package com.salestrack.controller;

import com.salestrack.dto.request.StartJourneyRequest;
import com.salestrack.dto.request.UpdateLocationRequest;
import com.salestrack.dto.response.CompleteJourneyResponse;
import com.salestrack.dto.response.JourneyDetailsResponse;
import com.salestrack.dto.response.LocationResponse;
import com.salestrack.dto.response.StartJourneyResponse;
import com.salestrack.dto.response.UpdateLocationResponse;
import com.salestrack.service.CheckpointService;
import com.salestrack.service.JourneyService;
import com.salestrack.service.LocationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/journeys")
@RequiredArgsConstructor
@Tag(name = "Journey & Location Management", description = "APIs for tracking employee journeys and recording real-time GPS locations")
public class JourneyController {

    private final JourneyService journeyService;
    private final LocationService locationService;
    private final CheckpointService checkpointService;

    @PostMapping
    @Operation(summary = "Start a new journey", description = "Creates a new journey with ACTIVE status and destination details")
    public ResponseEntity<StartJourneyResponse> startJourney(@Valid @RequestBody StartJourneyRequest request) {
        StartJourneyResponse response = journeyService.startJourney(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/active")
    @Operation(summary = "Get active journeys", description = "Retrieves all currently active employee journeys for live monitoring")
    public ResponseEntity<List<JourneyDetailsResponse>> getActiveJourneys() {
        List<JourneyDetailsResponse> activeJourneys = journeyService.getActiveJourneys();
        return ResponseEntity.ok(activeJourneys);
    }

    @GetMapping
    @Operation(summary = "Get all journeys", description = "Retrieves all recorded journeys regardless of status")
    public ResponseEntity<List<JourneyDetailsResponse>> getAllJourneys() {
        List<JourneyDetailsResponse> journeys = journeyService.getAllJourneys();
        return ResponseEntity.ok(journeys);
    }

    @PostMapping("/{journeyId}/locations")
    @Operation(summary = "Update location", description = "Saves GPS location for an active journey and broadcasts it via WebSocket")
    public ResponseEntity<UpdateLocationResponse> updateLocation(
            @PathVariable UUID journeyId,
            @Valid @RequestBody UpdateLocationRequest request) {
        UpdateLocationResponse response = locationService.recordLocation(journeyId, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{journeyId}/complete")
    @Operation(summary = "Complete journey", description = "Marks an active journey as COMPLETED and sets the end timestamp")
    public ResponseEntity<CompleteJourneyResponse> completeJourney(@PathVariable UUID journeyId) {
        CompleteJourneyResponse response = journeyService.completeJourney(journeyId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{journeyId}")
    @Operation(summary = "Get journey details", description = "Retrieves information and status for a specific journey")
    public ResponseEntity<JourneyDetailsResponse> getJourneyDetails(@PathVariable UUID journeyId) {
        JourneyDetailsResponse response = journeyService.getJourneyDetails(journeyId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{journeyId}/locations")
    @Operation(summary = "Get journey locations", description = "Retrieves all recorded location points for a journey ordered by recordedAt ascending")
    public ResponseEntity<List<LocationResponse>> getJourneyLocations(@PathVariable UUID journeyId) {
        List<LocationResponse> locations = locationService.getJourneyLocations(journeyId);
        return ResponseEntity.ok(locations);
    }

    @PostMapping("/{journeyId}/checkpoints")
    @Operation(summary = "Add checkpoint", description = "Adds a visit checkpoint with company name, address, and purpose for an active journey")
    public ResponseEntity<com.salestrack.dto.response.CheckpointResponse> addCheckpoint(
            @PathVariable UUID journeyId,
            @Valid @RequestBody com.salestrack.dto.request.CreateCheckpointRequest request) {
        com.salestrack.dto.response.CheckpointResponse response = checkpointService.addCheckpoint(journeyId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{journeyId}/checkpoints")
    @Operation(summary = "Get journey checkpoints", description = "Retrieves all checkpoints created for a journey ordered by createdAt ascending")
    public ResponseEntity<List<com.salestrack.dto.response.CheckpointResponse>> getJourneyCheckpoints(
            @PathVariable UUID journeyId) {
        List<com.salestrack.dto.response.CheckpointResponse> checkpoints = checkpointService.getJourneyCheckpoints(journeyId);
        return ResponseEntity.ok(checkpoints);
    }

    @PatchMapping("/{journeyId}/checkpoints/{checkpointId}/visit")
    @Operation(summary = "Mark checkpoint visited", description = "Updates checkpoint status to VISITED and records visitedAt timestamp")
    public ResponseEntity<com.salestrack.dto.response.CheckpointResponse> markCheckpointVisited(
            @PathVariable UUID journeyId,
            @PathVariable Long checkpointId) {
        com.salestrack.dto.response.CheckpointResponse response = checkpointService.markCheckpointVisited(journeyId, checkpointId);
        return ResponseEntity.ok(response);
    }
}
