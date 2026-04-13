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
import com.mphasis.skywaysairline.flightservice.models.Flight;
import com.mphasis.skywaysairline.flightservice.models.Route;
import com.mphasis.skywaysairline.flightservice.models.Schedule;
import com.mphasis.skywaysairline.flightservice.repo.FlightRepository;
import com.mphasis.skywaysairline.flightservice.repo.RouteRepository;
import com.mphasis.skywaysairline.flightservice.repo.ScheduleRepository;

@Service
public class FlightService {

    @Autowired
    private FlightRepository flightRepo;
    @Autowired
    private RouteRepository routeRepo;
    @Autowired
    private ScheduleRepository scheduleRepo;
    private static final Logger log = LoggerFactory.getLogger(FlightService.class);
    // 🔁 ENTITY → DTO
    private FlightRequest convertToDTO(Flight flight) {
    	FlightRequest dto = new FlightRequest();
        dto.setFlightId(flight.getFlightId());
        dto.setFlightName(flight.getFlightName());
        dto.setSeatingCapacity(flight.getSeatingCapacity());
        dto.setReservationCapacity(flight.getReservationCapacity());
        return dto;
    }

    // 🔁 DTO → ENTITY
    private Flight convertToEntity(FlightRequest dto) {
        Flight flight = new Flight();
        flight.setFlightId(dto.getFlightId());
        flight.setFlightName(dto.getFlightName());
        flight.setSeatingCapacity(dto.getSeatingCapacity());
        flight.setReservationCapacity(dto.getReservationCapacity());
        return flight;
    }

    // ✅ ADD
    public FlightRequest addFlight(FlightRequest dto) {
    	log.info("Adding flight: {}", dto.getFlightName());

        Flight flight = convertToEntity(dto);
        Flight saved = flightRepo.save(flight);

        log.info("Flight saved with id: {}", saved.getFlightId());

        return convertToDTO(saved);
    }

    // ✅ UPDATE
    public FlightRequest updateFlight(String id, FlightRequest dto) {

        Flight existing = flightRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Flight not found"));

        existing.setFlightName(dto.getFlightName());
        existing.setSeatingCapacity(dto.getSeatingCapacity());

        return convertToDTO(flightRepo.save(existing));
    }

    // ✅ DELETE
    public void deleteFlight(String id) {
        flightRepo.deleteById(id);
    }

    // ✅ GET ALL
    public List<FlightRequest> getAllFlights() {
        return flightRepo.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // ✅ SEARCH BY NAME
    public List<FlightRequest> searchByName(String name) {
        return flightRepo.findByFlightNameContaining(name)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }
    //serch basec on source and destination
    public List<FlightSearchRequest> searchFlights(String source, String destination) {

        List<FlightSearchRequest> result = new ArrayList<>();

        // 1. Route find
        List<Route> routes = routeRepo.findBySourceAndDestination(source, destination);
        System.out.print(routes);
        if (routes.isEmpty()) {
            throw new RuntimeException("No routes found");
        }

        for (Route route : routes) {

            // 2. Schedule find
            List<Schedule> schedules = scheduleRepo.findByRouteId(route.getRouteId());

            for (Schedule schedule : schedules) {

                // 3. Flight find
                Flight flight = flightRepo.findById(schedule.getFlight().getFlightId())
                        .orElseThrow(() -> new RuntimeException("Flight not found"));

                // 4. DTO mapping
                FlightSearchRequest dto = new FlightSearchRequest();
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
        

        return result;
    }
    public FlightResponse getFlightDetails(String scheduleId) {

        Schedule schedule = scheduleRepo.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        Route route = routeRepo.findById(schedule.getRoute().getRouteId())
                .orElseThrow(() -> new RuntimeException("Route not found"));

        Flight flight = flightRepo.findById(schedule.getFlight().getFlightId())
                .orElseThrow(() -> new RuntimeException("Flight not found"));

        FlightResponse res = new FlightResponse();
        res.setFare(route.getFare());
        res.setAvailableSeats(flight.getSeatingCapacity());

        return res;
    }
    public void updateSeats(String scheduleId, int seatsBooked) {

        Schedule schedule = scheduleRepo.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        Flight flight = schedule.getFlight();

        int available = flight.getSeatingCapacity();

        if (available < seatsBooked) {
            throw new RuntimeException("Not enough seats");
        }

        flight.setSeatingCapacity(available - seatsBooked);

        flightRepo.save(flight);
    }
}