package com.mphasis.skywaysairline.bookingservice.controller;

import java.util.Map;

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
 // Add these endpoints to your BookingController.java

 // 🔥 CREATE WALLET TOP-UP ORDER
 @PostMapping("/wallet/add")
 public ResponseEntity<ApiResponse<String>> addWalletMoney(
         @RequestBody Map<String, Double> request) {
     
	 System.out.println("System Is Working Now 1");
     Double amount = request.get("amount");
     if (amount <= 0 || amount > 50000) {
         throw new IllegalArgumentException("Invalid amount");
     }
     
     String orderId = service.createWalletOrder(amount);
     System.out.println("System Is Working Now 2"+amount);
     return ResponseEntity.ok(
             new ApiResponse<>("Wallet order created", orderId)
     );
 }

 // 🔥 VERIFY WALLET PAYMENT
 @PostMapping("/wallet/verify")
 public ResponseEntity<ApiResponse<String>> verifyWalletPayment(
         @RequestBody  WalletVerifyRequest request) {
     
     String orderId = request.getOrderId();
     String paymentId = request.getPaymentId();
     String signature = request.getSignature();
     
     boolean success = service.confirmWalletTopup(orderId, paymentId, signature);
     
     if (success) {
         return ResponseEntity.ok(
                 new ApiResponse<>("Wallet top-up successful", "SUCCESS")
         );
     } else {
         return ResponseEntity.badRequest().body(
                 new ApiResponse<>("Wallet top-up failed", "FAILED")
         );
     }
 }
}