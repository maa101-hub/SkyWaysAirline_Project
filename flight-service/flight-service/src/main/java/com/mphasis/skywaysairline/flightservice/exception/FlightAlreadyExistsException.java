package com.mphasis.skywaysairline.flightservice.exception;

public class FlightAlreadyExistsException extends RuntimeException {

    public FlightAlreadyExistsException(String message) {
        super(message);
    }
}