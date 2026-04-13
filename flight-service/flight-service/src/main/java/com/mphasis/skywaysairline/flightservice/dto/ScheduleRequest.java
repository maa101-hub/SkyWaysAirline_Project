package com.mphasis.skywaysairline.flightservice.dto;

import java.time.LocalTime;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ScheduleRequest {
	
	@NotBlank(message = "Schedule ID is required")
    private String scheduleId;

    @NotBlank(message = "Flight ID is required")
    private String flightId;

    @NotBlank(message = "Route ID is required")
    private String routeId;

    @Min(value = 1, message = "Duration must be greater than 0")
    private int travelDuration;

    @NotBlank(message = "Available days required")
    private String availableDays;

    @NotNull(message = "Departure time required")
    private LocalTime departureTime;

		public String getScheduleId() {
			return scheduleId;
		}

		public void setScheduleId(String scheduleId) {
			this.scheduleId = scheduleId;
		}

		public String getFlightId() {
			return flightId;
		}

		public void setFlightId(String flightId) {
			this.flightId = flightId;
		}

		public String getRouteId() {
			return routeId;
		}

		public void setRouteId(String routeId) {
			this.routeId = routeId;
		}

		public int getTravelDuration() {
			return travelDuration;
		}

		public void setTravelDuration(int travelDuration) {
			this.travelDuration = travelDuration;
		}

		public String getAvailableDays() {
			return availableDays;
		}

		public void setAvailableDays(String availableDays) {
			this.availableDays = availableDays;
		}

		public LocalTime getDepartureTime() {
			return departureTime;
		}

		public void setDepartureTime(LocalTime departureTime) {
			this.departureTime = departureTime;
		}
	    
}
