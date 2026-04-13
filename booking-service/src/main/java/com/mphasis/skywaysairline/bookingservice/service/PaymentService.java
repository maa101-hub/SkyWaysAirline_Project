package com.mphasis.skywaysairline.bookingservice.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mphasis.skywaysairline.bookingservice.models.Payment;
import com.mphasis.skywaysairline.bookingservice.repo.PaymentRepository;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepo;

    // 🔥 CREATE ORDER
    public String createOrder(double amount) {

        // 1. Generate order ID
        String orderId = "ORDER_" + UUID.randomUUID();

        // 2. Save payment as PENDING
        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setAmount(amount);
        payment.setPaymentStatus("PENDING");
        payment.setPaymentDate(LocalDateTime.now());

        paymentRepo.save(payment);

        return orderId;
    }

    // 🔥 VERIFY PAYMENT
    public boolean verifyPayment(String orderId, String paymentId) {

        Payment payment = paymentRepo.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // 👉 simulate success (later Razorpay verify karenge)
        payment.setTransactionId(paymentId);
        payment.setPaymentStatus("SUCCESS");
        payment.setPaymentDate(LocalDateTime.now());

        paymentRepo.save(payment);

        return true;
    }
}
