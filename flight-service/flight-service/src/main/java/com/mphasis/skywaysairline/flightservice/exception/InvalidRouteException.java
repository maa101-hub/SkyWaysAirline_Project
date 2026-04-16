package com.mphasis.skywaysairline.flightservice.exception;

public class InvalidRouteException extends RuntimeException {

    public InvalidRouteException(String message) {
        super(message);
    }
}