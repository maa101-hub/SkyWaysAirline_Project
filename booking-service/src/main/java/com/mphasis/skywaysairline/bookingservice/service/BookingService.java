package com.mphasis.skywaysairline.bookingservice.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mphasis.skywaysairline.bookingservice.client.FlightClient;
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
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class BookingService {

    @Autowired private ReservationRepository reservationRepo;
    @Autowired private PassengerRepository passengerRepo;
    @Autowired private PaymentRepository paymentRepo;
    @Autowired private PaymentService paymentService;
    @Autowired private FlightClient flightClient;
    @Autowired
    private EmailService emailService;

    // 🔹 CREATE ORDER
    public String createOrder(BookingRequest req) {

        // 1. Get flight details
    	System.out.print("1working");
        FlightResponse flight = flightClient.getFlightDetails(req.getScheduleId());
        System.out.print("2working");
        // 2. Seat check
        if (flight.getAvailableSeats() < req.getNoOfSeats()) {
            throw new FlightFullException("Not enough seats");
        }
        System.out.print("3working");
        // 3. Calculate fare
        double totalFare =req.getNoOfSeats()*flight.getFare();;

        // 4. Create order
        return paymentService.createOrder(totalFare);
    }
// find the email of user
    private String getLoggedInUserEmail() {
        return SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
    }
    // 🔥 CONFIRM BOOKING
    public TicketResponse confirmBooking(PaymentConfirmRequest req) {

        // 1. Verify payment
    	System.out.print("1 working");
        boolean success = paymentService.verifyPayment(
                req.getOrderId(),
                req.getPaymentId()
        );
        System.out.print("2 working");
        if (!success) {
            throw new PaymentFailedException("Payment failed");
        }
        System.out.print("3 working");
        BookingRequest bookingReq = req.getBookingRequest();

        // 2. Create reservation
        Reservation res = new Reservation();
        res.setReservationId(UUID.randomUUID().toString());
        res.setUserId(bookingReq.getUserId());
        res.setScheduleId(bookingReq.getScheduleId());
        res.setBookingDate(LocalDate.now());
        res.setJourneyDate(bookingReq.getJourneyDate());
        res.setNoOfSeats(bookingReq.getNoOfSeats());
        Payment payment=paymentRepo.findByOrderId(req.getOrderId())
        .orElseThrow(() -> new RuntimeException("Payment not found"));
        res.setTotalFare(payment.getAmount()); // optional improve
        res.setBookingStatus(1);

        reservationRepo.save(res);

        // 3. Save passengers
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

        // 🔥 4. UPDATE SEATS (MOST IMPORTANT)
        flightClient.updateSeats(
                bookingReq.getScheduleId(),
                bookingReq.getNoOfSeats()
        );

        // 🔥 5. LINK PAYMENT
         payment = paymentRepo.findByOrderId(req.getOrderId())
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setReservationId(res.getReservationId());
        paymentRepo.save(payment);

        // 6. Response
        TicketResponse response = new TicketResponse();
        response.setReservationId(res.getReservationId());
        response.setUserId(res.getUserId());
        response.setScheduleId(res.getScheduleId());
        response.setJourneyDate(res.getJourneyDate());
        response.setNoOfSeats(res.getNoOfSeats());
        response.setTotalFare(res.getTotalFare());
        response.setPassengers(passengerList);
//   String email = getLoggedInUserEmail();
//    emailService.sendTicket(email, response);
        
        return response;
    }
}