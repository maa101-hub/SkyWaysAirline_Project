package com.mphasis.skywaysairline.userservice.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

    @Autowired
    private UserService userService;
    @Autowired private JwtUtil jwtUtil;
    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest request) {
        return userService.register(request);
    }
    @PostMapping("/login")
    public String login(@Valid @RequestBody LoginRequest request) {
        return userService.login(request);
    }
    @GetMapping("/test")
    public String test() {
        return "Protected API Working";
    }
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(
            @RequestHeader("Authorization") String token) {

        return ResponseEntity.ok(userService.getProfile(token));
    }
    @PutMapping("/profile")
    public ResponseEntity<String> updateProfile(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody UserResponse request) {

        return ResponseEntity.ok(userService.updateProfile(token, request));
    }
    @GetMapping("/all")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    //RK
    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable String userId) {
        return ResponseEntity.ok(userService.deleteUser(userId));
    }
    @PutMapping("/{userId}")
    public ResponseEntity<String> update_status(@PathVariable String userId) {
        return ResponseEntity.ok(userService.update_status(userId));
    }
    @PutMapping("/wallet")
    public ResponseEntity<String> updateWallet(
            @RequestParam String customerId,
            @RequestParam Double price) {
    	String response = userService.transferMoney(customerId, price);
        return ResponseEntity.ok(response);
    }
}