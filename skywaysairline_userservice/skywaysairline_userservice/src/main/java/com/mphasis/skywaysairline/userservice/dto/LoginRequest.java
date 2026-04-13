package com.mphasis.skywaysairline.userservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LoginRequest {
	@NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
	@NotBlank(message = "Password is required")
    private String password;
    public String getEmail() {
		return email;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public void setEmail(String email) {
		this.email = email;
	}
    
}