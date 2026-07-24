-- Migration V2: Create Checkpoints Table

CREATE TABLE IF NOT EXISTS checkpoints (
    id BIGSERIAL PRIMARY KEY,
    journey_id UUID NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    visited_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_checkpoints_journey FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_checkpoints_journey_created ON checkpoints(journey_id, created_at ASC);
