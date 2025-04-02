package com.example.RollMate.service;

import com.example.RollMate.model.Attendance;
import com.example.RollMate.model.Course;
import com.example.RollMate.model.User;
import com.example.RollMate.repository.AttendanceRepository;
import com.example.RollMate.repository.CourseRepository;
import com.example.RollMate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    // Used to measure distance between two points
    private static final double EARTH_RADIUS = 6371000; // in meters

    public List<Attendance> getAttendanceByDate(Long classId, LocalDate date) {
        return attendanceRepository.findByClassIdAndDate(
                classId,
                date
        );
    }

    public List<Attendance> getStudentAttendance(String username) {
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return attendanceRepository.findByStudentId(student.getId());
    }

    public List<Attendance> getStudentAttendanceById(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    @Transactional
    public Attendance markAttendance(Attendance attendance) {
        // Set current timestamp
        attendance.setTimestamp(LocalDateTime.now());

        // Set the date if it's null
        if (attendance.getDate() == null) {
            attendance.setDate(LocalDate.now());
        }

        // IMPORTANT FIX: Ensure we set a default status if it's null
        if (attendance.getStatus() == null) {
            attendance.setStatus("PRESENT");
        }

        // Set a default verification method if it's null
        if (attendance.getVerificationMethod() == null) {
            attendance.setVerificationMethod("manual");
        }

        return attendanceRepository.save(attendance);
    }

    @Transactional
    public Attendance updateAttendance(Long id, Attendance attendance) {
        Attendance existing = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance record not found"));

        if (attendance.getStatus() != null) {
            existing.setStatus(attendance.getStatus());
        }
        if (attendance.getNote() != null) {
            existing.setNote(attendance.getNote());
        }
        if (attendance.getVerificationMethod() != null) {
            existing.setVerificationMethod(attendance.getVerificationMethod());
        }

        return attendanceRepository.save(existing);
    }

    @Transactional
    public boolean markAttendanceWithLocation(String username, Long classId, Double latitude, Double longitude) {
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Course course = courseRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        // Check if student is already marked as present for this class today
        LocalDate today = LocalDate.now();
        List<Attendance> existingRecords = attendanceRepository.findByStudentIdAndClassIdAndDate(
                student.getId(),
                classId,
                today
        );

        if (!existingRecords.isEmpty()) {
            // Student already marked attendance today
            return true;
        }

        // Check if student is within the class geofence
        if (course.getGeofenceCoordinates() != null && course.getGeofenceRadius() != null) {
            // Parse geofence coordinates (expecting format "lat,lng")
            String[] parts = course.getGeofenceCoordinates().split(",");
            if (parts.length == 2) {
                try {
                    double centerLat = Double.parseDouble(parts[0]);
                    double centerLng = Double.parseDouble(parts[1]);

                    // Calculate distance between student location and class geofence center
                    double distance = calculateDistance(centerLat, centerLng, latitude, longitude);

                    // Check if student is inside the geofence
                    if (distance <= course.getGeofenceRadius()) {
                        // Student is inside the geofence, mark attendance
                        Attendance attendance = new Attendance();
                        attendance.setStudentId(student.getId());
                        attendance.setClassId(classId);
                        attendance.setTimestamp(LocalDateTime.now());
                        attendance.setDate(today);
                        attendance.setLatitude(latitude);
                        attendance.setLongitude(longitude);
                        attendance.setVerificationMethod("geofence");
                        attendance.setStatus("PRESENT"); // Set status to PRESENT by default

                        attendanceRepository.save(attendance);
                        return true;
                    } else {
                        // Student is outside the geofence
                        return false;
                    }
                } catch (NumberFormatException e) {
                    // Invalid coordinates format
                    throw new RuntimeException("Invalid geofence coordinates format");
                }
            }
        }

        // If geofence is not set or coordinates are not properly formatted,
        // just mark attendance without location verification
        Attendance attendance = new Attendance();
        attendance.setStudentId(student.getId());
        attendance.setClassId(classId);
        attendance.setTimestamp(LocalDateTime.now());
        attendance.setDate(today);
        attendance.setLatitude(latitude);
        attendance.setLongitude(longitude);
        attendance.setVerificationMethod("manual");
        attendance.setStatus("PRESENT"); // Set status to PRESENT by default

        attendanceRepository.save(attendance);
        return true;
    }

    // Haversine formula to calculate distance between two points on Earth
    private double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLng / 2) * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c; // Distance in meters
    }

    public Attendance saveAttendance(Attendance attendance) {
        // Set defaults if not already set
        if (attendance.getDate() == null) {
            attendance.setDate(LocalDate.now());
        }

        if (attendance.getTimestamp() == null) {
            attendance.setTimestamp(LocalDateTime.now());
        }

        if (attendance.getStatus() == null || attendance.getStatus().isEmpty()) {
            attendance.setStatus("present");
        }

        // Save to database using your repository
        return attendanceRepository.save(attendance);
    }
}