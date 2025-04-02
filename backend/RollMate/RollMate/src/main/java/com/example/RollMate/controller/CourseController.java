package com.example.RollMate.controller;

import com.example.RollMate.model.Course;
import com.example.RollMate.model.User;
import com.example.RollMate.repository.UserRepository;
import com.example.RollMate.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/classes") // Remove /api prefix as it's already in application.properties
@CrossOrigin
public class CourseController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Course>> getClasses() {
        System.out.println("Getting all classes");
        List<Course> classes = courseService.getAllClasses();
        return ResponseEntity.ok(classes);
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Course>> getClassesByTeacher(@PathVariable Long teacherId) {
        System.out.println("Getting classes for teacher: " + teacherId);
        List<Course> classes = courseService.getClassesByTeacher(teacherId);
        return ResponseEntity.ok(classes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getClass(@PathVariable Long id) {
        System.out.println("Getting class with ID: " + id);
        Course course = courseService.getClass(id);
        return ResponseEntity.ok(course);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('teacher', 'TEACHER') or hasAuthority('ADMIN')")
    public ResponseEntity<Course> createClass(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("Creating class from request: " + request);

            // Create a new Course object
            Course course = new Course();

            // Set basic information
            course.setName((String) request.get("name"));
            course.setDescription((String) request.get("description"));

            // Get the teacher
            Long teacherId = Long.valueOf(request.get("teacherId").toString());
            User teacher = userRepository.findById(teacherId)
                    .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + teacherId));
            course.setTeacher(teacher);

            // Parse and set dates
            LocalDate startLocalDate = null;
            LocalDate endLocalDate = null;

            if (request.containsKey("startDate")) {
                try {
                    String startDateStr = (String) request.get("startDate");
                    startLocalDate = LocalDate.parse(startDateStr);

                    // If we also have startTime, combine them
                    if (request.containsKey("startTime")) {
                        String startTimeStr = (String) request.get("startTime");
                        LocalTime startTime = LocalTime.parse(startTimeStr);
                        course.setStartDate(LocalDateTime.of(startLocalDate, startTime));
                    } else {
                        // Default to midnight
                        course.setStartDate(LocalDateTime.of(startLocalDate, LocalTime.MIDNIGHT));
                    }
                } catch (DateTimeParseException e) {
                    System.err.println("Error parsing startDate: " + e.getMessage());
                    throw new RuntimeException("Invalid startDate format. Use ISO format (YYYY-MM-DD)");
                }
            }

            if (request.containsKey("endDate")) {
                try {
                    String endDateStr = (String) request.get("endDate");
                    endLocalDate = LocalDate.parse(endDateStr);

                    // If we also have endTime, combine them
                    if (request.containsKey("endTime")) {
                        String endTimeStr = (String) request.get("endTime");
                        LocalTime endTime = LocalTime.parse(endTimeStr);
                        course.setEndDate(LocalDateTime.of(endLocalDate, endTime));
                    } else {
                        // Default to end of day
                        course.setEndDate(LocalDateTime.of(endLocalDate, LocalTime.of(23, 59, 59)));
                    }
                } catch (DateTimeParseException e) {
                    System.err.println("Error parsing endDate: " + e.getMessage());
                    throw new RuntimeException("Invalid endDate format. Use ISO format (YYYY-MM-DD)");
                }
            }

            // Set schedule from combination of dayOfWeek, startTime, endTime if provided
            if (request.containsKey("dayOfWeek") && request.containsKey("startTime") && request.containsKey("endTime")) {
                String dayOfWeek = (String) request.get("dayOfWeek");
                String startTime = (String) request.get("startTime");
                String endTime = (String) request.get("endTime");
                course.setSchedule(dayOfWeek + " " + startTime + "-" + endTime);
                System.out.println("Set schedule to: " + course.getSchedule());
            } else if (request.containsKey("schedule")) {
                course.setSchedule((String) request.get("schedule"));
                System.out.println("Set schedule from schedule field to: " + course.getSchedule());
            }

            // Set location if provided
            if (request.containsKey("location")) {
                course.setLocation((String) request.get("location"));
            }

            // Create the course
            Course created = courseService.createClass(course);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            System.err.println("Error creating class: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('teacher', 'TEACHER')")
    public ResponseEntity<Course> updateClass(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        try {
            System.out.println("Updating class with ID: " + id);
            Course existing = courseService.getClass(id);

            if (request.containsKey("name")) {
                existing.setName((String) request.get("name"));
            }

            if (request.containsKey("description")) {
                existing.setDescription((String) request.get("description"));
            }

            if (request.containsKey("location")) {
                existing.setLocation((String) request.get("location"));
            }

            // Parse and set dates
            if (request.containsKey("startDate")) {
                try {
                    String startDateStr = (String) request.get("startDate");
                    LocalDate startLocalDate = LocalDate.parse(startDateStr);

                    // If we also have startTime, combine them
                    if (request.containsKey("startTime")) {
                        String startTimeStr = (String) request.get("startTime");
                        LocalTime startTime = LocalTime.parse(startTimeStr);
                        existing.setStartDate(LocalDateTime.of(startLocalDate, startTime));
                    } else {
                        // Default to midnight
                        existing.setStartDate(LocalDateTime.of(startLocalDate, LocalTime.MIDNIGHT));
                    }
                } catch (DateTimeParseException e) {
                    System.err.println("Error parsing startDate: " + e.getMessage());
                    throw new RuntimeException("Invalid startDate format. Use ISO format (YYYY-MM-DD)");
                }
            }

            if (request.containsKey("endDate")) {
                try {
                    String endDateStr = (String) request.get("endDate");
                    LocalDate endLocalDate = LocalDate.parse(endDateStr);

                    // If we also have endTime, combine them
                    if (request.containsKey("endTime")) {
                        String endTimeStr = (String) request.get("endTime");
                        LocalTime endTime = LocalTime.parse(endTimeStr);
                        existing.setEndDate(LocalDateTime.of(endLocalDate, endTime));
                    } else {
                        // Default to end of day
                        existing.setEndDate(LocalDateTime.of(endLocalDate, LocalTime.of(23, 59, 59)));
                    }
                } catch (DateTimeParseException e) {
                    System.err.println("Error parsing endDate: " + e.getMessage());
                    throw new RuntimeException("Invalid endDate format. Use ISO format (YYYY-MM-DD)");
                }
            }

            // Set schedule from combination of dayOfWeek, startTime, endTime if provided
            if (request.containsKey("dayOfWeek") && request.containsKey("startTime") && request.containsKey("endTime")) {
                String dayOfWeek = (String) request.get("dayOfWeek");
                String startTime = (String) request.get("startTime");
                String endTime = (String) request.get("endTime");
                existing.setSchedule(dayOfWeek + " " + startTime + "-" + endTime);
            } else if (request.containsKey("schedule")) {
                existing.setSchedule((String) request.get("schedule"));
            }

            Course updated = courseService.updateClass(id, existing);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            System.err.println("Error updating class: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('teacher', 'TEACHER')")
    public ResponseEntity<?> deleteClass(@PathVariable Long id) {
        System.out.println("Deleting class with ID: " + id);
        courseService.deleteClass(id);
        return ResponseEntity.ok(Map.of("message", "Class deleted successfully"));
    }

    @PatchMapping("/{id}/geofence")
    @PreAuthorize("hasAnyAuthority('teacher', 'TEACHER')")
    public ResponseEntity<Course> updateGeofence(
            @PathVariable Long id,
            @RequestBody Map<String, Object> geofenceData) {
        System.out.println("Updating geofence for class ID: " + id);
        String coordinates = (String) geofenceData.get("coordinates");
        Double radius = Double.valueOf(geofenceData.get("radius").toString());

        Course updated = courseService.updateGeofence(id, coordinates, radius);
        return ResponseEntity.ok(updated);
    }
}