package com.mphasis.skywaysairline.bookingservice.exception;

public class BookingNotFoundException extends RuntimeException {

    public BookingNotFoundException(String msg) {
        super(msg);
    }
}
