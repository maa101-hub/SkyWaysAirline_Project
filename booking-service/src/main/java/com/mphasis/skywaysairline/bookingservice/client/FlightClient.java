package com.mphasis.skywaysairline.bookingservice.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.mphasis.skywaysairline.bookingservice.dto.FlightResponse;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

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

        String url =
                "http://localhost:8089/api/flights/details/"
                        + scheduleId;

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
}