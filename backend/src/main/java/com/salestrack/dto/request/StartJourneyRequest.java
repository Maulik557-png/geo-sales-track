package com.salestrack.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StartJourneyRequest {

    @NotNull(message = "employeeId is required")
    private Long employeeId;

    @NotNull(message = "destination is required")
    @Valid
    private DestinationDto destination;
}
