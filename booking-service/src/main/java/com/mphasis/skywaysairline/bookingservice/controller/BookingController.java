package com.mphasis.skywaysairline.bookingservice.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mphasis.skywaysairline.bookingservice.dto.BookingRequest;
import com.mphasis.skywaysairline.bookingservice.dto.PaymentConfirmRequest;
import com.mphasis.skywaysairline.bookingservice.dto.TicketResponse;
import com.mphasis.skywaysairline.bookingservice.models.Reservation;
import com.mphasis.skywaysairline.bookingservice.response.ApiResponse;
import com.mphasis.skywaysairline.bookingservice.service.BookingService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/booking")
public class BookingController {

    @Autowired
    private BookingService service;

    // 🔹 CREATE PAYMENT ORDER
    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<String>> createOrder(
            @Valid @RequestBody BookingRequest req) {

        System.out.println("REQ DATA 👉 " + req);

        String orderId = service.createOrder(req);

        return ResponseEntity.ok(
                new ApiResponse<>("Order created", orderId)
        );
    }

    // 🔥 CONFIRM BOOKING AFTER PAYMENT
    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<TicketResponse>> confirmBooking(
            @RequestBody PaymentConfirmRequest req) {

        TicketResponse response = service.confirmBooking(req);

        return ResponseEntity.ok(
                new ApiResponse<>("Booking Successful", response)
        );
    }
    //RK
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<Reservation>>> getAllBookings() {
        List<Reservation> bookings = service.getAllBookings();
        return ResponseEntity.ok(
                new ApiResponse<>("Bookings fetched successfully", bookings)
        );
    }
}