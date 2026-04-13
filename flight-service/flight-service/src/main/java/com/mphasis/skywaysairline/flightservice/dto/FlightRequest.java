package com.mphasis.skywaysairline.flightservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class FlightRequest {
	@NotBlank(message="FLight id required")
	private String flightId;
    
	@NotBlank(message = "Flight name required")
    private String flightName;
    
	@Min(value = 1, message = "Capacity must be > 0")
    private int seatingCapacity;

    private int reservationCapacity;

	public String getFlightId() {
		return flightId;
	}

	public void setFlightId(String flightId) {
		this.flightId = flightId;
	}

	public String getFlightName() {
		return flightName;
	}

	public void setFlightName(String flightName) {
		this.flightName = flightName;
	}

	public int getSeatingCapacity() {
		return seatingCapacity;
	}

	public void setSeatingCapacity(int seatingCapacity) {
		this.seatingCapacity = seatingCapacity;
	}

	public int getReservationCapacity() {
		return reservationCapacity;
	}

	public void setReservationCapacity(int reservationCapacity) {
		this.reservationCapacity = reservationCapacity;
	}
}

