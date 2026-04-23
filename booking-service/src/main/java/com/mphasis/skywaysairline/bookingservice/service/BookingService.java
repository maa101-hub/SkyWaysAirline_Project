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
import com.mphasis.skywaysairline.bookingservice.dto.MyBookingDetails;
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

            FlightResponse flight = flightClient.getFlightDetails(req.getScheduleId(), req.getJourneyDate());

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

        List<String> generatedSeats =
                generateSeatNumbers(bookingReq.getScheduleId(), bookingReq.getPassengers().size());

        int index = 0;

        for (PassengerDTO p : bookingReq.getPassengers()) {

            String seatNo = generatedSeats.get(index++);

            Passenger passenger = new Passenger();
            passenger.setReservationId(res.getReservationId());
            passenger.setName(p.getName());
            passenger.setGender(p.getGender());
            passenger.setAge(p.getAge());
            passenger.setSeatNo(seatNo);

            passengerRepo.save(passenger);

            p.setSeatNo(seatNo);
            passengerList.add(p);
        }


        log.info("Passengers saved successfully");

            flightClient.updateSeatsForDate(
                bookingReq.getScheduleId(),
                bookingReq.getJourneyDate(),
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

        FlightResponse flight = flightClient.getFlightDetails(
            bookingReq.getScheduleId(),
            bookingReq.getJourneyDate()
        );

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
        List<String> generatedSeats =
                generateSeatNumbers(bookingReq.getScheduleId(), bookingReq.getPassengers().size());

        int index = 0;

        for (PassengerDTO p : bookingReq.getPassengers()) {

            String seatNo = generatedSeats.get(index++);

            Passenger passenger = new Passenger();
            passenger.setReservationId(res.getReservationId());
            passenger.setName(p.getName());
            passenger.setGender(p.getGender());
            passenger.setAge(p.getAge());
            passenger.setSeatNo(seatNo);

            passengerRepo.save(passenger);

            p.setSeatNo(seatNo);
            passengerList.add(p);
        }

        log.info("All passengers saved successfully. ReservationId: {}, PassengerCount: {}",
                res.getReservationId(), passengerList.size());

        flightClient.updateSeatsForDate(
            bookingReq.getScheduleId(),
            bookingReq.getJourneyDate(),
            bookingReq.getNoOfSeats()
        );

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
    //seat genarte 
    private List<String> generateSeatNumbers(String scheduleId, int seatsRequired) {

        List<Reservation> reservations = reservationRepo.findByScheduleId(scheduleId);

        List<String> reservationIds = reservations.stream()
                .map(Reservation::getReservationId)
                .toList();

        List<Passenger> bookedPassengers = reservationIds.isEmpty()
                ? new ArrayList<>()
                : passengerRepo.findByReservationIdIn(reservationIds);

        List<String> bookedSeats = bookedPassengers.stream()
                .map(Passenger::getSeatNo)
                .toList();

        List<String> generatedSeats = new ArrayList<>();
        String[] seatLetters = {"A", "B", "C", "D", "E", "F"};

        for (int row = 1; row <= 40; row++) {
            for (String letter : seatLetters) {
                String seat = row + letter;

                if (!bookedSeats.contains(seat)) {
                    generatedSeats.add(seat);
                }

                if (generatedSeats.size() == seatsRequired) {
                    return generatedSeats;
                }
            }
        }

        throw new FlightFullException("No seats available");
    }

    public List<MyBookingDetails> getFlightDetails(String userId) {
       
        List<Reservation> reservations = reservationRepo.findByUserId(userId);

        if (reservations == null || reservations.isEmpty()) {
            return new ArrayList<>();
        }

        List<MyBookingDetails> myBookings = new ArrayList<>();

        for (Reservation reservation : reservations) {

            FlightResponse flight =
                    flightClient.getFlightDetails(reservation.getScheduleId());

            List<Passenger> passengers =
                    passengerRepo.findByReservationId(reservation.getReservationId());

            List<PassengerDTO> passengerDTOs = new ArrayList<>();
            List<String> names = new ArrayList<>();
            List<String> seats = new ArrayList<>();

            for (Passenger passenger : passengers) {
                PassengerDTO dto = new PassengerDTO();
                dto.setName(passenger.getName());
                dto.setGender(passenger.getGender());
                dto.setAge(passenger.getAge());
                passengerDTOs.add(dto);
                names.add(passenger.getName());
                seats.add(String.valueOf(passenger.getSeatNo()));
            }

            MyBookingDetails myBooking = new MyBookingDetails();

            myBooking.setReservationId(reservation.getReservationId());
            myBooking.setUserId(reservation.getUserId());
            myBooking.setScheduleId(reservation.getScheduleId());
            myBooking.setBookingDate(reservation.getBookingDate());
            myBooking.setJourneyDate(reservation.getJourneyDate());
            myBooking.setNoOfSeats(reservation.getNoOfSeats());
            myBooking.setTotalFare(reservation.getTotalFare());
            myBooking.setBookingStatus(reservation.getBookingStatus());

            myBooking.setFlightResponse(flight);
            myBooking.setPassengers(passengerDTOs);

            myBooking.setPassengerName(String.join(", ", names));
            myBooking.setSeatNos(String.join(", ", seats));
            myBooking.setAmountPaid(reservation.getTotalFare());

            myBooking.setGate("C12");
            myBooking.setTerminal("T3");
            myBooking.setClassType("Economy");
            myBooking.setGroup("E");

            myBookings.add(myBooking);
        }

        return myBookings;
    }

    // 🔥 CANCEL BOOKING
    @Transactional
    public void cancelBooking(String reservationId) {
        
        log.info("Starting cancellation process for reservationId: {}", reservationId);
        
        // Find the reservation
        Reservation reservation = reservationRepo.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        log.info("Reservation found. UserId: {}, ScheduleId: {}, Fare: {}", 
                reservation.getUserId(), reservation.getScheduleId(), reservation.getTotalFare());
        
        // Check if already cancelled
        if (reservation.getBookingStatus() == 0) {
            log.warn("Reservation already cancelled. ReservationId: {}", reservationId);
            throw new RuntimeException("Booking already cancelled");
        }
        
        // Update reservation status to cancelled (0)
        reservation.setBookingStatus(0);
        reservationRepo.save(reservation);
        log.info("Reservation status updated to cancelled");
        
        // Release seats back to the flight
        try {
                flightClient.releaseSeatForDate(
                    reservation.getScheduleId(),
                    reservation.getJourneyDate(),
                    reservation.getNoOfSeats()
                );
            log.info("Seats released successfully. ScheduleId: {}, Seats: {}", 
                    reservation.getScheduleId(), reservation.getNoOfSeats());
        } catch (Exception e) {
            log.error("Failed to release seats for scheduleId: {}", reservation.getScheduleId(), e);
            throw new RuntimeException("Failed to release seats: " + e.getMessage());
        }
        
        // Process refund to wallet
        try {
            userClient.refundMoney(reservation.getUserId(), reservation.getTotalFare());
            log.info("Refund added to wallet successfully. UserId: {}, Amount: {}", 
                    reservation.getUserId(), reservation.getTotalFare());
        } catch (Exception e) {
            log.error("Failed to add refund to wallet for userId: {}", reservation.getUserId(), e);
            throw new RuntimeException("Failed to process refund: " + e.getMessage());
        }
        
        log.info("Booking cancellation completed successfully for reservationId: {}", reservationId);
    }

}