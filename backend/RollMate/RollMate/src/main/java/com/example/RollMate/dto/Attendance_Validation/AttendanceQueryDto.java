package com.example.RollMate.dto.Attendance_Validation;

import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate; /**
 * Data Transfer Object for attendance query parameters
 */
@Data
public class AttendanceQueryDto {

    private Long courseId;

    private Long studentId;

    @PastOrPresent(message = "Start date cannot be in the future")
    private LocalDate startDate;

    @PastOrPresent(message = "End date cannot be in the future")
    private LocalDate endDate;

    @Pattern(regexp = "^(PRESENT|ABSENT|LATE|EXCUSED|ALL)$",
            message = "Status must be one of: PRESENT, ABSENT, LATE, EXCUSED, ALL")
    private String status;
}
