package com.mphasis.skywaysairline.userservice.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.mphasis.skywaysairline.userservice.dto.LoginRequest;
import com.mphasis.skywaysairline.userservice.dto.DeleteRequestEventRequest;
import com.mphasis.skywaysairline.userservice.dto.OtpVerifyRequest;
import com.mphasis.skywaysairline.userservice.dto.RegisterRequest;
import com.mphasis.skywaysairline.userservice.dto.ResetPasswordRequest;
import com.mphasis.skywaysairline.userservice.dto.UserResponse;
import com.mphasis.skywaysairline.userservice.exception.BadRequestException;
import com.mphasis.skywaysairline.userservice.exception.InvalidPasswordException;
import com.mphasis.skywaysairline.userservice.exception.UserAlreadyExistsException;
import com.mphasis.skywaysairline.userservice.exception.UserNotFoundException;
import com.mphasis.skywaysairline.userservice.model.OtpDetails;
import com.mphasis.skywaysairline.userservice.model.UserCredentials;
import com.mphasis.skywaysairline.userservice.model.UserProfile;
import com.mphasis.skywaysairline.userservice.repo.OtpRepository;
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
    private OtpRepository otpRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AdminNotificationPublisher adminNotificationPublisher;

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
        credentials.setJoinedAt(LocalDateTime.now());

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
        
        //RK
        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            log.warn("Login blocked for deleted user: {}", request.getEmail());
            throw new RuntimeException("Account deleted");
        }
        //-RK

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
        
        response.setJoinedAt(user.getJoinedAt());

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
            //RK
            res.setJoinedAt(profile.getCredentials().getJoinedAt());
            res.setIsDeleted(Boolean.TRUE.equals(profile.getCredentials().getIsDeleted()));
            res.setDeletedAt(profile.getCredentials().getDeletedAt());
            res.setDeletedBy(profile.getCredentials().getDeletedBy());
            //-RK

            return res;

        }).toList();
    }


    //RK
    @Transactional
    public String deleteUser(String userId) {

        log.info("Delete user request for userId: {}", userId);

        UserCredentials credentials = credentialsRepo.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if ("A".equals(credentials.getUserType())) {
            log.warn("Attempt to delete admin userId: {}", userId);
            throw new RuntimeException("Admin cannot be deleted");
        }

        credentials.setIsDeleted(true);
        credentials.setDeletedAt(LocalDateTime.now());
        credentials.setDeletedBy("Admin");
        credentials.setLoginStatus(0); // force logout/inactive

        credentialsRepo.save(credentials);

        adminNotificationPublisher.publishUserDeleted(
                credentials.getUserId(),
                credentials.getUserProfile().getFirstName() + " " + credentials.getUserProfile().getLastName()
        );

        log.info("User soft-deleted successfully for userId: {}", userId);
        return "User deleted successfully";
    }
    //-RK

    public String publishDeleteRequestEvent(DeleteRequestEventRequest request) {

        if (request == null || request.getUserId() == null || request.getUserId().isBlank()) {
            throw new BadRequestException("userId is required");
        }

        adminNotificationPublisher.publishDeleteRequest(
                request.getUserId(),
                request.getName(),
                request.getEmail(),
                request.getReason()
        );

        return "Delete request event published";
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

        UserCredentials admin = credentialsRepo.findById("admin123")
                .or(() -> credentialsRepo.findById("admin"))
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
    //otp
    public String generateLoginOtp(String identifier) {

        log.info("Generate login OTP request received for identifier: {}", identifier);

        UserCredentials user = credentialsRepo.findByEmailOrMobile(identifier)
                .orElseThrow(() -> {
                    log.warn("User not found for identifier: {}", identifier);
                    return new RuntimeException("User not found");
                });

        log.info("User found. UserId: {}", user.getUserId());

        String otp = String.valueOf((int) (100000 + Math.random() * 900000));

        log.debug("OTP generated for identifier {} : {}", identifier, otp);

        OtpDetails otpDetails = new OtpDetails();
        otpDetails.setIdentifier(identifier);
        otpDetails.setOtp(otp);
        otpDetails.setPurpose("LOGIN");
        otpDetails.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        otpDetails.setUsed(false);

        otpRepository.save(otpDetails);

        log.info("OTP saved successfully for identifier: {}", identifier);
        log.info("OTP expires at: {}", otpDetails.getExpiryTime());

        return "OTP sent successfully";
    }

    public String verifyLoginOtp(OtpVerifyRequest request) {

        log.info("Verify OTP request received for identifier: {}", request.getIdentifier());

        OtpDetails otpDetails = otpRepository
                .findTopByIdentifierAndPurposeAndUsedFalseOrderByIdDesc(
                        request.getIdentifier(),
                        "LOGIN"
                )
                .orElseThrow(() -> {
                    log.warn("OTP not found for identifier: {}", request.getIdentifier());
                    return new RuntimeException("OTP not found");
                });

        log.info("OTP record found for identifier: {}", request.getIdentifier());

        if (otpDetails.getExpiryTime().isBefore(LocalDateTime.now())) {
            log.warn("OTP expired for identifier: {}", request.getIdentifier());
            throw new RuntimeException("OTP expired");
        }

        if (!otpDetails.getOtp().equals(request.getOtp())) {
            log.warn("Invalid OTP entered for identifier: {}", request.getIdentifier());
            throw new RuntimeException("Invalid OTP");
        }

        log.info("OTP verified successfully for identifier: {}", request.getIdentifier());

        otpDetails.setUsed(true);
        otpRepository.save(otpDetails);

        log.info("OTP marked as used for identifier: {}", request.getIdentifier());

        UserCredentials user = credentialsRepo.findByEmailOrMobile(request.getIdentifier())
                .orElseThrow(() -> {
                    log.warn("User not found after OTP verification for identifier: {}", request.getIdentifier());
                    return new RuntimeException("User not found");
                });
        //RK
        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            log.warn("OTP login blocked for deleted user: {}", request.getIdentifier());
            throw new RuntimeException("Account deleted");
        }
        //-RK

        String email = user.getUserProfile().getEmail();
        String role = user.getUserType();

        log.info("Generating JWT token for email: {}, role: {}", email, role);

        String token = jwtUtil.generateToken(email, role);

        log.info("JWT token generated successfully for identifier: {}", request.getIdentifier());

        return token;
    }
    public String generateForgotPasswordOtp(String email) {

        log.info("Generate forgot password OTP request received for email: {}", email);

        UserCredentials user = credentialsRepo.findByUserProfile_Email(email)
                .orElseThrow(() -> {
                    log.warn("User not found for email: {}", email);
                    return new RuntimeException("User not found");
                });

        log.info("User found for forgot password. UserId: {}", user.getUserId());

        String otp = String.valueOf((int) (100000 + Math.random() * 900000));

        OtpDetails otpDetails = new OtpDetails();
        otpDetails.setIdentifier(email);
        otpDetails.setOtp(otp);
        otpDetails.setPurpose("FORGOT_PASSWORD");
        otpDetails.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        otpDetails.setUsed(false);

        otpRepository.save(otpDetails);
        log.info("ForGot Password Otp is: {} ",otp);
        log.info("Forgot password OTP saved successfully for email: {}", email);
        log.info("Forgot password OTP expires at: {}", otpDetails.getExpiryTime());

        return "OTP sent successfully";
    }

    public String verifyForgotPasswordOtp(OtpVerifyRequest request) {

        log.info("Verify forgot password OTP request received for identifier: {}", request.getIdentifier());

        OtpDetails otpDetails = otpRepository
                .findTopByIdentifierAndPurposeAndUsedFalseOrderByIdDesc(
                        request.getIdentifier(),
                        "FORGOT_PASSWORD"
                )
                .orElseThrow(() -> {
                    log.warn("Forgot password OTP not found for identifier: {}", request.getIdentifier());
                    return new RuntimeException("OTP not found");
                });

        if (otpDetails.getExpiryTime().isBefore(LocalDateTime.now())) {
            log.warn("Forgot password OTP expired for identifier: {}", request.getIdentifier());
            throw new RuntimeException("OTP expired");
        }

        if (!otpDetails.getOtp().equals(request.getOtp())) {
            log.warn("Invalid forgot password OTP entered for identifier: {}", request.getIdentifier());
            throw new RuntimeException("Invalid OTP");
        }

        log.info("Forgot password OTP verified successfully for identifier: {}", request.getIdentifier());

        return "OTP verified successfully";
    }

    @Transactional
    public String updatePasswordAfterOtpVerification(ResetPasswordRequest request) {

        log.info("Update password after OTP verification request received for email: {}", request.getEmail());

        OtpDetails otpDetails = otpRepository
                .findTopByIdentifierAndPurposeAndUsedFalseOrderByIdDesc(
                        request.getEmail(),
                        "FORGOT_PASSWORD"
                )
                .orElseThrow(() -> {
                    log.warn("Forgot password OTP not found for email: {}", request.getEmail());
                    return new RuntimeException("OTP not found");
                });

        if (otpDetails.getExpiryTime().isBefore(LocalDateTime.now())) {
            log.warn("Forgot password OTP expired for email: {}", request.getEmail());
            throw new RuntimeException("OTP expired");
        }

        if (!otpDetails.getOtp().equals(request.getOtp())) {
            log.warn("Invalid forgot password OTP entered for email: {}", request.getEmail());
            throw new RuntimeException("Invalid OTP");
        }

        UserCredentials user = credentialsRepo.findByUserProfile_Email(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("User not found for email: {}", request.getEmail());
                    return new RuntimeException("User not found");
                });

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        credentialsRepo.save(user);

        otpDetails.setUsed(true);
        otpRepository.save(otpDetails);

        log.info("Password updated successfully for email: {}", request.getEmail());

        return "Password updated successfully";
    }


}