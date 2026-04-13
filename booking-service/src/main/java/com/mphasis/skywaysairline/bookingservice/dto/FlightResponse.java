package com.mphasis.skywaysairline.bookingservice.dto;

public class FlightResponse {

    private double fare;
    private int availableSeats;

    public double getFare() { return fare; }
    public void setFare(double fare) { this.fare = fare; }

    public int getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(int availableSeats) {
        this.availableSeats = availableSeats;
    }
}