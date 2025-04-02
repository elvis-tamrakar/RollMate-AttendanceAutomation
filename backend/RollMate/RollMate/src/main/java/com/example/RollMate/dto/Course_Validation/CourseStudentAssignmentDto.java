package com.example.RollMate.dto.Course_Validation;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List; /**
 * Data Transfer Object for assigning students to a course
 */
@Data
public class CourseStudentAssignmentDto {

    @NotNull(message = "Course ID is required")
    @Positive(message = "Course ID must be a positive number")
    private Long courseId;

    @NotEmpty(message = "At least one student ID is required")
    private List<Long> studentIds;
}
