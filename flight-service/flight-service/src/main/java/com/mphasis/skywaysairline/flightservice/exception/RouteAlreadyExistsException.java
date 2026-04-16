package com.mphasis.skywaysairline.flightservice.exception;

public class RouteAlreadyExistsException extends RuntimeException {

    public RouteAlreadyExistsException(String message) {
        super(message);
    }
}