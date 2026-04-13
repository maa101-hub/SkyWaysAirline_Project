package com.mphasis.skywaysairline.flightservice.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.mphasis.skywaysairline.flightservice.models.Flight;

@Repository
public interface FlightRepository extends JpaRepository<Flight,String> {
	@Query("SELECT f FROM Flight f WHERE f.flightName LIKE :name ESCAPE '\\'")
	List<Flight> findByFlightNameContaining(String name);
}
