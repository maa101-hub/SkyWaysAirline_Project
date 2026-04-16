package com.mphasis.skywaysairline.userservice.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Custom response structure
    static class ErrorResponse {

        public String message;
        public int status;
        public LocalDateTime time;

        public ErrorResponse(String message, int status) {
            this.message = message;
            this.status = status;
            this.time = LocalDateTime.now();
        }
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(
            UserNotFoundException ex) {

        log.warn("UserNotFoundException occurred: {}", ex.getMessage());

        return new ResponseEntity<>(
                new ErrorResponse(ex.getMessage(), 404),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(InvalidPasswordException.class)
    public ResponseEntity<ErrorResponse> handleInvalidPassword(
            InvalidPasswordException ex) {

        log.warn("InvalidPasswordException occurred: {}", ex.getMessage());

        return new ResponseEntity<>(
                new ErrorResponse(ex.getMessage(), 401),
                HttpStatus.UNAUTHORIZED
        );
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleUserExists(
            UserAlreadyExistsException ex) {

        log.warn("UserAlreadyExistsException occurred: {}", ex.getMessage());

        return new ResponseEntity<>(
                new ErrorResponse(ex.getMessage(), 409),
                HttpStatus.CONFLICT
        );
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(
            BadRequestException ex) {

        log.warn("BadRequestException occurred: {}", ex.getMessage());

        return new ResponseEntity<>(
                new ErrorResponse(ex.getMessage(), 400),
                HttpStatus.BAD_REQUEST
        );
    }

    // Generic fallback
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobal(
            Exception ex) {

        log.error("Unhandled Exception occurred: {}", ex.getMessage(), ex);

        return new ResponseEntity<>(
                new ErrorResponse(ex.getMessage(), 500),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error -> {
                    errors.put(
                            error.getField(),
                            error.getDefaultMessage()
                    );
                });

        log.warn("Validation failed: {}", errors);

        return new ResponseEntity<>(
                errors,
                HttpStatus.BAD_REQUEST
        );
    }
}