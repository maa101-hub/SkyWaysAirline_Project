package com.mphasis.skywaysairline.userservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "user_profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {

	@Id
	@GeneratedValue
    @Column(name = "user_id")
    private String userId;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    private LocalDate dob;

    private String gender;

    private String address;

    private String phone;

    @Column(unique = true)
    private String email;
    private double wallet;
    public double getWallet() {
		return wallet;
	}

	public void setWallet(double wallet) {
		this.wallet = wallet;
	}

	// 🔗 One-to-One Mapping
    @OneToOne(mappedBy = "userProfile", cascade = CascadeType.ALL)
    private UserCredentials credentials;

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

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

	public UserCredentials getCredentials() {
		return credentials;
	}

	public void setCredentials(UserCredentials credentials) {
		this.credentials = credentials;
	}
    
}
