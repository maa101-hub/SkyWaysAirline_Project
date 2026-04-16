package com.mphasis.skywaysairline.flightservice.exception;

public class SeatsUnavailableException extends RuntimeException {

    public SeatsUnavailableException(String message) {
        super(message);
    }
}