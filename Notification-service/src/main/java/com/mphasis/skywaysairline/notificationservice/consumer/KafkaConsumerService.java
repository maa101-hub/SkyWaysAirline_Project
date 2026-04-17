package com.mphasis.skywaysairline.notificationservice.consumer;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.mphasis.skywaysairline.notificationservice.service.EmailService;


@Service
public class KafkaConsumerService {

    private static final Logger log =
            LoggerFactory.getLogger(KafkaConsumerService.class);

    @Autowired
    private EmailService emailService;

    @KafkaListener(topics = "booking-topic", groupId = "notification-group")
    public void consume(String message) {

        log.info("Kafka Event Received: {}", message);

        try {
            String[] data = message.split("\\|");

            String email = data[0];
            String subject = data[1];
            String body = data[2];

            log.info("Sending email to: {}", email);

            emailService.sendMail(email, subject, body);

            log.info("Kafka event processed successfully");

        } catch (Exception e) {

            log.error("Error processing Kafka message: {}", e.getMessage());
        }
    }
}