package com.mphasis.skywaysairline.bookingservice.exception;

public class FlightFullException extends RuntimeException {

    public FlightFullException(String msg) {
        super(msg);
    }
}
