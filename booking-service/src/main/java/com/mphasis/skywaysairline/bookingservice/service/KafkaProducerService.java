//package com.mphasis.skywaysairline.bookingservice.service;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.kafka.core.KafkaTemplate;
//import org.springframework.stereotype.Service;
//
//@Service
//public class KafkaProducerService {
//
//	 private static final Logger log =
//	            LoggerFactory.getLogger(KafkaProducerService.class);
//
//    @Autowired
//    private KafkaTemplate<String, String> kafkaTemplate;
//
//    public void sendBookingEvent(String message) {
//
//        kafkaTemplate.send("booking-topic", message);
//
//        log.info("Kafka booking event published: {}", message);
//    }
//}