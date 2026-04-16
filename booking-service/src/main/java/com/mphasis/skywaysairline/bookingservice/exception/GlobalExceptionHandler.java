package com.mphasis.skywaysairline.bookingservice.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(InvalidPassengerException.class)
    public ResponseEntity<String> handleInvalidPassenger(
            InvalidPassengerException ex) {

        log.warn("InvalidPassengerException occurred: {}", ex.getMessage());

        return ResponseEntity
                .badRequest()
                .body(ex.getMessage());
    }

    @ExceptionHandler(FlightFullException.class)
    public ResponseEntity<String> handleFlightFull(
            FlightFullException ex) {

        log.warn("FlightFullException occurred: {}", ex.getMessage());

        return ResponseEntity
                .badRequest()
                .body(ex.getMessage());
    }

    @ExceptionHandler(PaymentFailedException.class)
    public ResponseEntity<String> handlePayment(
            PaymentFailedException ex) {

        log.error("PaymentFailedException occurred: {}", ex.getMessage());

        return ResponseEntity
                .badRequest()
                .body(ex.getMessage());
    }

    @ExceptionHandler(BookingNotFoundException.class)
    public ResponseEntity<String> handleBooking(
            BookingNotFoundException ex) {

        log.warn("BookingNotFoundException occurred: {}", ex.getMessage());

        return ResponseEntity
                .badRequest()
                .body(ex.getMessage());
    }

    // 🔥 fallback (important)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneral(
            Exception ex) {

        log.error("Unhandled Exception occurred: {}", ex.getMessage(), ex);

        return ResponseEntity
                .status(500)
                .body("Something went wrong");
    }
}