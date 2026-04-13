package com.mphasis.skywaysairline.flightservice.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.mphasis.skywaysairline.flightservice.models.Route;

@Repository
public interface RouteRepository extends JpaRepository<Route,String> {
	@Query("SELECT r FROM Route r WHERE r.source = :source AND r.destination = :destination")
	List<Route> findBySourceAndDestination(String source, String destination);
}
