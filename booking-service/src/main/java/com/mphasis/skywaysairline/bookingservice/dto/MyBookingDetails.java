package com.mphasis.skywaysairline.bookingservice.dto;

import java.time.LocalDate;
import java.util.List;

public class MyBookingDetails {

    private String reservationId;
    private String userId;
    private String scheduleId;

    private LocalDate bookingDate;
    private LocalDate journeyDate;

    private int noOfSeats;
    private double totalFare;
    private int bookingStatus;

    private FlightResponse flightResponse;
    private List<PassengerDTO> passengers;

    private String gate;
    private String terminal;
    private String classType;
    private String group;
    private String seatNos;
    private String passengerName;
    private double amountPaid;
	public String getReservationId() {
		return reservationId;
	}
	public void setReservationId(String reservationId) {
		this.reservationId = reservationId;
	}
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public String getScheduleId() {
		return scheduleId;
	}
	public void setScheduleId(String scheduleId) {
		this.scheduleId = scheduleId;
	}
	public LocalDate getBookingDate() {
		return bookingDate;
	}
	public void setBookingDate(LocalDate bookingDate) {
		this.bookingDate = bookingDate;
	}
	public LocalDate getJourneyDate() {
		return journeyDate;
	}
	public void setJourneyDate(LocalDate journeyDate) {
		this.journeyDate = journeyDate;
	}
	public int getNoOfSeats() {
		return noOfSeats;
	}
	public void setNoOfSeats(int noOfSeats) {
		this.noOfSeats = noOfSeats;
	}
	public double getTotalFare() {
		return totalFare;
	}
	public void setTotalFare(double totalFare) {
		this.totalFare = totalFare;
	}
	public int getBookingStatus() {
		return bookingStatus;
	}
	public void setBookingStatus(int bookingStatus) {
		this.bookingStatus = bookingStatus;
	}
	public FlightResponse getFlightResponse() {
		return flightResponse;
	}
	public void setFlightResponse(FlightResponse flightResponse) {
		this.flightResponse = flightResponse;
	}
	public List<PassengerDTO> getPassengers() {
		return passengers;
	}
	public void setPassengers(List<PassengerDTO> passengers) {
		this.passengers = passengers;
	}
	public String getGate() {
		return gate;
	}
	public void setGate(String gate) {
		this.gate = gate;
	}
	public String getTerminal() {
		return terminal;
	}
	public void setTerminal(String terminal) {
		this.terminal = terminal;
	}
	public String getClassType() {
		return classType;
	}
	public void setClassType(String classType) {
		this.classType = classType;
	}
	public String getGroup() {
		return group;
	}
	public void setGroup(String group) {
		this.group = group;
	}
	public String getSeatNos() {
		return seatNos;
	}
	public void setSeatNos(String seatNos) {
		this.seatNos = seatNos;
	}
	public String getPassengerName() {
		return passengerName;
	}
	public void setPassengerName(String passengerName) {
		this.passengerName = passengerName;
	}
	public double getAmountPaid() {
		return amountPaid;
	}
	public void setAmountPaid(double amountPaid) {
		this.amountPaid = amountPaid;
	}
   
    // getters setters
}
