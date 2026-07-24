package com.salestrack.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.salestrack.entity.Checkpoint;

import java.util.List;
import java.util.UUID;

@Repository
public interface CheckpointRepository extends JpaRepository<Checkpoint, Long> {
    List<Checkpoint> findByJourneyIdOrderByCreatedAtAsc(UUID journeyId);
}
