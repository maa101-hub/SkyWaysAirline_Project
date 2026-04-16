package com.mphasis.skywaysairline.flightservice.exception;

public class ScheduleNotFoundException extends RuntimeException {

    public ScheduleNotFoundException(String message) {
        super(message);
    }
}