package com.example.Attendance_Spring.repository;

import com.example.Attendance_Spring.entity.Geofence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GeofenceRepository extends JpaRepository<Geofence, Long> {
}
