package com.mphasis.skywaysairline.notificationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
public class NotificationServiceApplication {

    private static final Logger log =
            LoggerFactory.getLogger(NotificationServiceApplication.class);

    public static void main(String[] args) {

        log.info("Starting Notification Service...");

        SpringApplication.run(NotificationServiceApplication.class, args);

        log.info("Notification Service Started Successfully on Port 8084");
    }
}
