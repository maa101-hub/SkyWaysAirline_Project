package com.mphasis.skywaysairline.flightservice.repo;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mphasis.skywaysairline.flightservice.models.ScheduleDetail;

@Repository
public interface ScheduleDetailRepository extends JpaRepository<ScheduleDetail, Long> {

    // Find by scheduleId and journeyDate
    Optional<ScheduleDetail> findByScheduleScheduleIdAndJourneyDate(
            String scheduleId,
            LocalDate journeyDate
    );

    // Find all future schedules for a given schedule
    List<ScheduleDetail> findByScheduleScheduleIdAndJourneyDateGreaterThanEqual(
            String scheduleId,
            LocalDate journeyDate
    );

    // Find all schedules by journeyDate
    List<ScheduleDetail> findByJourneyDate(LocalDate journeyDate);

    // Find all schedules for a given schedule across all dates
    List<ScheduleDetail> findByScheduleScheduleId(String scheduleId);

}
