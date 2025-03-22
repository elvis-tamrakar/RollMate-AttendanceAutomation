package com.example.Attendance_Spring.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
public class UserGeofence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many-to-one relationship to User
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Many-to-one relationship to Geofence
    @ManyToOne
    @JoinColumn(name = "geofence_id")
    private Geofence geofence;

    // Automatically set when the record is created
    @CreationTimestamp
    private LocalDateTime createdAt;

    // Automatically updated when the record is modified
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Constructors, getters, and setters
    public UserGeofence() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Geofence getGeofence() {
        return geofence;
    }

    public void setGeofence(Geofence geofence) {
        this.geofence = geofence;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
