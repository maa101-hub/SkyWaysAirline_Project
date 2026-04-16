package com.mphasis.skywaysairline.bookingservice.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mphasis.skywaysairline.bookingservice.dto.BookingRequest;
import com.mphasis.skywaysairline.bookingservice.dto.PaymentConfirmRequest;
import com.mphasis.skywaysairline.bookingservice.dto.TicketResponse;
import com.mphasis.skywaysairline.bookingservice.dto.WalletVerifyRequest;
import com.mphasis.skywaysairline.bookingservice.response.ApiResponse;
import com.mphasis.skywaysairline.bookingservice.service.BookingService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/booking")
public class BookingController {

    private static final Logger log = LoggerFactory.getLogger(BookingController.class);

    @Autowired
    private BookingService service;

    // 🔹 CREATE PAYMENT ORDER
    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<String>> createOrder(
            @Valid @RequestBody BookingRequest req) {

        log.info("Received create-order request: {}", req);

        String orderId = service.createOrder(req);

        log.info("Order created successfully. OrderId: {}", orderId);

        return ResponseEntity.ok(
                new ApiResponse<>("Order created", orderId)
        );
    }

    // 🔥 CONFIRM BOOKING AFTER PAYMENT
    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<TicketResponse>> confirmBooking(
            @RequestBody PaymentConfirmRequest req) {

        log.info("Received confirm booking request: {}", req);

        TicketResponse response = service.confirmBooking(req);

        log.info("Booking confirmed successfully");

        return ResponseEntity.ok(
                new ApiResponse<>("Booking Successful", response)
        );
    }

    // 🔥 CREATE WALLET TOP-UP ORDER
    @PostMapping("/wallet/add")
    public ResponseEntity<ApiResponse<String>> addWalletMoney(
            @RequestBody Map<String, Double> request) {

        log.info("Wallet add money request received");

        Double amount = request.get("amount");

        log.info("Requested wallet top-up amount: {}", amount);

        if (amount <= 0 || amount > 50000) {
            log.error("Invalid wallet amount entered: {}", amount);
            throw new IllegalArgumentException("Invalid amount");
        }

        String orderId = service.createWalletOrder(amount);

        log.info("Wallet order created successfully. OrderId: {}", orderId);

        return ResponseEntity.ok(
                new ApiResponse<>("Wallet order created", orderId)
        );
    }

    // 🔥 VERIFY WALLET PAYMENT
    @PostMapping("/wallet/verify")
    public ResponseEntity<ApiResponse<String>> verifyWalletPayment(
            @RequestBody WalletVerifyRequest request) {

        log.info("Wallet payment verification request received");

        String orderId = request.getOrderId();
        String paymentId = request.getPaymentId();
        String signature = request.getSignature();

        log.info("Verifying payment for OrderId: {}, PaymentId: {}", orderId, paymentId);

        boolean success = service.confirmWalletTopup(orderId, paymentId, signature);

        if (success) {
            log.info("Wallet top-up successful for OrderId: {}", orderId);

            return ResponseEntity.ok(
                    new ApiResponse<>("Wallet top-up successful", "SUCCESS")
            );
        } else {
            log.error("Wallet top-up failed for OrderId: {}", orderId);

            return ResponseEntity.badRequest().body(
                    new ApiResponse<>("Wallet top-up failed", "FAILED")
            );
        }
    }
}