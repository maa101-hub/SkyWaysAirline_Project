package com.mphasis.skywaysairline.userservice.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
@Data
public class RegisterRequest {
	@NotBlank(message = "First name is required")
    @Pattern(regexp = "^[A-Za-z]+$", message = "First name must contain only letters")
    private String firstName;
	@NotBlank(message = "Last name is required")
    @Pattern(regexp = "^[A-Za-z]+$", message = "Last name must contain only letters")
    private String lastName;
	@NotNull(message = "Date of birth is required")
    private LocalDate dob;
	@NotBlank(message = "Gender is required")
    private String gender;
	@NotBlank(message = "Address is required")
    private String address;
	@NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    private String phone;
	@NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
	@NotBlank(message = "Password is required")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!]).{8,}$",
        message = "Password must be 8+ chars with upper, lower, number & special character"
    )
    private String password;
	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public LocalDate getDob() {
		return dob;
	}

	public void setDob(LocalDate dob) {
		this.dob = dob;
	}

	public String getGender() {
		return gender;
	}

	public void setGender(String gender) {
		this.gender = gender;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}
    
}
