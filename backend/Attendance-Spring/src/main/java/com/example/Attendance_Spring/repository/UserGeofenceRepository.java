package com.example.Attendance_Spring.repository;

import com.example.Attendance_Spring.entity.Geofence;
import com.example.Attendance_Spring.entity.UserGeofence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserGeofenceRepository extends JpaRepository<UserGeofence, Long> {
    List<UserGeofence> findByGeofence(Geofence geofence);


}
