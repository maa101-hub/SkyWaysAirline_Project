package com.mphasis.skywaysairline.flightservice.exception;

public class NoRoutesFoundException extends RuntimeException {

    public NoRoutesFoundException(String message) {
        super(message);
    }
}