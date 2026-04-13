package com.mphasis.skywaysairline.bookingservice.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mphasis.skywaysairline.bookingservice.models.Passenger;

@Repository
public interface PassengerRepository extends JpaRepository<Passenger, Integer> {
}
