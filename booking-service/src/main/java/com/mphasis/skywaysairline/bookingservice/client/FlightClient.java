package com.mphasis.skywaysairline.bookingservice.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.mphasis.skywaysairline.bookingservice.dto.FlightResponse;

@Service
public class FlightClient {

    @Autowired
    private RestTemplate restTemplate;

    // 🔹 GET FLIGHT DETAILS
    public FlightResponse getFlightDetails(String scheduleId) {

        String url = "http://localhost:8089/api/flights/details/" + scheduleId;

        return restTemplate.getForObject(url, FlightResponse.class);
    }

    // 🔥 UPDATE SEATS
    public void updateSeats(String scheduleId, int seats) {

        String url = "http://localhost:8089/api/flights/updateSeats/"
                + scheduleId + "?seatsBooked=" + seats;

        restTemplate.put(url, null);
    }
}