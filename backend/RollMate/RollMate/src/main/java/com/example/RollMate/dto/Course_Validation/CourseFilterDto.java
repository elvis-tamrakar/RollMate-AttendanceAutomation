package com.example.RollMate.dto.Course_Validation;

import lombok.Data; /**
 * Data Transfer Object for course search/filter
 */
@Data
public class CourseFilterDto {

    private String name;

    private Long teacherId;

    private String schedule;

    private String location;
}
