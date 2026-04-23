package com.mphasis.skywaysairline.userservice.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mphasis.skywaysairline.userservice.service.AdminNotificationPublisher;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/users/admin/notifications")
public class NotificationController {

    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);

    @Autowired
    private AdminNotificationPublisher publisher;

    @PostMapping("/seat-update")
    public ResponseEntity<String> publishSeatUpdate(@RequestBody Map<String, Object> payload) {
        log.info("Seat update notification API called: {}", payload);

        String action = String.valueOf(payload.getOrDefault("action", "updated"));
        String flightId = String.valueOf(payload.getOrDefault("flightId", ""));
        String scheduleId = String.valueOf(payload.getOrDefault("scheduleId", ""));
        String journeyDate = String.valueOf(payload.getOrDefault("journeyDate", ""));
        int totalSeats = Integer.parseInt(String.valueOf(payload.getOrDefault("totalSeats", 0)));
        int availableSeats = Integer.parseInt(String.valueOf(payload.getOrDefault("availableSeats", 0)));
        int bookedSeats = Integer.parseInt(String.valueOf(payload.getOrDefault("bookedSeats", 0)));

        publisher.publishSeatUpdate(action, flightId, scheduleId, journeyDate, totalSeats, availableSeats, bookedSeats);
        return ResponseEntity.ok("Seat update notification published");
    }
}
