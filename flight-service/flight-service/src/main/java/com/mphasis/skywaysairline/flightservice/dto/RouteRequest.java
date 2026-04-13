package com.mphasis.skywaysairline.flightservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class RouteRequest {
	@NotBlank(message="Route  id required")
	private String routeId;
	@NotBlank(message="Source required")
    private String source;
	@NotBlank(message="Destination required")
    private String destination;
    @Min(value = 1, message = "distance must be greater than 0")
    private int distance;

    private double fare;

	public String getRouteId() {
		return routeId;
	}

	public void setRouteId(String routeId) {
		this.routeId = routeId;
	}

	public String getSource() {
		return source;
	}

	public void setSource(String source) {
		this.source = source;
	}

	public String getDestination() {
		return destination;
	}

	public void setDestination(String destination) {
		this.destination = destination;
	}

	public int getDistance() {
		return distance;
	}

	public void setDistance(int distance) {
		this.distance = distance;
	}

	public double getFare() {
		return fare;
	}

	public void setFare(double fare) {
		this.fare = fare;
	}
    

    // getters setters
}
