package com.mphasis.skywaysairline.flightservice.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mphasis.skywaysairline.flightservice.dto.ScheduleRequest;
import com.mphasis.skywaysairline.flightservice.models.Flight;
import com.mphasis.skywaysairline.flightservice.models.Route;
import com.mphasis.skywaysairline.flightservice.models.Schedule;
import com.mphasis.skywaysairline.flightservice.repo.FlightRepository;
import com.mphasis.skywaysairline.flightservice.repo.RouteRepository;
import com.mphasis.skywaysairline.flightservice.repo.ScheduleRepository;

@Service
public class ScheduleService {

    @Autowired
    private ScheduleRepository scheduleRepo;
    @Autowired private FlightRepository flightRepo;
    @Autowired private RouteRepository routeRepo;
    // ENTITY → DTO
    private ScheduleRequest toDTO(Schedule s) {
        ScheduleRequest dto = new ScheduleRequest();
        dto.setScheduleId(s.getScheduleId());
        dto.setFlightId(s.getFlight().getFlightId());
        dto.setRouteId(s.getRoute().getRouteId());
        dto.setTravelDuration(s.getTravelDuration());
        dto.setAvailableDays(s.getAvailableDays());
        dto.setDepartureTime(s.getDepartureTime());
     

        return dto;
    }

    // DTO → ENTITY
    private Schedule toEntity(ScheduleRequest dto) {
    	Schedule s=new Schedule();
    	 s.setScheduleId(dto.getScheduleId());
         s.setTravelDuration(dto.getTravelDuration());
         s.setAvailableDays(dto.getAvailableDays());
         s.setDepartureTime(dto.getDepartureTime());

         // 🔥 VALIDATE FLIGHT
         Flight flight = flightRepo.findById(dto.getFlightId())
                 .orElseThrow(() -> new RuntimeException("Invalid Flight ID"));

         // 🔥 VALIDATE ROUTE
         Route route = routeRepo.findById(dto.getRouteId())
                 .orElseThrow(() -> new RuntimeException("Invalid Route ID"));

         s.setFlight(flight);
         s.setRoute(route);

         return s;
    }

    // ADD
    public ScheduleRequest addSchedule(ScheduleRequest dto) {

        if (scheduleRepo.existsById(dto.getScheduleId())) {
            throw new RuntimeException("Schedule already exists");
        }

        Schedule saved = scheduleRepo.save(toEntity(dto));

        return toDTO(saved);
    }


    // UPDATE
    public ScheduleRequest updateSchedule(String id, ScheduleRequest dto) {

        Schedule existing = scheduleRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        existing.setTravelDuration(dto.getTravelDuration());
        existing.setAvailableDays(dto.getAvailableDays());
        existing.setDepartureTime(dto.getDepartureTime());

        // 🔥 UPDATE FLIGHT (if changed)
        if (dto.getFlightId() != null) {
            Flight flight = flightRepo.findById(dto.getFlightId())
                    .orElseThrow(() -> new RuntimeException("Invalid Flight ID"));
            existing.setFlight(flight);
        }

        // 🔥 UPDATE ROUTE (if changed)
        if (dto.getRouteId() != null) {
            Route route = routeRepo.findById(dto.getRouteId())
                    .orElseThrow(() -> new RuntimeException("Invalid Route ID"));
            existing.setRoute(route);
        }

        return toDTO(scheduleRepo.save(existing));
    }

    // DELETE
    public void deleteSchedule(String id) {
        scheduleRepo.deleteById(id);
    }

    // GET ALL
    public List<ScheduleRequest> getSchedules() {
        return scheduleRepo.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }
}