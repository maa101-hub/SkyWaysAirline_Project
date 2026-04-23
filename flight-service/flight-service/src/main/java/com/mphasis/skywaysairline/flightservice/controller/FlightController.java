package com.mphasis.skywaysairline.flightservice.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.mphasis.skywaysairline.flightservice.dto.FlightRequest;
import com.mphasis.skywaysairline.flightservice.dto.FlightResponse;
import com.mphasis.skywaysairline.flightservice.dto.FlightSearchRequest;
import com.mphasis.skywaysairline.flightservice.dto.SeatStatusResponse;
import com.mphasis.skywaysairline.flightservice.response.ApiResponse;
import com.mphasis.skywaysairline.flightservice.service.FlightService;

import jakarta.validation.Valid;
import java.time.LocalDate;
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/flights")
public class FlightController {

    private static final Logger log =
            LoggerFactory.getLogger(FlightController.class);

    @Autowired
    private FlightService service;

    // ✅ ADD
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<FlightRequest>> addFlight(
            @Valid @RequestBody FlightRequest dto) {

        log.info("Add Flight API called for flightName: {}", dto.getFlightName());

        FlightRequest saved = service.addFlight(dto);

        log.info("Flight added successfully");

        return ResponseEntity.ok(
                new ApiResponse<>("Flight added successfully", saved)
        );
    }

    // ✅ UPDATE
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<FlightRequest> updateFlight(
            @PathVariable String id,
            @Valid @RequestBody FlightRequest dto) {

        log.info("Update Flight API called for flightId: {}", id);

        FlightRequest updated = service.updateFlight(id, dto);

        log.info("Flight updated successfully for flightId: {}", id);

        return ResponseEntity.ok(updated);
    }

    // ✅ DELETE
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFlight(
            @PathVariable String id) {

        log.info("Delete Flight API called for flightId: {}", id);

        service.deleteFlight(id);

        log.info("Flight deleted successfully for flightId: {}", id);

        return ResponseEntity.ok("Flight deleted successfully");
    }

    // ✅ GET ALL
    @GetMapping
    public ResponseEntity<ApiResponse<List<FlightRequest>>> getAllFlights() {

        log.info("Get All Flights API called");

        List<FlightRequest> flights = service.getAllFlights();

        log.info("Flights fetched successfully. Count: {}", flights.size());

        return ResponseEntity.ok(
                new ApiResponse<>("Flights fetched", flights)
        );
    }

    // ✅ SEARCH BY NAME
    @GetMapping("/searchByName")
    public List<FlightRequest> searchByName(
            @RequestParam String name) {

        log.info("Search Flight By Name API called. Name: {}", name);

        List<FlightRequest> result =
                service.searchByName(name);

        log.info("Search completed for name: {}, Results: {}",
                name, result.size());

        return result;
    }

    // ✅ SEARCH BY ROUTE
    @GetMapping("/searchByRoute")
    public List<FlightSearchRequest> searchByRoute(
            @RequestParam String source,
            @RequestParam String destination,
            @RequestParam(required = false) LocalDate journeyDate) {

        log.info(
                "Search By Route API called. Source: {}, Destination: {}",
                source,
                destination
        );

        List<FlightSearchRequest> result =
                service.searchFlights(source, destination, journeyDate);

        log.info(
                "Route search completed. Source: {}, Destination: {}, Results: {}",
                source,
                destination,
                result.size()
        );

        return result;
    }

    // ✅ DETAILS
    @GetMapping("/details/{scheduleId}")
    public ResponseEntity<FlightResponse> getDetails(
            @PathVariable String scheduleId,
            @RequestParam(required = false) LocalDate journeyDate) {

        log.info("Get Flight Details API called for scheduleId: {}", scheduleId);

        FlightResponse response =
                service.getFlightDetails(scheduleId, journeyDate);

        log.info("Flight details fetched successfully for scheduleId: {}", scheduleId);

        return ResponseEntity.ok(response);
    }

        // ✅ SEAT STATUS BY SCHEDULE + DATE
        @GetMapping("/seat-status/{scheduleId}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<SeatStatusResponse> getSeatStatus(
                        @PathVariable String scheduleId,
                        @RequestParam LocalDate journeyDate) {

                log.info("Get Seat Status API called for scheduleId: {}, journeyDate: {}", scheduleId, journeyDate);

                SeatStatusResponse response = service.getSeatStatus(scheduleId, journeyDate);

                return ResponseEntity.ok(response);
        }

    // ✅ UPDATE SEATS
    @PutMapping("/updateSeats/{scheduleId}")
    public ResponseEntity<String> updateSeats(
            @PathVariable String scheduleId,
            @RequestParam int seatsBooked) {

        log.info(
                "Update Seats API called. ScheduleId: {}, SeatsBooked: {}",
                scheduleId,
                seatsBooked
        );

        service.updateSeats(scheduleId, seatsBooked);

        log.info(
                "Seats updated successfully. ScheduleId: {}, SeatsBooked: {}",
                scheduleId,
                seatsBooked
        );

        return ResponseEntity.ok("Seats updated successfully");
    }

        // ✅ UPDATE SEATS FOR SPECIFIC DATE (NEW - Daily Tracking)
    @PutMapping("/updateSeatsForDate/{scheduleId}")
    public ResponseEntity<String> updateSeatsForDate(
            @PathVariable String scheduleId,
            @RequestParam LocalDate journeyDate,
            @RequestParam int seatsBooked) {

        log.info(
                "Update Seats For Date API called. ScheduleId: {}, JourneyDate: {}, SeatsBooked: {}",
                scheduleId,
                journeyDate,
                seatsBooked
        );

        service.updateSeatsForDate(scheduleId, journeyDate, seatsBooked);

        log.info(
                "Seats updated for date successfully. ScheduleId: {}, JourneyDate: {}, SeatsBooked: {}",
                scheduleId,
                journeyDate,
                seatsBooked
        );

        return ResponseEntity.ok("Seats updated successfully for the selected date");
    }

    // ✅ RELEASE SEATS FOR SPECIFIC DATE (for cancellation)
    @PutMapping("/releaseSeatsForDate/{scheduleId}")
    public ResponseEntity<String> releaseSeatsForDate(
            @PathVariable String scheduleId,
            @RequestParam LocalDate journeyDate,
            @RequestParam int seatsToRelease) {

        log.info(
                "Release Seats For Date API called. ScheduleId: {}, JourneyDate: {}, SeatsReleased: {}",
                scheduleId,
                journeyDate,
                seatsToRelease
        );

        service.releaseSeatsForDate(scheduleId, journeyDate, seatsToRelease);

        log.info(
                "Seats released for date successfully. ScheduleId: {}, JourneyDate: {}, SeatsReleased: {}",
                scheduleId,
                journeyDate,
                seatsToRelease
        );

        return ResponseEntity.ok("Seats released successfully for the selected date");
    }

    // ✅ COMPLETE JOURNEY - Mark journey complete and restore all seats
        @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/completeJourney/{scheduleId}")
    public ResponseEntity<String> completeJourney(
            @PathVariable String scheduleId,
            @RequestParam LocalDate journeyDate) {

        log.info(
                "Complete Journey API called. ScheduleId: {}, JourneyDate: {}",
                scheduleId,
                journeyDate
        );

        service.completeJourney(scheduleId, journeyDate);

        log.info(
                "Journey completed and seats restored. ScheduleId: {}, JourneyDate: {}",
                scheduleId,
                journeyDate
        );

        return ResponseEntity.ok("Journey completed. All seats restored for the selected date");
    }

    // ✅ INITIALIZE SCHEDULE DETAILS for a date range
    @PostMapping("/initializeScheduleDetails/{scheduleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> initializeScheduleDetails(
            @PathVariable String scheduleId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {

        log.info(
                "Initialize Schedule Details API called. ScheduleId: {}, StartDate: {}, EndDate: {}",
                scheduleId,
                startDate,
                endDate
        );

        service.initializeScheduleDetails(scheduleId, startDate, endDate);

        log.info(
                "Schedule details initialized successfully. ScheduleId: {}, StartDate: {}, EndDate: {}",
                scheduleId,
                startDate,
                endDate
        );

        return ResponseEntity.ok("Schedule details initialized successfully");
    }
}