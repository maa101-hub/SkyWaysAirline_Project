package com.mphasis.skywaysairline.flightservice.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.mphasis.skywaysairline.flightservice.dto.ScheduleRequest;
import com.mphasis.skywaysairline.flightservice.response.ApiResponse;
import com.mphasis.skywaysairline.flightservice.service.ScheduleService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private static final Logger log =
            LoggerFactory.getLogger(ScheduleController.class);

    @Autowired
    private ScheduleService service;

    // ✅ ADD
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ScheduleRequest>> add(
            @Valid @RequestBody ScheduleRequest dto) {

        log.info("Add Schedule API called");

        ScheduleRequest saved =
                service.addSchedule(dto);

        log.info("Schedule added successfully");

        return ResponseEntity.ok(
                new ApiResponse<>(
                        "Schedule added",
                        saved
                )
        );
    }

    // ✅ UPDATE
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ScheduleRequest>> update(
            @PathVariable String id,
            @Valid @RequestBody ScheduleRequest dto) {

        log.info("Update Schedule API called for scheduleId: {}", id);

        ScheduleRequest updated =
                service.updateSchedule(id, dto);

        log.info("Schedule updated successfully for scheduleId: {}", id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        "Schedule updated",
                        updated
                )
        );
    }

    // ✅ GET ALL
    @GetMapping
    public ResponseEntity<ApiResponse<List<ScheduleRequest>>> getAll() {

        log.info("Get All Schedules API called");

        List<ScheduleRequest> schedules =
                service.getSchedules();

        log.info(
                "Schedules fetched successfully. Count: {}",
                schedules.size()
        );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        "Schedules fetched",
                        schedules
                )
        );
    }

    // ✅ DELETE
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> delete(
            @PathVariable String id) {

        log.info("Delete Schedule API called for scheduleId: {}", id);

        service.deleteSchedule(id);

        log.info("Schedule deleted successfully for scheduleId: {}", id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        "Schedule deleted",
                        "Success"
                )
        );
    }
}