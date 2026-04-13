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

import com.mphasis.skywaysairline.flightservice.dto.RouteRequest;
import com.mphasis.skywaysairline.flightservice.response.ApiResponse;
import com.mphasis.skywaysairline.flightservice.service.RouteService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/routes")
public class RouteController {

    @Autowired
    private RouteService service;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<RouteRequest>> add(@Valid @RequestBody RouteRequest dto) {
    	RouteRequest saved = service.addRoute(dto);

        return ResponseEntity.ok(
                new ApiResponse<>("Route  added successfully", saved)
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<RouteRequest> update(@PathVariable String id,
                           @Valid @RequestBody RouteRequest dto) {
    	return ResponseEntity.ok(service.updateRoute(id, dto));
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable String id) {
        service.deleteRoute(id);
        return ResponseEntity.ok("Route Deleted Successfuly");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RouteRequest>>> getAllRoutes() {

        return ResponseEntity.ok(
                new ApiResponse<>("Routes fetched", service.getRoutes())
        );
    }
}