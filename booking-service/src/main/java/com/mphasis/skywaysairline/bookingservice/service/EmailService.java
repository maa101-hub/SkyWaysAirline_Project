package com.mphasis.skywaysairline.bookingservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.mphasis.skywaysairline.bookingservice.dto.PassengerDTO;
import com.mphasis.skywaysairline.bookingservice.dto.TicketResponse;

import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendTicket(String toEmail, TicketResponse ticket) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false);

            helper.setTo(toEmail);
            helper.setSubject("Flight Booking Confirmation");
            helper.setText(buildTicketBody(ticket));

            mailSender.send(message);

        } catch (Exception e) {
            throw new RuntimeException("Failed to send ticket email", e);
        }
    }

    public void sendBoardingPass(String toEmail, MultipartFile boardingPassFile) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(toEmail);
            helper.setSubject("Your SkyWays Boarding Pass");
            helper.setText("Please find your boarding pass attached.");

            helper.addAttachment("boarding-pass.pdf", boardingPassFile);

            mailSender.send(message);

        } catch (Exception e) {
            throw new RuntimeException("Failed to send boarding pass email", e);
        }
    }

    private String buildTicketBody(TicketResponse ticket) {
        StringBuilder body = new StringBuilder();

        body.append("Booking Confirmed!\n\n")
            .append("Reservation ID: ").append(ticket.getReservationId()).append("\n")
            .append("Schedule ID: ").append(ticket.getScheduleId()).append("\n")
            .append("Journey Date: ").append(ticket.getJourneyDate()).append("\n")
            .append("Seats: ").append(ticket.getNoOfSeats()).append("\n")
            .append("Total Fare: ").append(ticket.getTotalFare()).append("\n\n")
            .append("Passengers:\n");

        if (ticket.getPassengers() != null) {
            for (PassengerDTO p : ticket.getPassengers()) {
                body.append(p.getName())
                    .append(" | ")
                    .append(p.getGender())
                    .append(" | ")
                    .append(p.getAge())
                    .append("\n");
            }
        }

        return body.toString();
    }
}
