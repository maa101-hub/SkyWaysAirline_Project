package com.mphasis.skywaysairline.bookingservice.exception;

public class PaymentFailedException extends RuntimeException {

    public PaymentFailedException(String msg) {
        super(msg);
    }
}
