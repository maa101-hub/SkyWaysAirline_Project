package com.mphasis.skywaysairline.userservice.service;

import java.util.List;

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
	
	@Autowired
	private PasswordEncoder passwordEncoder;
    @Autowired
    private UserProfileRepository profileRepo;

    @Autowired
    private UserCredentialsRepository credentialsRepo;
    @Autowired
    private JwtUtil jwtUtil;
    public String register(RegisterRequest request) {

        if (request.getEmail() == null || request.getPassword() == null) {
            throw new BadRequestException("Email and Password are required");
        }

        if (credentialsRepo.findByUserProfile_Email(request.getEmail()).isPresent()) {
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
        Double intial_money=(double) 1000000;
        profile.setWallet(intial_money);
        UserCredentials credentials = new UserCredentials();
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        credentials.setPassword(encodedPassword);

        credentials.setUserType("C");
        credentials.setLoginStatus(1);

        credentials.setUserProfile(profile);
        profile.setCredentials(credentials);

        profileRepo.save(profile);

        return "User Registered Successfully";
    }
    public String login(LoginRequest request) {

        UserCredentials user = credentialsRepo
                .findByUserProfile_Email(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidPasswordException("Invalid password");
        }
        user.setLoginStatus(1);
        credentialsRepo.save(user);
        return jwtUtil.generateToken(request.getEmail(), user.getUserType());
    }
    public UserResponse getProfile(String token) {

        String jwt = token.substring(7); // "Bearer " remove
        String email = jwtUtil.extractUserEmail(jwt);
        UserCredentials user = credentialsRepo
                .findByUserProfile_Email(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
       UserResponse response=new UserResponse();
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
       return response;
        
    }
    public String updateProfile(String token, UserResponse request) {

        String jwt = token.substring(7);
        String email = jwtUtil.extractUserEmail(jwt);

        UserCredentials user = credentialsRepo
                .findByUserProfile_Email(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // ✅ EXISTING PROFILE lo
        UserProfile profile = user.getUserProfile();

        // ✅ Update fields
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setDob(request.getDob());
        profile.setGender(request.getGender());
        profile.setAddress(request.getAddress());
        // ❌ email & password untouched

        profileRepo.save(profile); // ✅ update

        return "Updated Successfully";
    }
    
    //RK
    public List<UserResponse> getAllUsers() {

        List<UserProfile> profiles = profileRepo.findAll();

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
    //RK
    public String deleteUser(String userId) {
        UserCredentials credentials = credentialsRepo.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        if (credentials.getUserType().equals("A")) {
            throw new RuntimeException("Admin cannot be deleted");
        }
        UserProfile profile = credentials.getUserProfile();
        //profile delete
        profileRepo.delete(profile);
        //credentials delete
        credentialsRepo.delete(credentials);
        
        return "User deleted successfully";
    }
    public String update_status(String userId) {
    	 UserCredentials credentials = credentialsRepo.findById(userId)
                 .orElseThrow(() -> new UserNotFoundException("User not found"));
    	credentials.setLoginStatus(0);
    	credentialsRepo.save(credentials);
    	return "User LogOut SuccessFully";
    }
    @Transactional
    public String transferMoney(String customerId, Double price) {

        UserCredentials customer = credentialsRepo.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        UserCredentials admin = credentialsRepo.findById("admin")
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        Double customerWallet = customer.getUserProfile().getWallet() != null ? customer.getUserProfile().getWallet() : 0;
        Double adminWallet = admin.getUserProfile().getWallet() != null ? admin.getUserProfile().getWallet() : 0;

        if (customerWallet < price) {
            throw new RuntimeException("Insufficient balance");
        }

        customer.getUserProfile().setWallet(customerWallet - price);
        admin.getUserProfile().setWallet(adminWallet + price);

        credentialsRepo.save(customer);
        credentialsRepo.save(admin);

        profileRepo.save(customer.getUserProfile());
        profileRepo.save(admin.getUserProfile());
        return "Wallet Updated Succe fully";
    }
    
}