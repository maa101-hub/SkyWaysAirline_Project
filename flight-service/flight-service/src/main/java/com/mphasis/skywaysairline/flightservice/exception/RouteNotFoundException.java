package com.mphasis.skywaysairline.flightservice.exception;

public class RouteNotFoundException extends RuntimeException {

    public RouteNotFoundException(String message) {
        super(message);
    }
}