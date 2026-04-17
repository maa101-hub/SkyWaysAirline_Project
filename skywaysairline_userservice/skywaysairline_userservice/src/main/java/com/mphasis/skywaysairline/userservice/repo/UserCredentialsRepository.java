package com.mphasis.skywaysairline.userservice.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mphasis.skywaysairline.userservice.model.UserCredentials;

@Repository
public interface UserCredentialsRepository extends JpaRepository<UserCredentials, String> {

    @Query("SELECT u FROM UserCredentials u LEFT JOIN u.userProfile u_0 WHERE u_0.email = :email")
    Optional<UserCredentials> findByUserProfile_Email(String email);

    @Query("""
        SELECT u
        FROM UserCredentials u
        WHERE LOWER(u.userProfile.email) = LOWER(:identifier)
           OR u.userProfile.phone = :identifier
    """)
    Optional<UserCredentials> findByEmailOrMobile(@Param("identifier") String identifier);
}
