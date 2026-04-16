package com.mphasis.skywaysairline.flightservice.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.AccessDeniedException;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ==========================================
    // COMMON ERROR RESPONSE
    // ==========================================
    static class ErrorResponse {

        public String message;
        public int status;
        public String path;
        public LocalDateTime time;

        public ErrorResponse(
                String message,
                int status,
                String path) {

            this.message = message;
            this.status = status;
            this.path = path;
            this.time = LocalDateTime.now();
        }
    }

    // ==========================================
    // FLIGHT EXCEPTIONS
    // ==========================================
    @ExceptionHandler(FlightNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleFlightNotFound(
            FlightNotFoundException ex) {

        log.warn("Flight not found: {}", ex.getMessage());

        return new ResponseEntity<>(
                new ErrorResponse(
                        ex.getMessage(),
                        404,
                        "/api/flights"
                ),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(FlightAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleFlightExists(
            FlightAlreadyExistsException ex) {

        log.warn("Flight already exists: {}", ex.getMessage());

        return new ResponseEntity<>(
                new ErrorResponse(
                        ex.getMessage(),
                        409,
                        "/api/flights"
                ),
                HttpStatus.CONFLICT
        );
    }

    // ==========================================
    // ROUTE EXCEPTIONS
    // ==========================================
    @ExceptionHandler(RouteNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleRouteNotFound(
            RouteNotFoundException ex) {

        log.warn("Route not found: {}", ex.getMessage());

        return new ResponseEntity<>(
                new ErrorResponse(
                        ex.getMessage(),
                        404,
                        "/api/routes"
                ),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(RouteAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleRouteExists(
            RouteAlreadyExistsException ex) {

        log.warn("Route already exists: {}", ex.getMessage());

        return new ResponseEntity<>(
                new ErrorResponse(
                        ex.getMessage(),
                        409,
                        "/api/routes"
                ),
                HttpStatus.CONFLICT
        );
    }

    // ==========================================
    // SCHEDULE EXCEPTIONS
    // ==========================================
    @ExceptionHandler(ScheduleNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleScheduleNotFound(
            ScheduleNotFoundException ex) {

        log.warn("Schedule not found: {}", ex.getMessage());

        return new ResponseEntity<>(
                new ErrorResponse(
                        ex.getMessage(),
                        404,
                        "/api/schedules"
                ),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(ScheduleAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleScheduleExists(
            ScheduleAlreadyExistsException ex) {

        log.warn("Schedule already exists: {}", ex.getMessage());

        return new ResponseEntity<>(
                new ErrorResponse(
                        ex.getMessage(),
                        409,
                        "/api/schedules"
                ),
                HttpStatus.CONFLICT
        );
    }

    // ==========================================
    // SEAT / SEARCH EXCEPTIONS
    // ==========================================
    @ExceptionHandler(SeatsUnavailableException.class)
    public ResponseEntity<ErrorResponse> handleSeatsUnavailable(
            SeatsUnavailableException ex) {

        log.warn("Seats unavailable: {}", ex.getMessage());

        return new ResponseEntity<>(
                new ErrorResponse(
                        ex.getMessage(),
                        400,
                        "/api/flights/updateSeats"
                ),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(NoFlightsFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoFlights(
            NoFlightsFoundException ex) {

        log.warn("No flights found: {}", ex.getMessage());

        return new ResponseEntity<>(
                new ErrorResponse(
                        ex.getMessage(),
                        404,
                        "/api/flights/search"
                ),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(NoRoutesFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoRoutes(
            NoRoutesFoundException ex) {

        log.warn("No routes found: {}", ex.getMessage());

        return new ResponseEntity<>(
                new ErrorResponse(
                        ex.getMessage(),
                        404,
                        "/api/routes"
                ),
                HttpStatus.NOT_FOUND
        );
    }

    // ==========================================
    // VALIDATION EXCEPTIONS
    // ==========================================
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors =
                new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        log.warn("Validation failed: {}", errors);

        return new ResponseEntity<>(
                errors,
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(
            MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParam(
            MissingServletRequestParameterException ex) {

        log.warn("Missing request parameter: {}", ex.getParameterName());

        return new ResponseEntity<>(
                new ErrorResponse(
                        ex.getParameterName() + " is required",
                        400,
                        "Request Param"
                ),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(
            MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex) {

        log.warn("Invalid parameter type: {}", ex.getName());

        return new ResponseEntity<>(
                new ErrorResponse(
                        "Invalid value for " + ex.getName(),
                        400,
                        "Request Param"
                ),
                HttpStatus.BAD_REQUEST
        );
    }

    // ==========================================
    // SECURITY EXCEPTION
    // ==========================================
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex) {

        log.warn("Access denied: {}", ex.getMessage());

        return new ResponseEntity<>(
                new ErrorResponse(
                        "Access Denied",
                        403,
                        "Protected Resource"
                ),
                HttpStatus.FORBIDDEN
        );
    }

    // ==========================================
    // DATABASE EXCEPTION
    // ==========================================
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDB(
            DataIntegrityViolationException ex) {

        log.error("Database error: {}", ex.getMessage(), ex);

        return new ResponseEntity<>(
                new ErrorResponse(
                        "Database constraint violation",
                        409,
                        "Database"
                ),
                HttpStatus.CONFLICT
        );
    }

    // ==========================================
    // ILLEGAL ARGUMENT
    // ==========================================
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex) {

        log.warn("Illegal argument: {}", ex.getMessage());

        return new ResponseEntity<>(
                new ErrorResponse(
                        ex.getMessage(),
                        400,
                        "Request"
                ),
                HttpStatus.BAD_REQUEST
        );
    }

    // ==========================================
    // GENERIC FALLBACK
    // ==========================================
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobal(
            Exception ex) {

        log.error("Unhandled exception: {}", ex.getMessage(), ex);

        return new ResponseEntity<>(
                new ErrorResponse(
                        "Something went wrong",
                        500,
                        "Internal"
                ),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}