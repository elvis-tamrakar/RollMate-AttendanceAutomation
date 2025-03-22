package com.example.Attendance_Spring.controller;

import com.example.Attendance_Spring.entity.UserGeofence;
import com.example.Attendance_Spring.entity.UserGeofenceRequest;
import com.example.Attendance_Spring.service.UserGeofenceService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-geofences")
public class UserGeofenceController {

    @Autowired
    private UserGeofenceService userGeofenceService;

    @PostMapping("/add")
    public ResponseEntity<String> addUserToGeofence(@RequestBody UserGeofenceRequest request) {
        try {
            UserGeofence userGeofence = userGeofenceService.addUserToGeofence(request.getUserId(), request.getGeofenceId());
            return ResponseEntity.ok("User linked to geofence successfully with ID: " + userGeofence.getId());
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }


    @GetMapping("/geofence/{geofenceId}")
    public ResponseEntity<?> getUsersForGeofence(@PathVariable Long geofenceId) {
        try {
            // Call the service method to fetch the users for the given geofence
            List<UserGeofence> userGeofences = userGeofenceService.getUsersForGeofence(geofenceId);

            // Return the result or a 'not found' message if the list is empty
            if (userGeofences.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No users found for the given geofence");
            }

            return ResponseEntity.ok(userGeofences);
        } catch (EntityNotFoundException ex) {
            // Catch the exception and return a 404 response
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }


}
