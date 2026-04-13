package com.mphasis.skywaysairline.bookingservice.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mphasis.skywaysairline.bookingservice.models.Reservation;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, String> {
}
