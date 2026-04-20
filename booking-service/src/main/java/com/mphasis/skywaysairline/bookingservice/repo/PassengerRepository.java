package com.mphasis.skywaysairline.bookingservice.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mphasis.skywaysairline.bookingservice.models.Passenger;
import java.util.Collection;
import java.util.List;

@Repository
public interface PassengerRepository extends JpaRepository<Passenger, Integer> {

    List<Passenger> findByReservationId(String reservationId);

    List<Passenger> findByReservationIdIn(Collection<String> reservationIds);
}
