package com.mphasis.skywaysairline.flightservice.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.mphasis.skywaysairline.flightservice.dto.RouteRequest;
import com.mphasis.skywaysairline.flightservice.response.ApiResponse;
import com.mphasis.skywaysairline.flightservice.service.RouteService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/routes")
public class RouteController {

    private static final Logger log =
            LoggerFactory.getLogger(RouteController.class);

    @Autowired
    private RouteService service;

    // ✅ ADD ROUTE
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<RouteRequest>> add(
            @Valid @RequestBody RouteRequest dto) {

        log.info(
                "Add Route API called. Source: {}, Destination: {}",
                dto.getSource(),
                dto.getDestination()
        );

        RouteRequest saved =
                service.addRoute(dto);

        log.info("Route added successfully");

        return ResponseEntity.ok(
                new ApiResponse<>(
                        "Route  added successfully",
                        saved
                )
        );
    }

    // ✅ UPDATE ROUTE
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<RouteRequest> update(
            @PathVariable String id,
            @Valid @RequestBody RouteRequest dto) {

        log.info("Update Route API called for routeId: {}", id);

        RouteRequest updated =
                service.updateRoute(id, dto);

        log.info("Route updated successfully for routeId: {}", id);

        return ResponseEntity.ok(updated);
    }

    // ✅ DELETE ROUTE
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(
            @PathVariable String id) {

        log.info("Delete Route API called for routeId: {}", id);

        service.deleteRoute(id);

        log.info("Route deleted successfully for routeId: {}", id);

        return ResponseEntity.ok(
                "Route Deleted Successfuly"
        );
    }

    // ✅ GET ALL ROUTES
    @GetMapping
    public ResponseEntity<ApiResponse<List<RouteRequest>>> getAllRoutes() {

        log.info("Get All Routes API called");

        List<RouteRequest> routes =
                service.getRoutes();

        log.info(
                "Routes fetched successfully. Count: {}",
                routes.size()
        );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        "Routes fetched",
                        routes
                )
        );
    }
}