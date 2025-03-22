package com.example.Attendance_Spring.repository;

import com.example.Attendance_Spring.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {
}
