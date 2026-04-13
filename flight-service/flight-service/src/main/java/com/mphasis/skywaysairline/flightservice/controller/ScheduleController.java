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
import org.springframework.web.bind.annotation.RestController;

import com.mphasis.skywaysairline.flightservice.dto.ScheduleRequest;
import com.mphasis.skywaysairline.flightservice.response.ApiResponse;
import com.mphasis.skywaysairline.flightservice.service.ScheduleService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/schedules")

public class ScheduleController {

    @Autowired
    private ScheduleService service;

    // ADD
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ScheduleRequest>> add(
            @Valid @RequestBody ScheduleRequest dto) {

        return ResponseEntity.ok(
                new ApiResponse<>("Schedule added", service.addSchedule(dto))
        );
    }

    // UPDATE
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ScheduleRequest>> update(
            @PathVariable String id,
            @RequestBody ScheduleRequest dto) {

        return ResponseEntity.ok(
                new ApiResponse<>("Schedule updated", service.updateSchedule(id, dto))
        );
    }

    // GET ALL
    @GetMapping
    public ResponseEntity<ApiResponse<List<ScheduleRequest>>> getAll() {

        return ResponseEntity.ok(
                new ApiResponse<>("Schedules fetched", service.getSchedules())
        );
    }

    // DELETE
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable String id) {

        service.deleteSchedule(id);

        return ResponseEntity.ok(
                new ApiResponse<>("Schedule deleted", "Success")
        );
    }
}