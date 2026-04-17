package com.mphasis.skywaysairline.userservice.dto;

public class OtpVerifyRequest {
    private String identifier;
    private String otp;
	public String getIdentifier() {
		return identifier;
	}
	public void setIdentifier(String identifier) {
		this.identifier = identifier;
	}
	public String getOtp() {
		return otp;
	}
	public void setOtp(String otp) {
		this.otp = otp;
	}
    
}

