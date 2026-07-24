package com.salestrack.service;

import com.salestrack.dto.request.LoginRequest;
import com.salestrack.dto.request.RegisterRequest;
import com.salestrack.dto.response.AuthResponse;
import com.salestrack.dto.response.UserResponse;

import java.util.List;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
    void logout(String username);
    List<UserResponse> getAllEmployees();
}
