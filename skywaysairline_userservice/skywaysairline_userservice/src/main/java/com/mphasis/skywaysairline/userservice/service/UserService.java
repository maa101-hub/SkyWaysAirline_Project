package com.mphasis.skywaysairline.userservice.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.mphasis.skywaysairline.userservice.dto.LoginRequest;
import com.mphasis.skywaysairline.userservice.dto.RegisterRequest;
import com.mphasis.skywaysairline.userservice.dto.UserResponse;
import com.mphasis.skywaysairline.userservice.exception.BadRequestException;
import com.mphasis.skywaysairline.userservice.exception.InvalidPasswordException;
import com.mphasis.skywaysairline.userservice.exception.UserAlreadyExistsException;
import com.mphasis.skywaysairline.userservice.exception.UserNotFoundException;
import com.mphasis.skywaysairline.userservice.model.UserCredentials;
import com.mphasis.skywaysairline.userservice.model.UserProfile;
import com.mphasis.skywaysairline.userservice.repo.UserCredentialsRepository;
import com.mphasis.skywaysairline.userservice.repo.UserProfileRepository;
import com.mphasis.skywaysairline.userservice.security.JwtUtil;

import jakarta.transaction.Transactional;

@Service
public class UserService {

    private static final Logger log =
            LoggerFactory.getLogger(UserService.class);

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserProfileRepository profileRepo;

    @Autowired
    private UserCredentialsRepository credentialsRepo;

    @Autowired
    private JwtUtil jwtUtil;

    public String register(RegisterRequest request) {

        log.info("User registration request received for email: {}", request.getEmail());

        if (request.getEmail() == null || request.getPassword() == null) {
            log.warn("Registration failed. Email or password missing");
            throw new BadRequestException("Email and Password are required");
        }

        if (credentialsRepo.findByUserProfile_Email(request.getEmail()).isPresent()) {
            log.warn("User already exists with email: {}", request.getEmail());
            throw new UserAlreadyExistsException("User already exists with this email");
        }

        UserProfile profile = new UserProfile();
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setDob(request.getDob());
        profile.setGender(request.getGender());
        profile.setAddress(request.getAddress());
        profile.setPhone(request.getPhone());
        profile.setEmail(request.getEmail());
        profile.setWallet(1000000.0);

        UserCredentials credentials = new UserCredentials();

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        credentials.setPassword(encodedPassword);
        credentials.setUserType("C");
        credentials.setLoginStatus(1);

        credentials.setUserProfile(profile);
        profile.setCredentials(credentials);

        profileRepo.save(profile);

        log.info("User registered successfully for email: {}", request.getEmail());

        return "User Registered Successfully";
    }

    public String login(LoginRequest request) {

        log.info("Login request received for email: {}", request.getEmail());

        UserCredentials user = credentialsRepo
                .findByUserProfile_Email(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("User not found for email: {}", request.getEmail());
                    return new UserNotFoundException("User not found");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Invalid password for email: {}", request.getEmail());
            throw new InvalidPasswordException("Invalid password");
        }

        user.setLoginStatus(1);
        credentialsRepo.save(user);

        log.info("User login successful for email: {}", request.getEmail());

        return jwtUtil.generateToken(
                request.getEmail(),
                user.getUserType()
        );
    }

    public UserResponse getProfile(String token) {

        log.info("Fetching user profile");

        String jwt = token.substring(7);

        String email = jwtUtil.extractUserEmail(jwt);

        UserCredentials user = credentialsRepo
                .findByUserProfile_Email(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        UserResponse response = new UserResponse();

        response.setDob(user.getUserProfile().getDob());
        response.setEmail(email);
        response.setFirstName(user.getUserProfile().getFirstName());
        response.setLastName(user.getUserProfile().getLastName());
        response.setPhoneNumber(user.getUserProfile().getPhone());
        response.setGender(user.getUserProfile().getGender());
        response.setAddress(user.getUserProfile().getAddress());
        response.setUserId(user.getUserId());
        response.setWallet(user.getUserProfile().getWallet());
        response.setStatus(user.getLoginStatus());

        log.info("Profile fetched successfully for email: {}", email);

        return response;
    }

    public String updateProfile(String token, UserResponse request) {

        String jwt = token.substring(7);
        String email = jwtUtil.extractUserEmail(jwt);

        log.info("Update profile request for email: {}", email);

        UserCredentials user = credentialsRepo
                .findByUserProfile_Email(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        UserProfile profile = user.getUserProfile();

        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setDob(request.getDob());
        profile.setGender(request.getGender());
        profile.setAddress(request.getAddress());

        profileRepo.save(profile);

        log.info("Profile updated successfully for email: {}", email);

        return "Updated Successfully";
    }

    public List<UserResponse> getAllUsers() {

        log.info("Fetching all users");

        List<UserProfile> profiles = profileRepo.findAll();

        log.info("Total users found: {}", profiles.size());

        return profiles.stream().map(profile -> {

            UserResponse res = new UserResponse();

            res.setUserId(profile.getCredentials().getUserId());
            res.setFirstName(profile.getFirstName());
            res.setLastName(profile.getLastName());
            res.setEmail(profile.getEmail());
            res.setPhoneNumber(profile.getPhone());
            res.setDob(profile.getDob());
            res.setGender(profile.getGender());
            res.setAddress(profile.getAddress());
            res.setUserType(profile.getCredentials().getUserType());
            res.setWallet(profile.getWallet());
            res.setStatus(profile.getCredentials().getLoginStatus());

            return res;

        }).toList();
    }

    public String deleteUser(String userId) {

        log.info("Delete user request for userId: {}", userId);

        UserCredentials credentials = credentialsRepo.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (credentials.getUserType().equals("A")) {
            log.warn("Attempt to delete admin userId: {}", userId);
            throw new RuntimeException("Admin cannot be deleted");
        }

        UserProfile profile = credentials.getUserProfile();

        profileRepo.delete(profile);
        credentialsRepo.delete(credentials);

        log.info("User deleted successfully for userId: {}", userId);

        return "User deleted successfully";
    }

    public String update_status(String userId) {

        log.info("Logout request for userId: {}", userId);

        UserCredentials credentials = credentialsRepo.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        credentials.setLoginStatus(0);

        credentialsRepo.save(credentials);

        log.info("User logout successful for userId: {}", userId);

        return "User LogOut SuccessFully";
    }

    @Transactional
    public String transferMoney(String customerId, Double price, String paymentOption) {

        log.info("Payment transfer started. CustomerId: {}, Amount: {}, PaymentOption: {}",
                customerId, price, paymentOption);

        if (customerId == null || price == null || price <= 0 || paymentOption == null || paymentOption.isBlank()) {
            log.error("Invalid payment request. CustomerId: {}, Amount: {}, PaymentOption: {}",
                    customerId, price, paymentOption);
            throw new IllegalArgumentException("Invalid payment request");
        }

        UserCredentials customer = credentialsRepo.findById(customerId)
                .orElseThrow(() -> {
                    log.error("Customer not found. CustomerId: {}", customerId);
                    return new RuntimeException("Customer not found");
                });

        UserCredentials admin = credentialsRepo.findById("admin")
                .orElseThrow(() -> {
                    log.error("Admin account not found");
                    return new RuntimeException("Admin not found");
                });

        Double customerWallet = customer.getUserProfile().getWallet() != null
                ? customer.getUserProfile().getWallet()
                : 0.0;

        Double adminWallet = admin.getUserProfile().getWallet() != null
                ? admin.getUserProfile().getWallet()
                : 0.0;

        if ("wallet".equalsIgnoreCase(paymentOption)) {
            log.info("Wallet payment selected. Customer wallet will be debited and admin wallet credited.");

            if (customerWallet < price) {
                log.warn("Insufficient wallet balance. CustomerId: {}, WalletBalance: {}, Required: {}",
                        customerId, customerWallet, price);
                throw new RuntimeException("Insufficient balance");
            }

            customer.getUserProfile().setWallet(customerWallet - price);
            admin.getUserProfile().setWallet(adminWallet + price);

            log.info("Wallet payment applied successfully. CustomerId: {}, CustomerNewBalance: {}, AdminNewBalance: {}",
                    customerId,
                    customer.getUserProfile().getWallet(),
                    admin.getUserProfile().getWallet());
        }
        else if ("razorpay".equalsIgnoreCase(paymentOption)) {
            log.info("Razorpay payment selected. Only admin wallet will be credited.");

            admin.getUserProfile().setWallet(adminWallet + price);

            log.info("Razorpay payment applied successfully. CustomerId: {}, AdminNewBalance: {}",
                    customerId,
                    admin.getUserProfile().getWallet());
        }
        else {
            log.error("Invalid payment option received. CustomerId: {}, PaymentOption: {}",
                    customerId, paymentOption);
            throw new IllegalArgumentException("Invalid payment option");
        }

        credentialsRepo.save(customer);
        credentialsRepo.save(admin);
        profileRepo.save(customer.getUserProfile());
        profileRepo.save(admin.getUserProfile());

        log.info("Payment transfer completed successfully. CustomerId: {}, Amount: {}, PaymentOption: {}",
                customerId, price, paymentOption);

        return "Wallet updated successfully";
    }


    @Transactional
    public String addWalletMoney(String userId, Double amount) {

        log.info("Wallet top-up request. UserId: {}, Amount: {}", userId, amount);

        UserCredentials user = credentialsRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Double currentWallet =
                user.getUserProfile().getWallet() != null
                        ? user.getUserProfile().getWallet()
                        : 0.0;

        user.getUserProfile().setWallet(currentWallet + amount);

        profileRepo.save(user.getUserProfile());

        log.info("Wallet updated successfully for userId: {}", userId);

        return "Wallet updated successfully";
    }

    public String getUserIdByEmail(String email) {

        log.info("Fetching userId for email: {}", email);

        UserCredentials user = credentialsRepo
                .findByUserProfile_Email(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        log.info("UserId fetched successfully for email: {}", email);

        return user.getUserId();
    }
}