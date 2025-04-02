package com.example.RollMate.dto.Course_Validation;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalTime;
import java.util.List;

/**
 * Data Transfer Object for course/class creation and updates
 */
@Data
public class CourseDto {

    @NotBlank(message = "Course name is required")
    @Size(min = 2, max = 100, message = "Course name must be between 2 and 100 characters")
    private String name;

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    @NotNull(message = "Teacher ID is required")
    @Positive(message = "Teacher ID must be a positive number")
    private Long teacherId;

    @NotBlank(message = "Schedule is required")
    @Size(max = 100, message = "Schedule must be less than 100 characters")
    private String schedule;

    @NotBlank(message = "Location is required")
    @Size(max = 200, message = "Location must be less than 200 characters")
    private String location;

    // Optional start and end times
    private LocalTime startTime;

    private LocalTime endTime;

    // Geofence data
    @NotNull(message = "Geofence latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be greater than or equal to -90")
    @DecimalMax(value = "90.0", message = "Latitude must be less than or equal to 90")
    private Double geofenceLatitude;

    @NotNull(message = "Geofence longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be greater than or equal to -180")
    @DecimalMax(value = "180.0", message = "Longitude must be less than or equal to 180")
    private Double geofenceLongitude;

    @NotNull(message = "Geofence radius is required")
    @Positive(message = "Geofence radius must be a positive number")
    @Max(value = 1000, message = "Geofence radius must be less than 1000 meters")
    private Integer geofenceRadius;
}

