package com.example.RollMate.controller;

import com.example.RollMate.service.AttendanceService;
import com.example.RollMate.model.Attendance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/attendance")
@CrossOrigin
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('teacher', 'TEACHER') or hasAnyAuthority('admin', 'ADMIN')")
    public ResponseEntity<List<Attendance>> getAttendance(
            @RequestParam Long classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        System.out.println("Getting attendance for class ID: " + classId + " on date: " + date);
        List<Attendance> records = attendanceService.getAttendanceByDate(classId, date);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/student")
    @PreAuthorize("hasAnyAuthority('student', 'STUDENT')")
    public ResponseEntity<List<Attendance>> getStudentAttendance() {
        System.out.println("Getting attendance for current student");
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        List<Attendance> records = attendanceService.getStudentAttendance(username);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyAuthority('teacher', 'TEACHER') or hasAnyAuthority('admin', 'ADMIN')")
    public ResponseEntity<List<Attendance>> getAttendanceForStudent(
            @PathVariable Long studentId) {
        System.out.println("Getting attendance for student ID: " + studentId);
        List<Attendance> records = attendanceService.getStudentAttendanceById(studentId);
        return ResponseEntity.ok(records);
    }

    @PostMapping("/mark")
    @PreAuthorize("hasAnyAuthority('student', 'STUDENT')")
    public ResponseEntity<?> markAttendanceWithLocation(
            @RequestBody Map<String, Object> request) {
        System.out.println("Marking attendance with location data: " + request);
        Long classId = Long.valueOf(request.get("classId").toString());
        Double latitude = Double.valueOf(request.get("latitude").toString());
        Double longitude = Double.valueOf(request.get("longitude").toString());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        boolean success = attendanceService.markAttendanceWithLocation(username, classId, latitude, longitude);

        if (success) {
            return ResponseEntity.ok(Map.of(
                    "message", "Attendance marked successfully",
                    "success", true
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "You are not within the class geofence area",
                    "success", false
            ));
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('teacher', 'TEACHER') or hasAnyAuthority('admin', 'ADMIN')")
    public ResponseEntity<Attendance> markAttendance(@RequestBody Attendance attendance) {
        System.out.println("Marking attendance: " + attendance);

        // IMPORTANT FIX: Set a default status if it's null to satisfy the NOT NULL constraint
        if (attendance.getStatus() == null) {
            attendance.setStatus("PRESENT"); // Default to PRESENT
        }

        // Set verification method if it's null
        if (attendance.getVerificationMethod() == null) {
            attendance.setVerificationMethod("manual"); // Default to manual verification
        }

        // Set date if it's null
        if (attendance.getDate() == null) {
            attendance.setDate(LocalDate.now());
        }

        Attendance record = attendanceService.markAttendance(attendance);
        return ResponseEntity.ok(record);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('teacher', 'TEACHER') or hasAnyAuthority('admin', 'ADMIN')")
    public ResponseEntity<Attendance> updateAttendance(
            @PathVariable Long id,
            @RequestBody Attendance attendance) {
        System.out.println("Updating attendance ID: " + id);

        // Ensure status isn't set to null during update
        if (attendance.getStatus() == null) {
            attendance.setStatus("PRESENT"); // Default to PRESENT if null
        }

        Attendance updated = attendanceService.updateAttendance(id, attendance);
        return ResponseEntity.ok(updated);
    }
}