package com.example.Attendance_Spring.service;

import com.example.Attendance_Spring.entity.User;
import com.example.Attendance_Spring.entity.Geofence;
import com.example.Attendance_Spring.entity.UserGeofence;
import com.example.Attendance_Spring.repository.UserRepository;
import com.example.Attendance_Spring.repository.GeofenceRepository;
import com.example.Attendance_Spring.repository.UserGeofenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserGeofenceService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GeofenceRepository geofenceRepository;

    @Autowired
    private UserGeofenceRepository userGeofenceRepository;

    /**
     * Links a user to a geofence and saves the relationship with metadata.
     *
     * @param userId The ID of the user.
     * @param geofenceId The ID of the geofence.
     * @return The saved UserGeofence record.
     */
    public UserGeofence addUserToGeofence(Long userId, Long geofenceId) {
        // Fetch the user and geofence from the database.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Geofence geofence = geofenceRepository.findById(geofenceId)
                .orElseThrow(() -> new RuntimeException("Geofence not found"));

        // Create the join entity and set the relationships.
        UserGeofence userGeofence = new UserGeofence();
        userGeofence.setUser(user);
        userGeofence.setGeofence(geofence);

        // Save the relationship. Timestamps are set automatically.
        return userGeofenceRepository.save(userGeofence);
    }

    public List<UserGeofence> getUsersForGeofence(Long geofenceId) {
        Geofence geofence = geofenceRepository.findById(geofenceId)
                .orElseThrow(() -> new RuntimeException("Geofence not found"));
        return userGeofenceRepository.findByGeofence(geofence);
    }
}
