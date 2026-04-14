package com.mphasis.skywaysairline.bookingservice.service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.mphasis.skywaysairline.bookingservice.models.Payment;
import com.mphasis.skywaysairline.bookingservice.repo.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Autowired
    private PaymentRepository paymentRepo;

    // 🔥 CREATE ORDER
    public String createOrder(double amount) {

        try {
        	System.out.println("Creating Razorpay order for amount: " + amount);

            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            JSONObject options = new JSONObject();
            options.put("amount", (int)(amount * 100)); // paise
            options.put("currency", "INR");
            options.put("receipt", "txn_" + UUID.randomUUID());

            Order order = client.orders.create(options);

            // save DB
            Payment payment = new Payment();
            payment.setOrderId(order.get("id"));
            payment.setAmount(amount);
            payment.setPaymentStatus("PENDING");
            payment.setPaymentDate(LocalDateTime.now());

            paymentRepo.save(payment);
            System.out.println("Order created and saved: " + order.get("id"));
            return order.get("id");

        } catch (Exception e) {
            System.err.println("Razorpay createOrder error: " + e.getMessage());
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    // 🔥 VERIFY PAYMENT
 // ...existing code...

 // 🔥 VERIFY PAYMENT (updated for hex encoding)
 public boolean verifyPayment(String orderId, String paymentId, String signature) {
     try {
         String data = orderId + "|" + paymentId;

         Mac mac = Mac.getInstance("HmacSHA256");
         mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));

         byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
         String generatedSignature = bytesToHex(hash);  // Use hex instead of Base64

         System.out.println("Generated signature: " + generatedSignature);
         System.out.println("Received signature: " + signature);

         if (!generatedSignature.equals(signature)) {
             System.err.println("Signature mismatch!");
             return false;
         }

         Payment payment = paymentRepo.findByOrderId(orderId)
                 .orElseThrow(() -> new RuntimeException("Order not found"));

         payment.setTransactionId(paymentId);
         payment.setPaymentStatus("SUCCESS");
         payment.setPaymentDate(LocalDateTime.now());
         paymentRepo.save(payment);

         return true;

     } catch (Exception e) {
         System.err.println("Verification failed: " + e.getMessage());
         throw new RuntimeException("Verification failed", e);
     }
 }

 // Helper method to convert bytes to hex
 private String bytesToHex(byte[] bytes) {
     StringBuilder sb = new StringBuilder();
     for (byte b : bytes) {
         sb.append(String.format("%02x", b));
     }
     return sb.toString();
 }
}