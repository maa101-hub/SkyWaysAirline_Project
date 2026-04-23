package com.mphasis.skywaysairline.bookingservice.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.mphasis.skywaysairline.bookingservice.dto.FlightResponse;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import java.time.LocalDate;

@Service
public class FlightClient {

    private static final Logger log =
            LoggerFactory.getLogger(FlightClient.class);

    @Autowired
    private RestTemplate restTemplate;

    // 🔹 GET FLIGHT DETAILS
    @CircuitBreaker(
            name = "flightService",
            fallbackMethod = "getFlightDetailsFallback"
    )
    public FlightResponse getFlightDetails(
            String scheduleId) {

        return getFlightDetails(scheduleId, null);
    }

    @CircuitBreaker(
            name = "flightService",
            fallbackMethod = "getFlightDetailsFallback"
    )
    public FlightResponse getFlightDetails(
            String scheduleId,
            LocalDate journeyDate) {

        String url =
                "http://localhost:8089/api/flights/details/"
                        + scheduleId
                        + (journeyDate != null ? "?journeyDate=" + journeyDate : "");

        try {

            log.info(
                    "Calling Flight Service to fetch details. ScheduleId: {}",
                    scheduleId
            );

            FlightResponse response =
                    restTemplate.getForObject(
                            url,
                            FlightResponse.class
                    );

            if (response != null) {

                log.info(
                        "Flight details received successfully. ScheduleId: {}",
                        scheduleId
                );

            } else {

                log.warn(
                        "Flight Service returned null response. ScheduleId: {}",
                        scheduleId
                );
            }

            return response;

        } catch (Exception e) {

            log.error(
                    "Error while fetching flight details. ScheduleId: {}",
                    scheduleId,
                    e
            );

            throw e;
        }
    }

    // 🔥 UPDATE SEATS
    @CircuitBreaker(
            name = "flightService",
            fallbackMethod = "updateSeatsFallback"
    )
    public void updateSeats(
            String scheduleId,
            int seats) {

        String url =
                "http://localhost:8089/api/flights/updateSeats/"
                        + scheduleId
                        + "?seatsBooked="
                        + seats;

        try {

            log.info(
                    "Calling Flight Service to update seats. ScheduleId: {}, SeatsBooked: {}",
                    scheduleId,
                    seats
            );

            restTemplate.put(
                    url,
                    null
            );

            log.info(
                    "Seats updated successfully. ScheduleId: {}",
                    scheduleId
            );

        } catch (Exception e) {

            log.error(
                    "Error while updating seats. ScheduleId: {}, SeatsBooked: {}",
                    scheduleId,
                    seats,
                    e
            );

            throw e;
        }
    }

    // 🔥 RELEASE SEATS (for cancellations)
    @CircuitBreaker(
            name = "flightService",
            fallbackMethod = "releaseSeatFallback"
    )
    public void releaseSeat(
            String scheduleId,
            int seats) {

        String url =
                "http://localhost:8089/api/flights/updateSeats/"
                        + scheduleId
                        + "?seatsBooked="
                        + (-seats);  // Negative value to add seats back

        try {

            log.info(
                    "Calling Flight Service to release seats. ScheduleId: {}, SeatsReleased: {}",
                    scheduleId,
                    seats
            );

            restTemplate.put(
                    url,
                    null
            );

            log.info(
                    "Seats released successfully. ScheduleId: {}",
                    scheduleId
            );

        } catch (Exception e) {

            log.error(
                    "Error while releasing seats. ScheduleId: {}, SeatsReleased: {}",
                    scheduleId,
                    seats,
                    e
            );

            throw e;
        }
    }

    // 🔥 UPDATE SEATS FOR SPECIFIC DATE
    @CircuitBreaker(
            name = "flightService",
            fallbackMethod = "updateSeatsForDateFallback"
    )
    public void updateSeatsForDate(
            String scheduleId,
            LocalDate journeyDate,
            int seatsBooked) {

        String url =
                "http://localhost:8089/api/flights/updateSeatsForDate/"
                        + scheduleId
                        + "?journeyDate=" + journeyDate
                        + "&seatsBooked=" + seatsBooked;

        try {
            log.info(
                    "Calling Flight Service to update seats for date. ScheduleId: {}, JourneyDate: {}, SeatsBooked: {}",
                    scheduleId,
                    journeyDate,
                    seatsBooked
            );

            restTemplate.put(url, null);

            log.info(
                    "Seats updated for date successfully. ScheduleId: {}, JourneyDate: {}",
                    scheduleId,
                    journeyDate
            );
        } catch (Exception e) {
            log.error(
                    "Error while updating seats for date. ScheduleId: {}, JourneyDate: {}, SeatsBooked: {}",
                    scheduleId,
                    journeyDate,
                    seatsBooked,
                    e
            );
            throw e;
        }
    }

    // 🔥 RELEASE SEATS FOR SPECIFIC DATE
    @CircuitBreaker(
            name = "flightService",
            fallbackMethod = "releaseSeatForDateFallback"
    )
    public void releaseSeatForDate(
            String scheduleId,
            LocalDate journeyDate,
            int seatsToRelease) {

        String url =
                "http://localhost:8089/api/flights/releaseSeatsForDate/"
                        + scheduleId
                        + "?journeyDate=" + journeyDate
                        + "&seatsToRelease=" + seatsToRelease;

        try {
            log.info(
                    "Calling Flight Service to release seats for date. ScheduleId: {}, JourneyDate: {}, SeatsReleased: {}",
                    scheduleId,
                    journeyDate,
                    seatsToRelease
            );

            restTemplate.put(url, null);

            log.info(
                    "Seats released for date successfully. ScheduleId: {}, JourneyDate: {}",
                    scheduleId,
                    journeyDate
            );
        } catch (Exception e) {
            log.error(
                    "Error while releasing seats for date. ScheduleId: {}, JourneyDate: {}, SeatsReleased: {}",
                    scheduleId,
                    journeyDate,
                    seatsToRelease,
                    e
            );
            throw e;
        }
    }

    // 🔥 COMPLETE JOURNEY
    @CircuitBreaker(
            name = "flightService",
            fallbackMethod = "completeJourneyFallback"
    )
    public void completeJourney(
            String scheduleId,
            LocalDate journeyDate) {

        String url =
                "http://localhost:8089/api/flights/completeJourney/"
                        + scheduleId
                        + "?journeyDate=" + journeyDate;

        try {
            log.info(
                    "Calling Flight Service to complete journey. ScheduleId: {}, JourneyDate: {}",
                    scheduleId,
                    journeyDate
            );

            restTemplate.put(url, null);

            log.info(
                    "Journey completed successfully. ScheduleId: {}, JourneyDate: {}",
                    scheduleId,
                    journeyDate
            );
        } catch (Exception e) {
            log.error(
                    "Error while completing journey. ScheduleId: {}, JourneyDate: {}",
                    scheduleId,
                    journeyDate,
                    e
            );
            throw e;
        }
    }

    // =====================================
    // FALLBACK METHODS
    // =====================================

    public FlightResponse getFlightDetailsFallback(
            String scheduleId,
            Exception ex) {

        log.error(
                "Fallback triggered for getFlightDetails. ScheduleId: {}",
                scheduleId,
                ex
        );

        FlightResponse response =
                new FlightResponse();

        response.setFare(0.0);
        response.setAvailableSeats(0);

        return response;
    }

        public FlightResponse getFlightDetailsFallback(
                        String scheduleId,
                        LocalDate journeyDate,
                        Exception ex) {

                log.error(
                                "Fallback triggered for getFlightDetails with date. ScheduleId: {}, JourneyDate: {}",
                                scheduleId,
                                journeyDate,
                                ex
                );

                FlightResponse response = new FlightResponse();
                response.setFare(0.0);
                response.setAvailableSeats(0);

                return response;
        }

    public void updateSeatsFallback(
            String scheduleId,
            int seats,
            Exception ex) {

        log.error(
                "Fallback triggered for updateSeats. ScheduleId: {}, Seats: {}",
                scheduleId,
                seats,
                ex
        );

        throw new RuntimeException(
                "Flight Service unavailable. Unable to update seats."
        );
    }

    public void releaseSeatFallback(
            String scheduleId,
            int seats,
            Exception ex) {

        log.error(
                "Fallback triggered for releaseSeat. ScheduleId: {}, Seats: {}",
                scheduleId,
                seats,
                ex
        );

        throw new RuntimeException(
                "Flight Service unavailable. Unable to release seats."
        );
    }

    public void updateSeatsForDateFallback(
            String scheduleId,
            LocalDate journeyDate,
            int seatsBooked,
            Exception ex) {

        log.error(
                "Fallback triggered for updateSeatsForDate. ScheduleId: {}, JourneyDate: {}, SeatsBooked: {}",
                scheduleId,
                journeyDate,
                seatsBooked,
                ex
        );

        throw new RuntimeException("Flight Service unavailable. Unable to update seats for date.");
    }

    public void releaseSeatForDateFallback(
            String scheduleId,
            LocalDate journeyDate,
            int seatsToRelease,
            Exception ex) {

        log.error(
                "Fallback triggered for releaseSeatForDate. ScheduleId: {}, JourneyDate: {}, SeatsReleased: {}",
                scheduleId,
                journeyDate,
                seatsToRelease,
                ex
        );

        throw new RuntimeException("Flight Service unavailable. Unable to release seats for date.");
    }

    public void completeJourneyFallback(
            String scheduleId,
            LocalDate journeyDate,
            Exception ex) {

        log.error(
                "Fallback triggered for completeJourney. ScheduleId: {}, JourneyDate: {}",
                scheduleId,
                journeyDate,
                ex
        );

        throw new RuntimeException("Flight Service unavailable. Unable to complete journey.");
    }
}