package com.mphasis.skywaysairline.userservice.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mphasis.skywaysairline.userservice.dto.ForgotPasswordRequest;
import com.mphasis.skywaysairline.userservice.dto.LoginRequest;
import com.mphasis.skywaysairline.userservice.dto.DeleteRequestEventRequest;
import com.mphasis.skywaysairline.userservice.dto.OtpGenerateRequest;
import com.mphasis.skywaysairline.userservice.dto.OtpVerifyRequest;
import com.mphasis.skywaysairline.userservice.dto.RegisterRequest;
import com.mphasis.skywaysairline.userservice.dto.ResetPasswordRequest;
import com.mphasis.skywaysairline.userservice.dto.UserResponse;
import com.mphasis.skywaysairline.userservice.model.UserCredentials;
import com.mphasis.skywaysairline.userservice.security.JwtUtil;
import com.mphasis.skywaysairline.userservice.service.UserService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/users")
public class AuthController {

    private static final Logger log =
            LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public String register(
            @Valid @RequestBody RegisterRequest request) {

        log.info("Register API called for email: {}", request.getEmail());

        return userService.register(request);
    }

    @PostMapping("/login")
    public String login(
            @Valid @RequestBody LoginRequest request) {

        log.info("Login API called for email: {}", request.getEmail());

        return userService.login(request);
    }

    @GetMapping("/test")
    public String test() {

        log.info("Test protected API called");

        return "Protected API Working";
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(
            @RequestHeader("Authorization") String token) {

        log.info("Get Profile API called");

        return ResponseEntity.ok(
                userService.getProfile(token)
        );
    }

    @PutMapping("/profile")
    public ResponseEntity<String> updateProfile(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody UserResponse request) {

        log.info("Update Profile API called");

        return ResponseEntity.ok(
                userService.updateProfile(token, request)
        );
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        log.info("Get All Users API called");

        return ResponseEntity.ok(
                userService.getAllUsers()
        );
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteUser(
            @PathVariable String userId) {

        log.info("Delete User API called for userId: {}", userId);

        return ResponseEntity.ok(
                userService.deleteUser(userId)
        );
    }

        @PostMapping("/delete-request")
        public ResponseEntity<String> submitDeleteRequest(
                        @RequestBody DeleteRequestEventRequest request) {

                log.info("Delete request event API called for userId: {}", request.getUserId());

                return ResponseEntity.ok(
                                userService.publishDeleteRequestEvent(request)
                );
        }

    @PutMapping("/{userId}")
    public ResponseEntity<String> update_status(
            @PathVariable String userId) {

        log.info("Logout API called for userId: {}", userId);

        return ResponseEntity.ok(
                userService.update_status(userId)
        );
    }

    @PutMapping("/wallet")
    public ResponseEntity<String> updateWallet(
            @RequestParam String customerId,
            @RequestParam Double price,@RequestParam String paymentOption ) {

        log.info(
                "Wallet deduction API called. CustomerId: {}, Amount: {}",
                customerId,
                price
        );

        String response =
                userService.transferMoney(customerId, price,paymentOption);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/wallet/add")
    public ResponseEntity<String> addWalletMoney(
            @RequestParam String userId,
            @RequestParam Double amount) {

        log.info(
                "Wallet top-up API called. UserId: {}, Amount: {}",
                userId,
                amount
        );

        try {

            String result =
                    userService.addWalletMoney(userId, amount);

            return ResponseEntity.ok(result);

        } catch (Exception e) {

            log.error(
                    "Wallet top-up failed for userId: {} Reason: {}",
                    userId,
                    e.getMessage(),
                    e
            );

            return ResponseEntity.badRequest()
                    .body("Failed to add wallet money: " + e.getMessage());
        }
    }

    @PostMapping("/wallet/refund")
    public ResponseEntity<String> refundWalletMoney(
            @RequestParam String userId,
            @RequestParam Double amount) {

        log.info(
                "Wallet refund API called. UserId: {}, Amount: {}",
                userId,
                amount
        );

        try {
            String result =
                    userService.refundMoney(userId, amount);

            return ResponseEntity.ok(result);

        } catch (Exception e) {

            log.error(
                    "Wallet refund failed for userId: {} Reason: {}",
                    userId,
                    e.getMessage(),
                    e
            );

            return ResponseEntity.badRequest()
                    .body("Failed to refund wallet money: " + e.getMessage());
        }
    }

    @GetMapping("/id-by-email")
    public ResponseEntity<String> getUserIdByEmail(
            @RequestParam String email) {

        log.info("Get UserId By Email API called for email: {}", email);

        try {

            String userId =
                    userService.getUserIdByEmail(email);

            return ResponseEntity.ok(userId);

        } catch (Exception e) {

            log.error(
                    "User not found for email: {} Reason: {}",
                    email,
                    e.getMessage(),
                    e
            );

            return ResponseEntity.badRequest()
                    .body("User not found: " + e.getMessage());
        }
    }

    @PostMapping("/login/request-otp")
    public ResponseEntity<?> requestOtp(@RequestBody OtpGenerateRequest request) {

        log.info("Received OTP request for identifier: {}", request.getIdentifier());

        try {
            String response = userService.generateLoginOtp(request.getIdentifier());

            log.info("OTP generated successfully for identifier: {}", request.getIdentifier());

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            log.error("Failed to generate OTP for identifier: {}. Reason: {}",
                    request.getIdentifier(), e.getMessage());

            return ResponseEntity.badRequest().body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/login/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpVerifyRequest request) {

        log.info("Received OTP verification request for identifier: {}", request.getIdentifier());

        try {
            String token = userService.verifyLoginOtp(request);

            log.info("Login successful for identifier: {}", request.getIdentifier());

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "message", "Login successful"
            ));

        } catch (Exception e) {

            log.error("OTP verification failed for identifier: {}. Reason: {}",
                    request.getIdentifier(), e.getMessage());

            return ResponseEntity.badRequest().body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }
    @PostMapping("/forgot-password/request-otp")
    public ResponseEntity<?> requestForgotPasswordOtp(
            @RequestBody ForgotPasswordRequest request) {

        log.info("Received forgot password OTP request for email: {}", request.getEmail());

        try {
            String response = userService.generateForgotPasswordOtp(request.getEmail());

            log.info("Forgot password OTP generated successfully for email: {}", request.getEmail());

            return ResponseEntity.ok(Map.of(
                    "message", response
            ));

        } catch (Exception e) {

            log.error("Failed to generate forgot password OTP for email: {}. Reason: {}",
                    request.getEmail(), e.getMessage());

            return ResponseEntity.badRequest().body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<?> verifyForgotPasswordOtp(
            @RequestBody OtpVerifyRequest request) {

        log.info("Received forgot password OTP verification request for identifier: {}", request.getIdentifier());

        try {
            String response = userService.verifyForgotPasswordOtp(request);

            log.info("Forgot password OTP verified successfully for identifier: {}", request.getIdentifier());

            return ResponseEntity.ok(Map.of(
                    "message", response
            ));

        } catch (Exception e) {

            log.error("Forgot password OTP verification failed for identifier: {}. Reason: {}",
                    request.getIdentifier(), e.getMessage());

            return ResponseEntity.badRequest().body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/forgot-password/update-password")
    public ResponseEntity<?> updateForgotPassword(
           @Valid @RequestBody ResetPasswordRequest request) {

        log.info("Received update password request for email: {}", request.getEmail());

        try {
            String response = userService.updatePasswordAfterOtpVerification(request);

            log.info("Password updated successfully for email: {}", request.getEmail());

            return ResponseEntity.ok(Map.of(
                    "message", response
            ));

        } catch (Exception e) {

            log.error("Password update failed for email: {}. Reason: {}",
                    request.getEmail(), e.getMessage());

            return ResponseEntity.badRequest().body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }
}