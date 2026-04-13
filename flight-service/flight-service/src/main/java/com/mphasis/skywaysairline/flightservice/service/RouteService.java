package com.mphasis.skywaysairline.flightservice.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mphasis.skywaysairline.flightservice.dto.RouteRequest;
import com.mphasis.skywaysairline.flightservice.models.Route;
import com.mphasis.skywaysairline.flightservice.repo.RouteRepository;

@Service
public class RouteService {

    @Autowired
    private RouteRepository routeRepo;

    // ENTITY → DTO
    private RouteRequest toDTO(Route r) {
    	RouteRequest dto = new RouteRequest();
        dto.setRouteId(r.getRouteId());
        dto.setSource(r.getSource());
        dto.setDestination(r.getDestination());
        dto.setDistance(r.getDistance());
        dto.setFare(r.getFare());
        return dto;
    }

    // DTO → ENTITY
    private Route toEntity(RouteRequest dto) {
        Route r = new Route();
        r.setRouteId(dto.getRouteId());
        r.setSource(dto.getSource());
        r.setDestination(dto.getDestination());
        r.setDistance(dto.getDistance());
        r.setFare(dto.getFare());
        return r;
    }

    // ADD
    public RouteRequest addRoute(RouteRequest dto) {
        return toDTO(routeRepo.save(toEntity(dto)));
    }

    // UPDATE
    public RouteRequest updateRoute(String id, RouteRequest dto) {
        Route r = routeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Route not found"));

        r.setSource(dto.getSource());
        r.setDestination(dto.getDestination());
        r.setFare(dto.getFare());

        return toDTO(routeRepo.save(r));
    }

    // DELETE
    public void deleteRoute(String id) {
        routeRepo.deleteById(id);
    }

    // GET ALL
    public List<RouteRequest> getRoutes() {
        return routeRepo.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }
}
