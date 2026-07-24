package com.salestrack.exception;

public class InvalidJourneyStateException extends RuntimeException {

    public InvalidJourneyStateException(String message) {
        super(message);
    }
}
