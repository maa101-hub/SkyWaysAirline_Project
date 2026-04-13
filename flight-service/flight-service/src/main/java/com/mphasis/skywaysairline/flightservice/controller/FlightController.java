package com.mphasis.skywaysairline.flightservice.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mphasis.skywaysairline.flightservice.dto.FlightRequest;
import com.mphasis.skywaysairline.flightservice.dto.FlightResponse;
import com.mphasis.skywaysairline.flightservice.dto.FlightSearchRequest;
import com.mphasis.skywaysairline.flightservice.response.ApiResponse;
import com.mphasis.skywaysairline.flightservice.service.FlightService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/flights")
public class FlightController {

    @Autowired
    private FlightService service;

    // ✅ ADD
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<FlightRequest>> addFlight(
            @Valid @RequestBody FlightRequest dto) {

        FlightRequest saved = service.addFlight(dto);

        return ResponseEntity.ok(
                new ApiResponse<>("Flight added successfully", saved)
        );
    }

    // ✅ UPDATE
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<FlightRequest> updateFlight(
            @PathVariable String id,
            @RequestBody FlightRequest dto) {

        return ResponseEntity.ok(service.updateFlight(id, dto));
    }

    // ✅ DELETE
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFlight(@PathVariable String id) {
        service.deleteFlight(id);
        return ResponseEntity.ok("Flight deleted successfully");
    }

    // ✅ GET ALL
    @GetMapping
    public ResponseEntity<ApiResponse<List<FlightRequest>>> getAllFlights() {

        return ResponseEntity.ok(
                new ApiResponse<>("Flights fetched", service.getAllFlights())
        );
    }

    // ✅ SEARCH
    @GetMapping("/searchByName")
    public List<FlightRequest> searchByName(@RequestParam String name) {
        return service.searchByName(name);
    }
    @GetMapping("/searchByRoute")
    public List<FlightSearchRequest> searchByRoute(
            @RequestParam String source,
            @RequestParam String destination) {

        return service.searchFlights(source, destination);
    }
    @GetMapping("/details/{scheduleId}")
    public ResponseEntity<FlightResponse> getDetails(@PathVariable String scheduleId) {

        return ResponseEntity.ok(service.getFlightDetails(scheduleId));
    }
    @PutMapping("/updateSeats/{scheduleId}")
    public ResponseEntity<String> updateSeats(
            @PathVariable String scheduleId,
            @RequestParam int seatsBooked) {
    	service.updateSeats(scheduleId, seatsBooked);

        return ResponseEntity.ok("Seats updated successfully");
    }
}