package com.example.RollMate.repository;

import com.example.RollMate.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByClassIdAndTimestampBetween(Long classId, LocalDateTime start, LocalDateTime end);
    List<Attendance> findByClassIdAndDate(Long classId, LocalDate date);
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findByStudentIdAndClassIdAndDate(Long studentId, Long classId, LocalDate date);
}

