package com.example.Attendance_Spring.repository;

import com.example.Attendance_Spring.entity.BiometricData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BiometricDataRepository extends JpaRepository<BiometricData, Long> {
}
