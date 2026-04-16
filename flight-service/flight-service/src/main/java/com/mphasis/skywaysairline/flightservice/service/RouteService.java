package com.mphasis.skywaysairline.flightservice.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mphasis.skywaysairline.flightservice.dto.RouteRequest;
import com.mphasis.skywaysairline.flightservice.exception.InvalidRouteException;
import com.mphasis.skywaysairline.flightservice.exception.RouteAlreadyExistsException;
import com.mphasis.skywaysairline.flightservice.exception.RouteNotFoundException;
import com.mphasis.skywaysairline.flightservice.models.Route;
import com.mphasis.skywaysairline.flightservice.repo.RouteRepository;

@Service
public class RouteService {

    private static final Logger log =
            LoggerFactory.getLogger(RouteService.class);

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

        log.info(
                "Adding route. Source: {}, Destination: {}",
                dto.getSource(),
                dto.getDestination()
        );

        if (dto.getSource().equalsIgnoreCase(dto.getDestination())) {

            log.warn("Source and Destination cannot be same");

            throw new InvalidRouteException(
                    "Source and Destination cannot be same"
            );
        }

        if (routeRepo.existsById(dto.getRouteId())) {

            log.warn(
                    "Route already exists. RouteId: {}",
                    dto.getRouteId()
            );

            throw new RouteAlreadyExistsException(
                    "Route already exists"
            );
        }

        Route saved =
                routeRepo.save(
                        toEntity(dto)
                );

        log.info(
                "Route added successfully. RouteId: {}",
                saved.getRouteId()
        );

        return toDTO(saved);
    }

    // UPDATE
    public RouteRequest updateRoute(
            String id,
            RouteRequest dto) {

        log.info(
                "Updating route. RouteId: {}",
                id
        );

        Route r =
                routeRepo.findById(id)
                        .orElseThrow(() -> {

                            log.warn(
                                    "Route not found. RouteId: {}",
                                    id
                            );

                            return new RouteNotFoundException(
                                    "Route not found"
                            );
                        });

        if (dto.getSource().equalsIgnoreCase(dto.getDestination())) {

            log.warn(
                    "Invalid route update. Source and Destination same"
            );

            throw new InvalidRouteException(
                    "Source and Destination cannot be same"
            );
        }

        r.setSource(dto.getSource());
        r.setDestination(dto.getDestination());
        r.setDistance(dto.getDistance());
        r.setFare(dto.getFare());

        Route updated =
                routeRepo.save(r);

        log.info(
                "Route updated successfully. RouteId: {}",
                id
        );

        return toDTO(updated);
    }

    // DELETE
    public void deleteRoute(String id) {

        log.info(
                "Deleting route. RouteId: {}",
                id
        );

        if (!routeRepo.existsById(id)) {

            log.warn(
                    "Route not found for delete. RouteId: {}",
                    id
            );

            throw new RouteNotFoundException(
                    "Route not found"
            );
        }

        routeRepo.deleteById(id);

        log.info(
                "Route deleted successfully. RouteId: {}",
                id
        );
    }

    // GET ALL
    public List<RouteRequest> getRoutes() {

        log.info("Fetching all routes");

        List<RouteRequest> routes =
                routeRepo.findAll()
                        .stream()
                        .map(this::toDTO)
                        .toList();

        log.info(
                "Routes fetched successfully. Count: {}",
                routes.size()
        );

        return routes;
    }
}