package com.salestrack.controller;

import com.salestrack.dto.request.LoginRequest;
import com.salestrack.dto.request.RegisterRequest;
import com.salestrack.dto.response.AuthResponse;
import com.salestrack.dto.response.UserResponse;
import com.salestrack.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Authentication & User Management", description = "Endpoints for user login, registration, logout, and employee directory")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/auth/login")
    @Operation(summary = "User login", description = "Authenticates user with username & password and returns JWT token & role")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/auth/register")
    @Operation(summary = "User registration", description = "Registers a new user (employee or admin) into PostgreSQL database and returns JWT token")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/auth/logout/{username}")
    @Operation(summary = "User logout", description = "Sets user online status to false")
    public ResponseEntity<Void> logout(@PathVariable String username) {
        authService.logout(username);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/users/employees")
    @Operation(summary = "Get employee list", description = "Retrieves directory of all field employees and their live online status")
    public ResponseEntity<List<UserResponse>> getAllEmployees() {
        List<UserResponse> employees = authService.getAllEmployees();
        return ResponseEntity.ok(employees);
    }
}
