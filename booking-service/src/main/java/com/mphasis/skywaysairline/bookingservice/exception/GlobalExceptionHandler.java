package com.mphasis.skywaysairline.bookingservice.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@RestControllerAdvice
public class GlobalExceptionHandler {

	 @ExceptionHandler(InvalidPassengerException.class)
	  public ResponseEntity<String> handleInvalidPassenger(InvalidPassengerException ex){
		return ResponseEntity.badRequest().body(ex.getMessage());
		 
	 }
    @ExceptionHandler(FlightFullException.class)
    public ResponseEntity<String> handleFlightFull(FlightFullException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    @ExceptionHandler(PaymentFailedException.class)
    public ResponseEntity<String> handlePayment(PaymentFailedException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    @ExceptionHandler(BookingNotFoundException.class)
    public ResponseEntity<String> handleBooking(BookingNotFoundException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    // 🔥 fallback (important)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneral(Exception ex) {
        return ResponseEntity.status(500).body("Something went wrong");
    }
}