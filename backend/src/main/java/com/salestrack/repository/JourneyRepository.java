package com.salestrack.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.salestrack.entity.Journey;
import com.salestrack.entity.JourneyStatus;

import java.util.List;
import java.util.UUID;

@Repository
public interface JourneyRepository extends JpaRepository<Journey, UUID> {
    List<Journey> findByStatus(JourneyStatus status);
    List<Journey> findByEmployeeId(Long employeeId);
}
