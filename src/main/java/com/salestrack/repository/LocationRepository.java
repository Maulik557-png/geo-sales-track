package com.salestrack.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.salestrack.entity.Location;

import java.util.List;
import java.util.UUID;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByJourneyIdOrderByRecordedAtAsc(UUID journeyId);
}
