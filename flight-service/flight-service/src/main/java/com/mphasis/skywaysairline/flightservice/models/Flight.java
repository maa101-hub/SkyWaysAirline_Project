package com.mphasis.skywaysairline.flightservice.models;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name="flight")
public class Flight {
	    @Id
	    @Column(name="flight_id")
	    private String flightId;

	    private String flightName;

	    private int seatingCapacity;

	    private int reservationCapacity;
	    @OneToMany(mappedBy = "flight")
	    private List<Schedule> schedules;

		public List<Schedule> getSchedules() {
			return schedules;
		}

		public void setSchedules(List<Schedule> schedules) {
			this.schedules = schedules;
		}

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
