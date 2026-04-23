package com.mphasis.skywaysairline.flightservice.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mphasis.skywaysairline.flightservice.dto.FlightRequest;
import com.mphasis.skywaysairline.flightservice.dto.FlightResponse;
import com.mphasis.skywaysairline.flightservice.dto.FlightSearchRequest;
import com.mphasis.skywaysairline.flightservice.dto.SeatStatusResponse;
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
import com.mphasis.skywaysairline.flightservice.models.ScheduleDetail;
import com.mphasis.skywaysairline.flightservice.client.AdminNotificationClient;
import com.mphasis.skywaysairline.flightservice.repo.FlightRepository;
import com.mphasis.skywaysairline.flightservice.repo.RouteRepository;
import com.mphasis.skywaysairline.flightservice.repo.ScheduleDetailRepository;
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

        @Autowired
        private ScheduleDetailRepository scheduleDetailRepo;

        @Autowired
        private AdminNotificationClient adminNotificationClient;

        private String normalizeDayToken(String token) {
                String value = String.valueOf(token == null ? "" : token)
                                .trim()
                                .toLowerCase(Locale.ROOT);

                return switch (value) {
                        case "monday", "mon" -> "mon";
                        case "tuesday", "tue", "tues" -> "tue";
                        case "wednesday", "wed" -> "wed";
                        case "thursday", "thu", "thur", "thurs" -> "thu";
                        case "friday", "fri" -> "fri";
                        case "saturday", "sat" -> "sat";
                        case "sunday", "sun" -> "sun";
                        default -> value;
                };
        }

        private boolean isScheduleAvailableOnDate(Schedule schedule, java.time.LocalDate journeyDate) {
                if (journeyDate == null) {
                        return true;
                }

                String rawDays = schedule.getAvailableDays();
                if (rawDays == null || rawDays.isBlank()) {
                        return true;
                }

                String selected = normalizeDayToken(journeyDate.getDayOfWeek().name());
                String[] parts = rawDays.split("[,\\s|/]+");

                for (String part : parts) {
                        if (normalizeDayToken(part).equals(selected)) {
                                return true;
                        }
                }

                return false;
        }

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
            String destination,
            java.time.LocalDate journeyDate) {

        log.info(
                "Searching flights by route. Source: {}, Destination: {}, JourneyDate: {}",
                source,
                destination,
                journeyDate
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

                                if (!isScheduleAvailableOnDate(schedule, journeyDate)) {
                                        continue;
                                }

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
                int seatsForThisDate = flight.getSeatingCapacity();

                if (journeyDate != null) {
                    ScheduleDetail scheduleDetail =
                            scheduleDetailRepo.findByScheduleScheduleIdAndJourneyDate(
                                    schedule.getScheduleId(),
                                    journeyDate
                            ).orElseGet(() -> scheduleDetailRepo.save(
                                    new ScheduleDetail(
                                            schedule,
                                            journeyDate,
                                            flight.getSeatingCapacity()
                                    )
                            ));

                    seatsForThisDate = scheduleDetail.getAvailableSeats();
                }

                dto.setSeats(seatsForThisDate);
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

    public SeatStatusResponse getSeatStatus(
            String scheduleId,
            java.time.LocalDate journeyDate) {

        log.info(
                "Fetching seat status. ScheduleId: {}, JourneyDate: {}",
                scheduleId,
                journeyDate
        );

        Schedule schedule =
                scheduleRepo.findById(scheduleId)
                        .orElseThrow(() -> new ScheduleNotFoundException("Schedule not found"));

        if (!isScheduleAvailableOnDate(schedule, journeyDate)) {
            throw new ScheduleNotFoundException("Selected schedule does not operate on this date");
        }

        Flight flight =
                flightRepo.findById(schedule.getFlight().getFlightId())
                        .orElseThrow(() -> new FlightNotFoundException("Flight not found"));

        ScheduleDetail detail =
                scheduleDetailRepo.findByScheduleScheduleIdAndJourneyDate(scheduleId, journeyDate)
                        .orElseGet(() -> scheduleDetailRepo.save(
                                new ScheduleDetail(schedule, journeyDate, flight.getSeatingCapacity())
                        ));

        SeatStatusResponse response = new SeatStatusResponse();
        response.setFlightId(flight.getFlightId());
        response.setScheduleId(scheduleId);
        response.setJourneyDate(journeyDate);
        response.setFlightName(flight.getFlightName());
        response.setSource(schedule.getRoute().getSource());
        response.setDestination(schedule.getRoute().getDestination());
        response.setDepartureTime(schedule.getDepartureTime());
        response.setAvailableDays(schedule.getAvailableDays());
        response.setTotalSeats(detail.getTotalSeats());
        response.setAvailableSeats(detail.getAvailableSeats());
        response.setBookedSeats(Math.max(detail.getTotalSeats() - detail.getAvailableSeats(), 0));
        response.setJourneyCompleted(detail.getIsJourneyCompleted());

        return response;
    }

    // GET FLIGHT DETAILS
    public FlightResponse getFlightDetails(
            String scheduleId) {
        return getFlightDetails(scheduleId, null);
    }

    // GET FLIGHT DETAILS FOR A SPECIFIC DATE
    public FlightResponse getFlightDetails(
            String scheduleId,
            java.time.LocalDate journeyDate) {

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

        int availableSeats = flight.getSeatingCapacity();

        if (journeyDate != null) {
            ScheduleDetail scheduleDetail =
                    scheduleDetailRepo.findByScheduleScheduleIdAndJourneyDate(
                            scheduleId,
                            journeyDate
                    ).orElseGet(() -> {
                        ScheduleDetail detail = new ScheduleDetail(
                                schedule,
                                journeyDate,
                                flight.getSeatingCapacity()
                        );
                        return scheduleDetailRepo.save(detail);
                    });

            availableSeats = scheduleDetail.getAvailableSeats();
        }

        FlightResponse res =
                new FlightResponse();
        res.setFlightId(scheduleId);
        res.setFare(route.getFare());
        res.setAvailableSeats(availableSeats);
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
    public void updateSeats(String scheduleId,int seatsBooked) {

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

    // UPDATE SEATS FOR SPECIFIC DATE (NEW - Daily Tracking)
    public void updateSeatsForDate(
            String scheduleId,
            java.time.LocalDate journeyDate,
            int seatsBooked) {

        log.info(
                "Updating seats for specific date. ScheduleId: {}, JourneyDate: {}, SeatsBooked: {}",
                scheduleId,
                journeyDate,
                seatsBooked
        );

        Schedule schedule =
                scheduleRepo.findById(scheduleId)
                        .orElseThrow(() ->
                                new ScheduleNotFoundException("Schedule not found"));

        ScheduleDetail scheduleDetail =
                scheduleDetailRepo.findByScheduleScheduleIdAndJourneyDate(
                        scheduleId,
                        journeyDate
                ).orElseGet(() -> {
                    ScheduleDetail detail = new ScheduleDetail(
                            schedule,
                            journeyDate,
                            schedule.getFlight().getSeatingCapacity()
                    );
                    return scheduleDetailRepo.save(detail);
                });

        int available = scheduleDetail.getAvailableSeats();

        if (available < seatsBooked) {
            log.warn(
                    "Not enough seats for date. Available: {}, Requested: {}",
                    available,
                    seatsBooked
            );
            throw new SeatsUnavailableException("Not enough seats available for the selected date");
        }

        scheduleDetail.setAvailableSeats(available - seatsBooked);
        scheduleDetailRepo.save(scheduleDetail);

        adminNotificationClient.publishSeatUpdate(
                "BOOKED",
                schedule.getFlight().getFlightId(),
                scheduleId,
                journeyDate,
                scheduleDetail.getTotalSeats(),
                scheduleDetail.getAvailableSeats(),
                scheduleDetail.getTotalSeats() - scheduleDetail.getAvailableSeats()
        );

        log.info(
                "Seats updated for date successfully. Date: {}, Remaining Seats: {}",
                journeyDate,
                scheduleDetail.getAvailableSeats()
        );
    }

    // RELEASE SEATS FOR SPECIFIC DATE (for cancellation)
    public void releaseSeatsForDate(
            String scheduleId,
            java.time.LocalDate journeyDate,
            int seatsToRelease) {

        log.info(
                "Releasing seats for specific date. ScheduleId: {}, JourneyDate: {}, SeatsReleased: {}",
                scheduleId,
                journeyDate,
                seatsToRelease
        );

        ScheduleDetail scheduleDetail =
                scheduleDetailRepo.findByScheduleScheduleIdAndJourneyDate(
                        scheduleId,
                        journeyDate
                ).orElseGet(() -> {
                    Schedule schedule =
                            scheduleRepo.findById(scheduleId)
                                    .orElseThrow(() ->
                                            new ScheduleNotFoundException("Schedule not found"));

                    ScheduleDetail detail = new ScheduleDetail(
                            schedule,
                            journeyDate,
                            schedule.getFlight().getSeatingCapacity()
                    );
                    return scheduleDetailRepo.save(detail);
                });

        // Can't release more seats than the total
        if (scheduleDetail.getAvailableSeats() + seatsToRelease > scheduleDetail.getTotalSeats()) {
            log.warn(
                    "Attempting to release more seats than total. Current: {}, Total: {}",
                    scheduleDetail.getAvailableSeats(),
                    scheduleDetail.getTotalSeats()
            );
            scheduleDetail.setAvailableSeats(scheduleDetail.getTotalSeats());
        } else {
            scheduleDetail.setAvailableSeats(
                    scheduleDetail.getAvailableSeats() + seatsToRelease
            );
        }

        scheduleDetailRepo.save(scheduleDetail);

        adminNotificationClient.publishSeatUpdate(
                "RELEASED",
                scheduleDetail.getSchedule().getFlight().getFlightId(),
                scheduleId,
                journeyDate,
                scheduleDetail.getTotalSeats(),
                scheduleDetail.getAvailableSeats(),
                scheduleDetail.getTotalSeats() - scheduleDetail.getAvailableSeats()
        );

        log.info(
                "Seats released for date successfully. Date: {}, Available Seats after release: {}",
                journeyDate,
                scheduleDetail.getAvailableSeats()
        );
    }

    // COMPLETE JOURNEY - Restore all seats for the date
    public void completeJourney(
            String scheduleId,
            java.time.LocalDate journeyDate) {

        log.info(
                "Completing journey and restoring seats. ScheduleId: {}, JourneyDate: {}",
                scheduleId,
                journeyDate
        );

        ScheduleDetail scheduleDetail =
                scheduleDetailRepo.findByScheduleScheduleIdAndJourneyDate(
                        scheduleId,
                        journeyDate
                ).orElseGet(() -> {
                    Schedule schedule =
                            scheduleRepo.findById(scheduleId)
                                    .orElseThrow(() ->
                                            new ScheduleNotFoundException("Schedule not found"));

                    return scheduleDetailRepo.save(
                            new ScheduleDetail(
                                    schedule,
                                    journeyDate,
                                    schedule.getFlight().getSeatingCapacity()
                            )
                    );
                });

        // Restore all seats to the total capacity
        scheduleDetail.setAvailableSeats(scheduleDetail.getTotalSeats());
        scheduleDetail.setIsJourneyCompleted(1);  // Mark journey as completed
        scheduleDetailRepo.save(scheduleDetail);

        adminNotificationClient.publishSeatUpdate(
                "COMPLETED",
                scheduleDetail.getSchedule().getFlight().getFlightId(),
                scheduleId,
                journeyDate,
                scheduleDetail.getTotalSeats(),
                scheduleDetail.getAvailableSeats(),
                0
        );

        log.info(
                "Journey completed and seats restored. Date: {}, Total Seats: {}",
                journeyDate,
                scheduleDetail.getTotalSeats()
        );
    }

    // INITIALIZE SCHEDULE DETAILS for a range of dates
    public void initializeScheduleDetails(
            String scheduleId,
            java.time.LocalDate startDate,
            java.time.LocalDate endDate) {

        log.info(
                "Initializing schedule details from {} to {} for scheduleId: {}",
                startDate,
                endDate,
                scheduleId
        );

        Schedule schedule =
                scheduleRepo.findById(scheduleId)
                        .orElseThrow(() ->
                                new ScheduleNotFoundException("Schedule not found"));

        int totalCapacity = schedule.getFlight().getSeatingCapacity();
        java.time.LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {

            // Check if ScheduleDetail already exists for this date
            java.util.Optional<ScheduleDetail> existing =
                    scheduleDetailRepo.findByScheduleScheduleIdAndJourneyDate(
                            scheduleId,
                            currentDate
                    );

            if (existing.isEmpty()) {
                ScheduleDetail detail = new ScheduleDetail(
                        schedule,
                        currentDate,
                        totalCapacity
                );
                scheduleDetailRepo.save(detail);
                log.debug("Created schedule detail for date: {}", currentDate);
            }

            currentDate = currentDate.plusDays(1);
        }

        log.info(
                "Schedule details initialization completed for scheduleId: {}",
                scheduleId
        );
    }
}