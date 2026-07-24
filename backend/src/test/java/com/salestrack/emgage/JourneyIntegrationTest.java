package com.salestrack.emgage;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.salestrack.dto.request.DestinationDto;
import com.salestrack.dto.request.StartJourneyRequest;
import com.salestrack.dto.request.UpdateLocationRequest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Instant;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class JourneyIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testEndToEndJourneyLifecycle() throws Exception {
        // 1. Start Journey
        DestinationDto destination = DestinationDto.builder()
                .name("ABC Pvt Ltd")
                .latitude(22.307159)
                .longitude(73.181219)
                .build();

        StartJourneyRequest startRequest = StartJourneyRequest.builder()
                .employeeId(101L)
                .destination(destination)
                .build();

        MvcResult startResult = mockMvc.perform(post("/api/v1/journeys")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(startRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.journeyId", notNullValue()))
                .andExpect(jsonPath("$.status", is("ACTIVE")))
                .andExpect(jsonPath("$.startedAt", notNullValue()))
                .andReturn();

        String responseJson = startResult.getResponse().getContentAsString();
        String journeyIdStr = objectMapper.readTree(responseJson).get("journeyId").asText();
        UUID journeyId = UUID.fromString(journeyIdStr);

        // 2. Post Location Update 1
        UpdateLocationRequest loc1 = UpdateLocationRequest.builder()
                .latitude(22.30712)
                .longitude(73.18121)
                .accuracy(5.2)
                .speed(34.6)
                .heading(182.4)
                .recordedAt(Instant.now())
                .build();

        mockMvc.perform(post("/api/v1/journeys/{journeyId}/locations", journeyId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loc1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.received", is(true)));

        // 3. Post Location Update 2
        UpdateLocationRequest loc2 = UpdateLocationRequest.builder()
                .latitude(22.30715)
                .longitude(73.18125)
                .accuracy(4.8)
                .speed(36.0)
                .heading(185.0)
                .recordedAt(Instant.now().plusSeconds(5))
                .build();

        mockMvc.perform(post("/api/v1/journeys/{journeyId}/locations", journeyId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loc2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.received", is(true)));

        // 4. Get Journey Details
        mockMvc.perform(get("/api/v1/journeys/{journeyId}", journeyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.journeyId", is(journeyIdStr)))
                .andExpect(jsonPath("$.employeeId", is(101)))
                .andExpect(jsonPath("$.status", is("ACTIVE")))
                .andExpect(jsonPath("$.destination.name", is("ABC Pvt Ltd")))
                .andExpect(jsonPath("$.destination.latitude", is(22.307159)))
                .andExpect(jsonPath("$.destination.longitude", is(73.181219)));

        // 5. Get Journey Locations
        mockMvc.perform(get("/api/v1/journeys/{journeyId}/locations", journeyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].speed", is(34.6)))
                .andExpect(jsonPath("$[1].speed", is(36.0)));

        // 6. Complete Journey
        mockMvc.perform(patch("/api/v1/journeys/{journeyId}/complete", journeyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.journeyId", is(journeyIdStr)))
                .andExpect(jsonPath("$.status", is("COMPLETED")))
                .andExpect(jsonPath("$.endedAt", notNullValue()));

        // 7. Attempt recording location on completed journey -> Failure HTTP 400
        mockMvc.perform(post("/api/v1/journeys/{journeyId}/locations", journeyId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loc1)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", notNullValue()));
    }

    @Test
    void testValidationErrors() throws Exception {
        // Invalid Start Journey (missing employeeId)
        StartJourneyRequest invalidRequest = StartJourneyRequest.builder()
                .destination(DestinationDto.builder()
                        .name("Test")
                        .latitude(100.0) // Invalid latitude > 90
                        .longitude(73.0)
                        .build())
                .build();

        mockMvc.perform(post("/api/v1/journeys")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", notNullValue()));
    }

    @Test
    void testNotFoundJourney() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        mockMvc.perform(get("/api/v1/journeys/{journeyId}", nonExistentId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Journey not found with id: " + nonExistentId)));
    }
}
