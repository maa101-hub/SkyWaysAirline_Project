package com.mphasis.skywaysairline.userservice.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mphasis.skywaysairline.userservice.dto.LoginRequest;
import com.mphasis.skywaysairline.userservice.dto.RegisterRequest;
import com.mphasis.skywaysairline.userservice.dto.UserResponse;
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
            @RequestParam Double price) {

        log.info(
                "Wallet deduction API called. CustomerId: {}, Amount: {}",
                customerId,
                price
        );

        String response =
                userService.transferMoney(customerId, price);

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
}