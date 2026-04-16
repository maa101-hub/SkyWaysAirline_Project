package com.mphasis.skywaysairline.flightservice.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mphasis.skywaysairline.flightservice.dto.ScheduleRequest;
import com.mphasis.skywaysairline.flightservice.exception.FlightNotFoundException;
import com.mphasis.skywaysairline.flightservice.exception.InvalidScheduleException;
import com.mphasis.skywaysairline.flightservice.exception.RouteNotFoundException;
import com.mphasis.skywaysairline.flightservice.exception.ScheduleAlreadyExistsException;
import com.mphasis.skywaysairline.flightservice.exception.ScheduleNotFoundException;
import com.mphasis.skywaysairline.flightservice.models.Flight;
import com.mphasis.skywaysairline.flightservice.models.Route;
import com.mphasis.skywaysairline.flightservice.models.Schedule;
import com.mphasis.skywaysairline.flightservice.repo.FlightRepository;
import com.mphasis.skywaysairline.flightservice.repo.RouteRepository;
import com.mphasis.skywaysairline.flightservice.repo.ScheduleRepository;

@Service
public class ScheduleService {

    private static final Logger log =
            LoggerFactory.getLogger(ScheduleService.class);

    @Autowired
    private ScheduleRepository scheduleRepo;

    @Autowired
    private FlightRepository flightRepo;

    @Autowired
    private RouteRepository routeRepo;

    // ENTITY → DTO
    private ScheduleRequest toDTO(Schedule s) {

        ScheduleRequest dto =
                new ScheduleRequest();

        dto.setScheduleId(s.getScheduleId());
        dto.setFlightId(s.getFlight().getFlightId());
        dto.setRouteId(s.getRoute().getRouteId());
        dto.setTravelDuration(s.getTravelDuration());
        dto.setAvailableDays(s.getAvailableDays());
        dto.setDepartureTime(s.getDepartureTime());

        return dto;
    }

    // DTO → ENTITY
    private Schedule toEntity(
            ScheduleRequest dto) {

        log.debug(
                "Converting DTO to entity. ScheduleId: {}",
                dto.getScheduleId()
        );

        Schedule s =
                new Schedule();

        s.setScheduleId(dto.getScheduleId());
        s.setTravelDuration(dto.getTravelDuration());
        s.setAvailableDays(dto.getAvailableDays());
        s.setDepartureTime(dto.getDepartureTime());

        if (dto.getDepartureTime() == null) {

            log.warn("Departure time missing");

            throw new InvalidScheduleException(
                    "Departure time is required"
            );
        }

        // VALIDATE FLIGHT
        Flight flight =
                flightRepo.findById(
                        dto.getFlightId()
                )
                .orElseThrow(() -> {

                    log.warn(
                            "Invalid Flight ID: {}",
                            dto.getFlightId()
                    );

                    return new FlightNotFoundException(
                            "Invalid Flight ID"
                    );
                });

        // VALIDATE ROUTE
        Route route =
                routeRepo.findById(
                        dto.getRouteId()
                )
                .orElseThrow(() -> {

                    log.warn(
                            "Invalid Route ID: {}",
                            dto.getRouteId()
                    );

                    return new RouteNotFoundException(
                            "Invalid Route ID"
                    );
                });

        s.setFlight(flight);
        s.setRoute(route);

        return s;
    }

    // ADD
    public ScheduleRequest addSchedule(
            ScheduleRequest dto) {

        log.info(
                "Adding schedule. ScheduleId: {}",
                dto.getScheduleId()
        );

        if (scheduleRepo.existsById(
                dto.getScheduleId())) {

            log.warn(
                    "Schedule already exists. ScheduleId: {}",
                    dto.getScheduleId()
            );

            throw new ScheduleAlreadyExistsException(
                    "Schedule already exists"
            );
        }

        Schedule saved =
                scheduleRepo.save(
                        toEntity(dto)
                );

        log.info(
                "Schedule added successfully. ScheduleId: {}",
                saved.getScheduleId()
        );

        return toDTO(saved);
    }

    // UPDATE
    public ScheduleRequest updateSchedule(
            String id,
            ScheduleRequest dto) {

        log.info(
                "Updating schedule. ScheduleId: {}",
                id
        );

        Schedule existing =
                scheduleRepo.findById(id)
                        .orElseThrow(() -> {

                            log.warn(
                                    "Schedule not found. ScheduleId: {}",
                                    id
                            );

                            return new ScheduleNotFoundException(
                                    "Schedule not found"
                            );
                        });

        existing.setTravelDuration(
                dto.getTravelDuration()
        );
        existing.setAvailableDays(
                dto.getAvailableDays()
        );
        existing.setDepartureTime(
                dto.getDepartureTime()
        );

        // UPDATE FLIGHT
        if (dto.getFlightId() != null) {

            Flight flight =
                    flightRepo.findById(
                            dto.getFlightId()
                    )
                    .orElseThrow(() -> {

                        log.warn(
                                "Flight not found. FlightId: {}",
                                dto.getFlightId()
                        );

                        return new FlightNotFoundException(
                                "Invalid Flight ID"
                        );
                    });

            existing.setFlight(flight);
        }

        // UPDATE ROUTE
        if (dto.getRouteId() != null) {

            Route route =
                    routeRepo.findById(
                            dto.getRouteId()
                    )
                    .orElseThrow(() -> {

                        log.warn(
                                "Route not found. RouteId: {}",
                                dto.getRouteId()
                        );

                        return new RouteNotFoundException(
                                "Invalid Route ID"
                        );
                    });

            existing.setRoute(route);
        }

        Schedule updated =
                scheduleRepo.save(existing);

        log.info(
                "Schedule updated successfully. ScheduleId: {}",
                id
        );

        return toDTO(updated);
    }

    // DELETE
    public void deleteSchedule(
            String id) {

        log.info(
                "Deleting schedule. ScheduleId: {}",
                id
        );

        if (!scheduleRepo.existsById(id)) {

            log.warn(
                    "Schedule not found for delete. ScheduleId: {}",
                    id
            );

            throw new ScheduleNotFoundException(
                    "Schedule not found"
            );
        }

        scheduleRepo.deleteById(id);

        log.info(
                "Schedule deleted successfully. ScheduleId: {}",
                id
        );
    }

    // GET ALL
    public List<ScheduleRequest> getSchedules() {

        log.info("Fetching all schedules");

        List<ScheduleRequest> schedules =
                scheduleRepo.findAll()
                        .stream()
                        .map(this::toDTO)
                        .toList();

        log.info(
                "Schedules fetched successfully. Count: {}",
                schedules.size()
        );

        return schedules;
    }
}