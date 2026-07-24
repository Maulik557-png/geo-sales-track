package com.salestrack.config;

import com.salestrack.entity.Role;
import com.salestrack.entity.User;
import com.salestrack.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Seeding default database user accounts into 'users' table...");

            // Seed Admin Account
            userRepository.save(User.builder()
                    .username("admin@emgage.com")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("System Administrator")
                    .role(Role.ROLE_ADMIN)
                    .isOnline(false)
                    .lastActiveAt(Instant.now())
                    .build());

            // Seed Employee Accounts
            userRepository.save(User.builder()
                    .id(101L)
                    .username("alex@emgage.com")
                    .password(passwordEncoder.encode("employee123"))
                    .fullName("Alex Johnson")
                    .role(Role.ROLE_EMPLOYEE)
                    .isOnline(false)
                    .lastActiveAt(Instant.now())
                    .build());

            userRepository.save(User.builder()
                    .id(102L)
                    .username("priya@emgage.com")
                    .password(passwordEncoder.encode("employee123"))
                    .fullName("Priya Sharma")
                    .role(Role.ROLE_EMPLOYEE)
                    .isOnline(false)
                    .lastActiveAt(Instant.now())
                    .build());

            userRepository.save(User.builder()
                    .id(103L)
                    .username("rahul@emgage.com")
                    .password(passwordEncoder.encode("employee123"))
                    .fullName("Rahul Verma")
                    .role(Role.ROLE_EMPLOYEE)
                    .isOnline(false)
                    .lastActiveAt(Instant.now())
                    .build());

            log.info("Default user accounts seeded successfully!");
        }
    }
}
