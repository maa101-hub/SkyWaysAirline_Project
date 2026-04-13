package com.mphasis.skywaysairline.flightservice.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.mphasis.skywaysairline.flightservice.models.Schedule;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, String> {

	@Query("SELECT s FROM Schedule s WHERE s.route.id = :routeId")
    List<Schedule> findByRouteId(String routeId);
}