package com.mphasis.skywaysairline.userservice.model;


import java.time.LocalDateTime;

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

	//RK
	@Column(name = "joined_at", updatable = false)
	private LocalDateTime joinedAt;
    
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by")
    private String deletedBy;
    //-RK

    // 🔗 One-to-One Mapping
    @OneToOne
    @MapsId 
    @JoinColumn(name = "user_id")
    private UserProfile userProfile;

    public Boolean getIsDeleted() {
		return isDeleted;
	}

	public void setIsDeleted(Boolean isDeleted) {
		this.isDeleted = isDeleted;
	}

	public LocalDateTime getDeletedAt() {
		return deletedAt;
	}

	public void setDeletedAt(LocalDateTime deletedAt) {
		this.deletedAt = deletedAt;
	}

	public String getDeletedBy() {
		return deletedBy;
	}

	public void setDeletedBy(String deletedBy) {
		this.deletedBy = deletedBy;
	}

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

	public LocalDateTime getJoinedAt() {
		return joinedAt;
	}

	public void setJoinedAt(LocalDateTime joinedAt) {
		this.joinedAt = joinedAt;
	}

	public UserProfile getUserProfile() {
		return userProfile;
	}

	public void setUserProfile(UserProfile userProfile) {
		this.userProfile = userProfile;
	}

    
}