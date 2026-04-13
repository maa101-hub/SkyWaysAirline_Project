package com.mphasis.skywaysairline.userservice.model;


import org.springframework.stereotype.Repository;

import jakarta.persistence.*;
import lombok.*;

@Entity 
@Table(name = "user_credentials")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Repository
public class UserCredentials {
	@Id
    @Column(name = "user_id")
    private String userId;

    private String password;

    @Column(name = "user_type")
    private String userType; // A (Admin) / C (Customer)

    @Column(name = "login_status")
    private Integer loginStatus;

    // 🔗 One-to-One Mapping
    @OneToOne
    @MapsId 
    @JoinColumn(name = "user_id")
    private UserProfile userProfile;

    public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getUserType() {
		return userType;
	}

	public void setUserType(String userType) {
		this.userType = userType;
	}

	public Integer getLoginStatus() {
		return loginStatus;
	}

	public void setLoginStatus(Integer loginStatus) {
		this.loginStatus = loginStatus;
	}

	public UserProfile getUserProfile() {
		return userProfile;
	}

	public void setUserProfile(UserProfile userProfile) {
		this.userProfile = userProfile;
	}

    
}