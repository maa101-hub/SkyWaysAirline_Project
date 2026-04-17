package com.mphasis.skywaysairline.bookingservice.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    @Autowired private ReservationRepository reservationRepo;
    @Autowired private PassengerRepository passengerRepo;
    @Autowired private PaymentRepository paymentRepo;
    @Autowired private PaymentService paymentService;
    @Autowired private FlightClient flightClient;
    @Autowired private UserClient userClient;
    @Autowired private EmailService emailService;

    // 🔹 CREATE ORDER
    public String createOrder(BookingRequest req) {
        try {
            log.info("Starting createOrder for scheduleId: {}", req.getScheduleId());

            if (req.getScheduleId() == null || req.getNoOfSeats() <= 0) {
                log.error("Invalid request data");
                throw new IllegalArgumentException("Invalid scheduleId or noOfSeats");
            }

            FlightResponse flight = flightClient.getFlightDetails(req.getScheduleId());

            if (flight == null) {
                log.error("Flight not found for scheduleId: {}", req.getScheduleId());
                throw new RuntimeException("Flight not found");
            }

            log.info("Flight details fetched successfully. Fare: {}", flight.getFare());

            if (flight.getAvailableSeats() < req.getNoOfSeats()) {
                log.error("Seats unavailable. Requested: {}, Available: {}",
                        req.getNoOfSeats(), flight.getAvailableSeats());
                throw new FlightFullException("Not enough seats available");
            }

            log.info("Seat availability check passed");

            double totalFare = req.getNoOfSeats() * flight.getFare();

            log.info("Total fare calculated: {}", totalFare);

            String orderId = paymentService.createOrder(totalFare);

            log.info("Payment order created successfully. OrderId: {}", orderId);

            return orderId;

        } catch (FlightFullException | IllegalArgumentException e) {
            log.error("Validation error in createOrder: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error in createOrder: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create order: " + e.getMessage());
        }
    }

    // find logged in user email
    private String getLoggedInUserEmail() {
        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        log.info("Logged in user email fetched: {}", email);
        return email;
    }

    // 🔥 CONFIRM BOOKING
    @Transactional
    public TicketResponse confirmBooking(PaymentConfirmRequest req) {

        if (req == null || req.getBookingRequest() == null) {
            log.error("Invalid payment confirmation request");
            throw new IllegalArgumentException("Invalid payment confirmation request");
        }

        log.info("confirmBooking started for orderId={}", req.getOrderId());

        boolean success = paymentService.verifyPayment(
                req.getOrderId(),
                req.getPaymentId(),
                req.getSignature()
        );

        log.info("Payment verification result: {}", success);

        if (!success) {
            log.error("Payment verification failed for orderId={}", req.getOrderId());
            throw new PaymentFailedException("Payment verification failed");
        }

        BookingRequest bookingReq = req.getBookingRequest();

        if (bookingReq.getNoOfSeats() <= 0 ||
                bookingReq.getPassengers() == null ||
                bookingReq.getPassengers().isEmpty()) {

            log.error("Invalid booking details");
            throw new IllegalArgumentException("Invalid booking details");
        }

        Payment payment = paymentRepo.findByOrderId(req.getOrderId())
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        log.info("Payment record found for orderId={}", req.getOrderId());

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

        log.info("Reservation saved successfully. ReservationId={}", res.getReservationId());

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

        log.info("Passengers saved successfully");

        flightClient.updateSeats(
                bookingReq.getScheduleId(),
                bookingReq.getNoOfSeats()
        );

        log.info("Flight seats updated successfully");

        payment.setReservationId(res.getReservationId());
        paymentRepo.save(payment);

        log.info("Payment updated with reservationId");
        String paymentOption="razorpay";

        try {
            userClient.transferMoney(
                    res.getUserId(),
                    res.getTotalFare(),paymentOption
            );

            log.info("Money transferred successfully for userId={}", res.getUserId());

        } catch (Exception e) {

            log.error("Money transfer failed for userId={}, amount={}, error={}",
                    res.getUserId(),
                    res.getTotalFare(),
                    e.getMessage());
        }

        TicketResponse response = new TicketResponse();
        response.setReservationId(res.getReservationId());
        response.setUserId(res.getUserId());
        response.setScheduleId(res.getScheduleId());
        response.setJourneyDate(res.getJourneyDate());
        response.setNoOfSeats(res.getNoOfSeats());
        response.setTotalFare(res.getTotalFare());
        response.setPassengers(passengerList);

        log.info("confirmBooking completed successfully for reservationId={}",
                res.getReservationId());

        return response;
    }

    // 🔥 CREATE WALLET TOP-UP ORDER
    public String createWalletOrder(Double amount) {

        String userEmail = getLoggedInUserEmail();

        log.info("Creating wallet order for userEmail={}, amount={}", userEmail, amount);

        String userId = "";

        try {
            userId = userClient.getUserIdByEmail(userEmail);
            log.info("UserId fetched successfully: {}", userId);

        } catch (Exception e) {
            log.error("User not found for email={}", userEmail);
        }

        String orderId = paymentService.createWalletOrder(amount, userId);

        log.info("Wallet top-up order created successfully. OrderId={}", orderId);

        return orderId;
    }

    // 🔥 CONFIRM WALLET TOP-UP
    public boolean confirmWalletTopup(String orderId, String paymentId, String signature) {

        String userEmail = getLoggedInUserEmail();

        log.info("Wallet payment verification started for email={}", userEmail);

        String userId = userClient.getUserIdByEmail(userEmail);

        boolean result = paymentService.verifyWalletPayment(
                orderId,
                paymentId,
                signature,
                userId
        );

        log.info("Wallet top-up verification result: {}", result);

        return result;
    }
    
    @Transactional
    public TicketResponse confirmWalletBooking(BookingRequest bookingReq) {

        log.info("Wallet booking started. ScheduleId: {}, UserId: {}",
                bookingReq != null ? bookingReq.getScheduleId() : null,
                bookingReq != null ? bookingReq.getUserId() : null);

        if (bookingReq == null || bookingReq.getNoOfSeats() <= 0 ||
                bookingReq.getPassengers() == null || bookingReq.getPassengers().isEmpty()) {
            log.error("Invalid wallet booking request received");
            throw new IllegalArgumentException("Invalid booking details");
        }

        FlightResponse flight = flightClient.getFlightDetails(bookingReq.getScheduleId());

        if (flight == null) {
            log.error("Flight not found for scheduleId: {}", bookingReq.getScheduleId());
            throw new RuntimeException("Flight not found");
        }

        log.info("Flight details fetched successfully. ScheduleId: {}, Fare: {}, AvailableSeats: {}",
                bookingReq.getScheduleId(), flight.getFare(), flight.getAvailableSeats());

        if (flight.getAvailableSeats() < bookingReq.getNoOfSeats()) {
            log.error("Insufficient seats for wallet booking. Requested: {}, Available: {}",
                    bookingReq.getNoOfSeats(), flight.getAvailableSeats());
            throw new FlightFullException("Not enough seats available");
        }

        log.info("Seat availability check passed for scheduleId: {}", bookingReq.getScheduleId());

        double totalFare = bookingReq.getNoOfSeats() * flight.getFare();
        log.info("Total fare calculated for wallet booking. UserId: {}, TotalFare: {}",
                bookingReq.getUserId(), totalFare);

        String paymentOption = "wallet";
        log.info("Initiating wallet deduction. UserId: {}, Amount: {}, PaymentOption: {}",
                bookingReq.getUserId(), totalFare, paymentOption);

        userClient.transferMoney(bookingReq.getUserId(), totalFare, paymentOption);

        log.info("Wallet deduction completed successfully. UserId: {}, Amount: {}",
                bookingReq.getUserId(), totalFare);

        Reservation res = new Reservation();
        res.setReservationId(UUID.randomUUID().toString());
        res.setUserId(bookingReq.getUserId());
        res.setScheduleId(bookingReq.getScheduleId());
        res.setBookingDate(LocalDate.now());
        res.setJourneyDate(bookingReq.getJourneyDate());
        res.setNoOfSeats(bookingReq.getNoOfSeats());
        res.setTotalFare(totalFare);
        res.setBookingStatus(1);

        reservationRepo.save(res);

        log.info("Reservation saved successfully. ReservationId: {}, UserId: {}",
                res.getReservationId(), res.getUserId());

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

            log.info("Passenger saved successfully. ReservationId: {}, PassengerName: {}, SeatNo: {}",
                    res.getReservationId(), p.getName(), passenger.getSeatNo());
        }

        log.info("All passengers saved successfully. ReservationId: {}, PassengerCount: {}",
                res.getReservationId(), passengerList.size());

        flightClient.updateSeats(bookingReq.getScheduleId(), bookingReq.getNoOfSeats());

        log.info("Flight seats updated successfully. ScheduleId: {}, SeatsBooked: {}",
                bookingReq.getScheduleId(), bookingReq.getNoOfSeats());

        Payment payment = new Payment();
        payment.setOrderId("WALLET-" + UUID.randomUUID());
        payment.setReservationId(res.getReservationId());
        payment.setAmount(totalFare);
        payment.setPaymentStatus("SUCCESS");
        paymentRepo.save(payment);

        log.info("Wallet payment record saved successfully. ReservationId: {}, OrderId: {}, Amount: {}",
                res.getReservationId(), payment.getOrderId(), totalFare);

        TicketResponse response = new TicketResponse();
        response.setReservationId(res.getReservationId());
        response.setUserId(res.getUserId());
        response.setScheduleId(res.getScheduleId());
        response.setJourneyDate(res.getJourneyDate());
        response.setNoOfSeats(res.getNoOfSeats());
        response.setTotalFare(res.getTotalFare());
        response.setPassengers(passengerList);

        log.info("Wallet booking completed successfully. ReservationId: {}, UserId: {}, TotalFare: {}",
                res.getReservationId(), res.getUserId(), res.getTotalFare());

        return response;
    }

    //RK
    public List<Reservation> getAllBookings() {
        return reservationRepo.findAll();
    }
}