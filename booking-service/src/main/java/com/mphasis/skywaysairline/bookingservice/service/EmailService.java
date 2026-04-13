package com.mphasis.skywaysairline.bookingservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.mphasis.skywaysairline.bookingservice.dto.PassengerDTO;
import com.mphasis.skywaysairline.bookingservice.dto.TicketResponse;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendTicket(String toEmail, TicketResponse ticket) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(toEmail);
        message.setSubject("Flight Booking Confirmation ✈️");

        String body =
                "Booking Confirmed!\n\n" +
                "Reservation ID: " + ticket.getReservationId() + "\n" +
                "Schedule ID: " + ticket.getScheduleId() + "\n" +
                "Journey Date: " + ticket.getJourneyDate() + "\n" +
                "Seats: " + ticket.getNoOfSeats() + "\n" +
                "Total Fare: " + ticket.getTotalFare() + "\n\n" +
                "Passengers:\n";

        for (PassengerDTO p : ticket.getPassengers()) {
            body += p.getName() + " | " + p.getGender() + " | " + p.getAge() + "\n";
        }

        message.setText(body);

        mailSender.send(message);
    }
}