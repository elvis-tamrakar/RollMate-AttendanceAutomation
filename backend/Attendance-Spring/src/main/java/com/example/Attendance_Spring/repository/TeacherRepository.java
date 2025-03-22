package com.example.Attendance_Spring.repository;

import com.example.Attendance_Spring.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {
}
