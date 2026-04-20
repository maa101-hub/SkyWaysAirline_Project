package com.mphasis.skywaysairline.bookingservice.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mphasis.skywaysairline.bookingservice.models.Reservation;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, String> {
	List<Reservation> findByUserId(String userId);

	List<Reservation> findByScheduleId(String scheduleId);

}
