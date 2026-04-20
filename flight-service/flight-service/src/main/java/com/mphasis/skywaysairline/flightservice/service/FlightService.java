package com.mphasis.skywaysairline.flightservice.service;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mphasis.skywaysairline.flightservice.dto.FlightRequest;
import com.mphasis.skywaysairline.flightservice.dto.FlightResponse;
import com.mphasis.skywaysairline.flightservice.dto.FlightSearchRequest;
import com.mphasis.skywaysairline.flightservice.exception.FlightAlreadyExistsException;
import com.mphasis.skywaysairline.flightservice.exception.FlightNotFoundException;
import com.mphasis.skywaysairline.flightservice.exception.InvalidFlightDataException;
import com.mphasis.skywaysairline.flightservice.exception.NoRoutesFoundException;
import com.mphasis.skywaysairline.flightservice.exception.RouteNotFoundException;
import com.mphasis.skywaysairline.flightservice.exception.ScheduleNotFoundException;
import com.mphasis.skywaysairline.flightservice.exception.SeatsUnavailableException;
import com.mphasis.skywaysairline.flightservice.models.Flight;
import com.mphasis.skywaysairline.flightservice.models.Route;
import com.mphasis.skywaysairline.flightservice.models.Schedule;
import com.mphasis.skywaysairline.flightservice.repo.FlightRepository;
import com.mphasis.skywaysairline.flightservice.repo.RouteRepository;
import com.mphasis.skywaysairline.flightservice.repo.ScheduleRepository;

@Service
public class FlightService {

    private static final Logger log =
            LoggerFactory.getLogger(FlightService.class);

    @Autowired
    private FlightRepository flightRepo;

    @Autowired
    private RouteRepository routeRepo;

    @Autowired
    private ScheduleRepository scheduleRepo;

    // ENTITY -> DTO
    private FlightRequest convertToDTO(Flight flight) {

        FlightRequest dto = new FlightRequest();

        dto.setFlightId(flight.getFlightId());
        dto.setFlightName(flight.getFlightName());
        dto.setSeatingCapacity(flight.getSeatingCapacity());
        dto.setReservationCapacity(flight.getReservationCapacity());

        return dto;
    }

    // DTO -> ENTITY
    private Flight convertToEntity(FlightRequest dto) {

        Flight flight = new Flight();

        flight.setFlightId(dto.getFlightId());
        flight.setFlightName(dto.getFlightName());
        flight.setSeatingCapacity(dto.getSeatingCapacity());
        flight.setReservationCapacity(dto.getReservationCapacity());

        return flight;
    }

    // ADD
    public FlightRequest addFlight(FlightRequest dto) {

        log.info("Adding flight: {}", dto.getFlightName());

        if (dto.getSeatingCapacity() <= 0) {
            log.warn("Invalid seating capacity");
            throw new InvalidFlightDataException("Invalid seating capacity");
        }

        if (flightRepo.existsById(dto.getFlightId())) {
            log.warn("Flight already exists: {}", dto.getFlightId());
            throw new FlightAlreadyExistsException("Flight already exists");
        }

        Flight saved = flightRepo.save(convertToEntity(dto));

        log.info("Flight saved successfully. FlightId: {}",
                saved.getFlightId());

        return convertToDTO(saved);
    }

    // UPDATE
    public FlightRequest updateFlight(
            String id,
            FlightRequest dto) {

        log.info("Updating flight. FlightId: {}", id);

        Flight existing = flightRepo.findById(id)
                .orElseThrow(() -> {
                    log.warn("Flight not found: {}", id);
                    return new FlightNotFoundException("Flight not found");
                });

        existing.setFlightName(dto.getFlightName());
        existing.setSeatingCapacity(dto.getSeatingCapacity());

        Flight updated = flightRepo.save(existing);

        log.info("Flight updated successfully. FlightId: {}", id);

        return convertToDTO(updated);
    }

    // DELETE
    public void deleteFlight(String id) {

        log.info("Deleting flight. FlightId: {}", id);

        if (!flightRepo.existsById(id)) {
            log.warn("Flight not found for delete: {}", id);
            throw new FlightNotFoundException("Flight not found");
        }

        flightRepo.deleteById(id);

        log.info("Flight deleted successfully. FlightId: {}", id);
    }

    // GET ALL
    public List<FlightRequest> getAllFlights() {

        log.info("Fetching all flights");

        List<FlightRequest> flights =
                flightRepo.findAll()
                        .stream()
                        .map(this::convertToDTO)
                        .toList();

        log.info("Flights fetched successfully. Count: {}",
                flights.size());

        return flights;
    }

    // SEARCH BY NAME
    public List<FlightRequest> searchByName(
            String name) {

        log.info("Searching flights by name: {}", name);

        List<FlightRequest> result =
                flightRepo.findByFlightNameContaining(name)
                        .stream()
                        .map(this::convertToDTO)
                        .toList();

        if (result.isEmpty()) {
            log.warn("No flights found with name: {}", name);
            throw new FlightNotFoundException("No flights found");
        }

        log.info("Flight search completed. Name: {}, Count: {}",
                name,
                result.size());

        return result;
    }

    // SEARCH BY ROUTE
    public List<FlightSearchRequest> searchFlights(
            String source,
            String destination) {

        log.info(
                "Searching flights by route. Source: {}, Destination: {}",
                source,
                destination
        );

        List<FlightSearchRequest> result =
                new ArrayList<>();

        List<Route> routes =
                routeRepo.findBySourceAndDestination(
                        source,
                        destination
                );

        if (routes.isEmpty()) {

            log.warn(
                    "No routes found for Source: {}, Destination: {}",
                    source,
                    destination
            );

            throw new NoRoutesFoundException("No routes found");
        }

        for (Route route : routes) {

            List<Schedule> schedules =
                    scheduleRepo.findByRouteId(
                            route.getRouteId()
                    );

            for (Schedule schedule : schedules) {

                Flight flight =
                        flightRepo.findById(
                                schedule.getFlight()
                                        .getFlightId()
                        )
                        .orElseThrow(() ->
                                new FlightNotFoundException("Flight not found"));

                FlightSearchRequest dto =
                        new FlightSearchRequest();

                dto.setFlightName(flight.getFlightName());
                dto.setSource(route.getSource());
                dto.setDestination(route.getDestination());
                dto.setDepartureTime(schedule.getDepartureTime());
                dto.setFare(route.getFare());
                dto.setSeats(flight.getSeatingCapacity());
                dto.setAvailableDays(schedule.getAvailableDays());
                dto.setTravelDuration(schedule.getTravelDuration());
                dto.setDistance(route.getDistance());
                dto.setFlightId(schedule.getScheduleId());

                result.add(dto);
            }
        }

        log.info(
                "Route search completed successfully. Results: {}",
                result.size()
        );

        return result;
    }

    // GET FLIGHT DETAILS
    public FlightResponse getFlightDetails(
            String scheduleId) {

        log.info(
                "Fetching flight details for ScheduleId: {}",
                scheduleId
        );

        Schedule schedule =
                scheduleRepo.findById(scheduleId)
                        .orElseThrow(() ->
                                new ScheduleNotFoundException("Schedule not found"));

        Route route =
                routeRepo.findById(
                        schedule.getRoute().getRouteId()
                )
                .orElseThrow(() ->
                        new RouteNotFoundException("Route not found"));

        Flight flight =
                flightRepo.findById(
                        schedule.getFlight().getFlightId()
                )
                .orElseThrow(() ->
                        new FlightNotFoundException("Flight not found"));

        FlightResponse res =
                new FlightResponse();
        res.setFlightId(scheduleId);
        res.setFare(route.getFare());
        res.setAvailableSeats(
                flight.getSeatingCapacity()
                
        );
        res.setDepartureTime(schedule.getDepartureTime());
        res.setDestination(route.getDestination());
        res.setDistance(route.getDistance());
        res.setFlightName(flight.getFlightName());
        res.setSource(route.getSource());
        res.setTravelDuration(schedule.getTravelDuration());

        log.info(
                "Flight details fetched successfully for ScheduleId: {}",
                scheduleId
        );

        return res;
    }

    // UPDATE SEATS
    public void updateSeats(
            String scheduleId,
            int seatsBooked) {

        log.info(
                "Updating seats. ScheduleId: {}, SeatsBooked: {}",
                scheduleId,
                seatsBooked
        );

        Schedule schedule =
                scheduleRepo.findById(scheduleId)
                        .orElseThrow(() ->
                                new ScheduleNotFoundException("Schedule not found"));

        Flight flight =
                schedule.getFlight();

        int available =
                flight.getSeatingCapacity();

        if (available < seatsBooked) {

            log.warn(
                    "Not enough seats. Available: {}, Requested: {}",
                    available,
                    seatsBooked
            );

            throw new SeatsUnavailableException("Not enough seats");
        }

        flight.setSeatingCapacity(
                available - seatsBooked
        );

        flightRepo.save(flight);

        log.info(
                "Seats updated successfully. Remaining Seats: {}",
                flight.getSeatingCapacity()
        );
    }
}