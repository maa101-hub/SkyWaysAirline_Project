package com.mphasis.skywaysairline.flightservice.client;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AdminNotificationClient {

    private static final Logger log = LoggerFactory.getLogger(AdminNotificationClient.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_DATE;

    @Autowired
    private RestTemplate restTemplate;

    public void publishSeatUpdate(
            String action,
            String flightId,
            String scheduleId,
            LocalDate journeyDate,
            int totalSeats,
            int availableSeats,
            int bookedSeats) {

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "SEAT_UPDATE");
            payload.put("action", action);
            payload.put("flightId", flightId);
            payload.put("scheduleId", scheduleId);
            payload.put("journeyDate", journeyDate != null ? journeyDate.format(DATE_FORMATTER) : null);
            payload.put("totalSeats", totalSeats);
            payload.put("availableSeats", availableSeats);
            payload.put("bookedSeats", bookedSeats);
            payload.put("requestedAt", java.time.LocalDateTime.now().toString());

            String url = "http://localhost:8082/api/users/admin/notifications/seat-update";
            restTemplate.postForEntity(url, payload, String.class);

            log.info("Seat update notification published. action={}, scheduleId={}, journeyDate={}", action, scheduleId, journeyDate);
        } catch (Exception ex) {
            log.error("Failed to publish seat update notification", ex);
        }
    }
}
