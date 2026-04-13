package com.mphasis.skywaysairline.userservice.repo;
import org.springframework.data.jpa.repository.JpaRepository;

import com.mphasis.skywaysairline.userservice.model.UserProfile;

public interface UserProfileRepository extends JpaRepository<UserProfile, String> {
}