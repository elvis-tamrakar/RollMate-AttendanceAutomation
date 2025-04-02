package com.example.RollMate.dto.Attendance_Validation;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for marking attendance with geofencing
 */
@Data
public class AttendanceMarkingDto {

    @NotNull(message = "Course ID is required")
    @Positive(message = "Course ID must be a positive number")
    private Long courseId;

    @NotNull(message = "Student ID is required")
    @Positive(message = "Student ID must be a positive number")
    private Long studentId;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be greater than or equal to -90")
    @DecimalMax(value = "90.0", message = "Latitude must be less than or equal to 90")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be greater than or equal to -180")
    @DecimalMax(value = "180.0", message = "Longitude must be less than or equal to 180")
    private Double longitude;

    private LocalDateTime timestamp = LocalDateTime.now();

    @NotBlank(message = "Verification method is required")
    @Pattern(regexp = "^(geofence|biometric|manual|biometric\\+geofence|testing)$",
            message = "Verification method must be one of: geofence, biometric, manual, biometric+geofence, testing")
    private String verificationMethod;
}

