package com.mphasis.skywaysairline.flightservice.exception;

public class InvalidFlightDataException extends RuntimeException {

    public InvalidFlightDataException(String message) {
        super(message);
    }
}