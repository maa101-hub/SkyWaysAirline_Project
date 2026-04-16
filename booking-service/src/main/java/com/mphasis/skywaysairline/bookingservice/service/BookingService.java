package com.mphasis.skywaysairline.bookingservice.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mphasis.skywaysairline.bookingservice.client.FlightClient;
import com.mphasis.skywaysairline.bookingservice.client.UserClient;
import com.mphasis.skywaysairline.bookingservice.dto.BookingRequest;
import com.mphasis.skywaysairline.bookingservice.dto.FlightResponse;
import com.mphasis.skywaysairline.bookingservice.dto.PassengerDTO;
import com.mphasis.skywaysairline.bookingservice.dto.PaymentConfirmRequest;
import com.mphasis.skywaysairline.bookingservice.dto.TicketResponse;
import com.mphasis.skywaysairline.bookingservice.exception.FlightFullException;
import com.mphasis.skywaysairline.bookingservice.exception.PaymentFailedException;
import com.mphasis.skywaysairline.bookingservice.models.Passenger;
import com.mphasis.skywaysairline.bookingservice.models.Payment;
import com.mphasis.skywaysairline.bookingservice.models.Reservation;
import com.mphasis.skywaysairline.bookingservice.repo.PassengerRepository;
import com.mphasis.skywaysairline.bookingservice.repo.PaymentRepository;
import com.mphasis.skywaysairline.bookingservice.repo.ReservationRepository;

import jakarta.transaction.Transactional;

import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class BookingService {

    @Autowired private ReservationRepository reservationRepo;
    @Autowired private PassengerRepository passengerRepo;
    @Autowired private PaymentRepository paymentRepo;
    @Autowired private PaymentService paymentService;
    @Autowired private FlightClient flightClient;
    @Autowired private UserClient userClient;
    @Autowired
    private EmailService emailService;

    // 🔹 CREATE ORDER
    public String createOrder(BookingRequest req) {
        try {
            System.out.println("Starting createOrder for scheduleId: " + req.getScheduleId());

            // 1. Validate input
            if (req.getScheduleId() == null || req.getNoOfSeats() <= 0) {
                throw new IllegalArgumentException("Invalid scheduleId or noOfSeats");
            }

            // 1. Get flight details
            FlightResponse flight = flightClient.getFlightDetails(req.getScheduleId());
            if (flight == null) {
                throw new RuntimeException("Flight not found for scheduleId: " + req.getScheduleId());
            }
            System.out.println("Flight details retrieved: " + flight.getFare());

            // 2. Seat check
            if (flight.getAvailableSeats() < req.getNoOfSeats()) {
                throw new FlightFullException("Not enough seats available. Requested: " + req.getNoOfSeats() + ", Available: " + flight.getAvailableSeats());
            }
            System.out.println("Seats check passed");

            // 3. Calculate fare
            double totalFare = req.getNoOfSeats() * flight.getFare();
            System.out.println("Total fare calculated: " + totalFare);

            // 4. Create order
            String orderId = paymentService.createOrder(totalFare);
            System.out.println("Order created successfully: " + orderId);

            return orderId;

        } catch (FlightFullException | IllegalArgumentException e) {
            System.err.println("Validation error in createOrder: " + e.getMessage());
            throw e;  // Re-throw to return proper error to fronted
        } catch (Exception e) {
            System.err.println("Unexpected error in createOrder: " + e.getMessage());
            throw new RuntimeException("Failed to create order: " + e.getMessage());
        }
    }
// find the email of user
    private String getLoggedInUserEmail() {
        return SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
    }
    // 🔥 CONFIRM BOOKING
    @Transactional
    public TicketResponse confirmBooking(PaymentConfirmRequest req) {
        if (req == null || req.getBookingRequest() == null) {
            throw new IllegalArgumentException("Invalid payment confirmation request");
        }

        System.out.println("confirmBooking started for orderId=" + req.getOrderId());
        System.out.println("1");
        boolean success = paymentService.verifyPayment(
                req.getOrderId(),
                req.getPaymentId(),
                req.getSignature()
        );
        System.out.println("confirmBooking started for "+success);
        if (!success) {
            throw new PaymentFailedException("Payment verification failed");
        }
        System.out.println("2");
        BookingRequest bookingReq = req.getBookingRequest();
        if (bookingReq.getNoOfSeats() <= 0 || bookingReq.getPassengers() == null || bookingReq.getPassengers().isEmpty()) {
            throw new IllegalArgumentException("Invalid booking details");
        }

        Payment payment = paymentRepo.findByOrderId(req.getOrderId())
                .orElseThrow(() -> new RuntimeException("Payment not found for orderId: " + req.getOrderId()));
        System.out.println("3");
        Reservation res = new Reservation();
        res.setReservationId(UUID.randomUUID().toString());
        res.setUserId(bookingReq.getUserId());
        res.setScheduleId(bookingReq.getScheduleId());
        res.setBookingDate(LocalDate.now());
        res.setJourneyDate(bookingReq.getJourneyDate());
        res.setNoOfSeats(bookingReq.getNoOfSeats());
        res.setTotalFare(payment.getAmount());
        res.setBookingStatus(1);

        reservationRepo.save(res);
        System.out.println("4");
        List<PassengerDTO> passengerList = new ArrayList<>();
        int seatNo = 1;
        for (PassengerDTO p : bookingReq.getPassengers()) {
            Passenger passenger = new Passenger();
            passenger.setReservationId(res.getReservationId());
            passenger.setName(p.getName());
            passenger.setGender(p.getGender());
            passenger.setAge(p.getAge());
            passenger.setSeatNo(seatNo++);
            passengerRepo.save(passenger);
            passengerList.add(p);
        }
        System.out.println("5");
        flightClient.updateSeats(bookingReq.getScheduleId(), bookingReq.getNoOfSeats());
        System.out.println("6");
        payment.setReservationId(res.getReservationId());
        paymentRepo.save(payment);
        System.out.println("7");
        try {
            userClient.transferMoney(res.getUserId(), res.getTotalFare());
            System.out.println("8 - Money transfer successful");
        } catch (Exception e) {
            System.err.println("Money transfer failed for userId=" + res.getUserId() + ", amount=" + res.getTotalFare() + ". Error: " + e.getMessage());
            // Optionally, mark the reservation as pending or notify admin
            // For now, proceed with booking completion
        }
        System.out.println("8");
        TicketResponse response = new TicketResponse();
        response.setReservationId(res.getReservationId());
        response.setUserId(res.getUserId());
        response.setScheduleId(res.getScheduleId());
        response.setJourneyDate(res.getJourneyDate());
        response.setNoOfSeats(res.getNoOfSeats());
        response.setTotalFare(res.getTotalFare());
        response.setPassengers(passengerList);

        System.out.println("confirmBooking completed for reservationId=" + res.getReservationId());
        return response;
    }
 // Add these methods to your BookingService.java

 // 🔥 CREATE WALLET TOP-UP ORDER
 public String createWalletOrder(Double amount) {
     String userEmail = getLoggedInUserEmail();
     // Get userId from user service
     System.out.println("It is working go for user details"+userEmail);
     String userId =" ";
     try {
    	 userId = userClient.getUserIdByEmail(userEmail);
     }
     catch (Exception e){
    	 System.out.println("User not found");
     }
     return paymentService.createWalletOrder(amount, userId);
 }

 // 🔥 CONFIRM WALLET TOP-UP
 public boolean confirmWalletTopup(String orderId, String paymentId, String signature) {
     String userEmail = getLoggedInUserEmail();
     String userId = userClient.getUserIdByEmail(userEmail);
     return paymentService.verifyWalletPayment(orderId, paymentId, signature, userId);
 }
}