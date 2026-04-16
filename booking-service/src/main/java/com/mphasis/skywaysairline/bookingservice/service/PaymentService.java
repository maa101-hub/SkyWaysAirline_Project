package com.mphasis.skywaysairline.bookingservice.service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.mphasis.skywaysairline.bookingservice.client.UserClient;
import com.mphasis.skywaysairline.bookingservice.models.Payment;
import com.mphasis.skywaysairline.bookingservice.repo.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Autowired
    private PaymentRepository paymentRepo;

    @Autowired
    private UserClient userClient;

    // 🔥 CREATE ORDER
    public String createOrder(double amount) {

        try {
            log.info("Creating Razorpay order for amount: {}", amount);

            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            JSONObject options = new JSONObject();
            options.put("amount", (int) (amount * 100));
            options.put("currency", "INR");
            options.put("receipt", "txn_" + UUID.randomUUID());

            Order order = client.orders.create(options);

            Payment payment = new Payment();
            payment.setOrderId(order.get("id"));
            payment.setAmount(amount);
            payment.setPaymentStatus("PENDING");
            payment.setPaymentDate(LocalDateTime.now());

            paymentRepo.save(payment);

            log.info("Razorpay order created successfully. OrderId: {}", order.get("id").toString());

            return order.get("id");

        } catch (Exception e) {
            log.error("Razorpay createOrder error: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    // 🔥 VERIFY PAYMENT
    public boolean verifyPayment(String orderId, String paymentId, String signature) {

        try {
            log.info("Verifying payment for OrderId: {}, PaymentId: {}", orderId, paymentId);

            String data = orderId + "|" + paymentId;

            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                    keySecret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            ));

            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            String generatedSignature = bytesToHex(hash);

            log.info("Generated signature created");

            if (!generatedSignature.equals(signature)) {
                log.error("Payment signature mismatch for OrderId: {}", orderId);
                return false;
            }

            Payment payment = paymentRepo.findByOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            payment.setTransactionId(paymentId);
            payment.setPaymentStatus("SUCCESS");
            payment.setPaymentDate(LocalDateTime.now());

            paymentRepo.save(payment);

            log.info("Payment verified successfully for OrderId: {}", orderId);

            return true;

        } catch (Exception e) {
            log.error("Verification failed for OrderId {} : {}", orderId, e.getMessage(), e);
            throw new RuntimeException("Verification failed", e);
        }
    }

    // 🔥 CREATE WALLET TOP-UP ORDER
    public String createWalletOrder(Double amount, String userId) {

        try {
            log.info("Creating wallet top-up order for UserId: {}, Amount: {}", userId, amount);

            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            JSONObject options = new JSONObject();
            options.put("amount", (int) (amount * 100));
            options.put("currency", "INR");

            String receipt = "WALLET_" + System.currentTimeMillis();
            options.put("receipt", receipt);

            Order order = client.orders.create(options);

            Payment payment = new Payment();
            payment.setOrderId(order.get("id"));
            payment.setAmount(amount);
            payment.setPaymentStatus("PENDING");
            payment.setPaymentDate(LocalDateTime.now());
            payment.setUserId(userId);
            payment.setPaymentType("WALLET_TOPUP");

            paymentRepo.save(payment);

            log.info("Wallet order created successfully. OrderId: {}", order.get("id").toString());

            return order.get("id");

        } catch (Exception e) {
            log.error("Razorpay createWalletOrder error: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create Razorpay wallet order: " + e.getMessage());
        }
    }

    // 🔥 VERIFY WALLET PAYMENT
    public boolean verifyWalletPayment(
            String orderId,
            String paymentId,
            String signature,
            String userId) {

        try {
            log.info("Verifying wallet payment for OrderId: {}, UserId: {}", orderId, userId);

            String data = orderId + "|" + paymentId;

            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                    keySecret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            ));

            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            String generatedSignature = bytesToHex(hash);

            if (!generatedSignature.equals(signature)) {
                log.error("Wallet payment signature mismatch for OrderId: {}", orderId);
                return false;
            }

            Payment payment = paymentRepo.findByOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Wallet order not found"));

            payment.setTransactionId(paymentId);
            payment.setPaymentStatus("SUCCESS");
            payment.setPaymentDate(LocalDateTime.now());

            paymentRepo.save(payment);

            log.info("Wallet payment marked successful. Updating wallet balance.");

            userClient.addWalletMoney(userId, payment.getAmount());

            log.info("Wallet balance updated successfully for UserId: {}", userId);

            return true;

        } catch (Exception e) {
            log.error("Wallet verification failed for OrderId {} : {}", orderId, e.getMessage(), e);
            throw new RuntimeException("Wallet verification failed", e);
        }
    }

    // Helper method
    private String bytesToHex(byte[] bytes) {

        StringBuilder sb = new StringBuilder();

        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }

        return sb.toString();
    }
}