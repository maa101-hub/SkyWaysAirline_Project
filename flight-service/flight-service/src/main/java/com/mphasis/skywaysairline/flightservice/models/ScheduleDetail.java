package com.mphasis.skywaysairline.flightservice.models;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "schedule_detail")
public class ScheduleDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "schedule_id", nullable = false)
    private Schedule schedule;

    @Column(name = "journey_date", nullable = false)
    private LocalDate journeyDate;

    @Column(name = "total_seats", nullable = false)
    private int totalSeats;

    @Column(name = "available_seats", nullable = false)
    private int availableSeats;

    // Flag to track if journey is completed
    @Column(name = "is_journey_completed", columnDefinition = "TINYINT DEFAULT 0")
    private int isJourneyCompleted;

    // Constructors
    public ScheduleDetail() {
    }

    public ScheduleDetail(Schedule schedule, LocalDate journeyDate, int totalSeats) {
        this.schedule = schedule;
        this.journeyDate = journeyDate;
        this.totalSeats = totalSeats;
        this.availableSeats = totalSeats;
        this.isJourneyCompleted = 0;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Schedule getSchedule() {
        return schedule;
    }

    public void setSchedule(Schedule schedule) {
        this.schedule = schedule;
    }

    public LocalDate getJourneyDate() {
        return journeyDate;
    }

    public void setJourneyDate(LocalDate journeyDate) {
        this.journeyDate = journeyDate;
    }

    public int getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(int totalSeats) {
        this.totalSeats = totalSeats;
    }

    public int getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(int availableSeats) {
        this.availableSeats = availableSeats;
    }

    public int getIsJourneyCompleted() {
        return isJourneyCompleted;
    }

    public void setIsJourneyCompleted(int isJourneyCompleted) {
        this.isJourneyCompleted = isJourneyCompleted;
    }

    @Override
    public String toString() {
        return "ScheduleDetail {" +
                "id=" + id +
                ", journeyDate=" + journeyDate +
                ", totalSeats=" + totalSeats +
                ", availableSeats=" + availableSeats +
                ", isJourneyCompleted=" + isJourneyCompleted +
                '}';
    }
}
