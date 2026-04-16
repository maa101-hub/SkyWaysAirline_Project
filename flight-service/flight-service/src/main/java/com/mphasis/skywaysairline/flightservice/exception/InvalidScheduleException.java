package com.mphasis.skywaysairline.flightservice.exception;

public class InvalidScheduleException extends RuntimeException {

    public InvalidScheduleException(String message) {
        super(message);
    }
}