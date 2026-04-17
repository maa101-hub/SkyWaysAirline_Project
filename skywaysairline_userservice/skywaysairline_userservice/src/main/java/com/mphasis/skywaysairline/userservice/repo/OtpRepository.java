package com.mphasis.skywaysairline.userservice.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mphasis.skywaysairline.userservice.model.OtpDetails;

@Repository
public interface OtpRepository extends JpaRepository<OtpDetails, Long> {

    Optional<OtpDetails> findTopByIdentifierAndPurposeAndUsedFalseOrderByIdDesc(
            String identifier,
            String purpose
    );
}


