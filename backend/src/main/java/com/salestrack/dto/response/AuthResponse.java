package com.salestrack.dto.response;

import com.salestrack.entity.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private Long id;
    private String username;
    private String fullName;
    private Role role;
    private Boolean isOnline;
}
