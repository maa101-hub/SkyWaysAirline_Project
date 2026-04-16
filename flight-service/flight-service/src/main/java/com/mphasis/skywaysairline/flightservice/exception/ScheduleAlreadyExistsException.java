package com.mphasis.skywaysairline.flightservice.exception;

public class ScheduleAlreadyExistsException extends RuntimeException {

    public ScheduleAlreadyExistsException(String message) {
        super(message);
    }
}