package com.salestrack.service;

import com.salestrack.dto.request.LoginRequest;
import com.salestrack.dto.request.RegisterRequest;
import com.salestrack.dto.response.AuthResponse;
import com.salestrack.dto.response.UserResponse;
import com.salestrack.entity.Role;
import com.salestrack.entity.User;
import com.salestrack.exception.InvalidJourneyStateException;
import com.salestrack.exception.ResourceNotFoundException;
import com.salestrack.repository.UserRepository;
import com.salestrack.security.JwtUtils;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + request.getUsername()));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidJourneyStateException("Invalid password credentials");
        }

        user.setIsOnline(true);
        user.setLastActiveAt(Instant.now());
        userRepository.save(user);

        String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole())
                .isOnline(true)
                .build();
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new InvalidJourneyStateException("Username/Email already exists: " + request.getUsername());
        }

        Role userRole = request.getRole() != null ? request.getRole() : Role.ROLE_EMPLOYEE;

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(userRole)
                .isOnline(true)
                .lastActiveAt(Instant.now())
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtUtils.generateToken(savedUser.getUsername(), savedUser.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole())
                .isOnline(true)
                .build();
    }

    @Override
    @Transactional
    public void logout(String username) {
        userRepository.findByUsername(username).ifPresent(user -> {
            user.setIsOnline(false);
            user.setLastActiveAt(Instant.now());
            userRepository.save(user);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllEmployees() {
        return userRepository.findByRole(Role.ROLE_EMPLOYEE).stream()
                .map(user -> UserResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .fullName(user.getFullName())
                        .role(user.getRole())
                        .isOnline(Boolean.TRUE.equals(user.getIsOnline()))
                        .lastActiveAt(user.getLastActiveAt())
                        .build())
                .collect(Collectors.toList());
    }
}
