package com.example.RollMate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "class_id", nullable = false)
    private Long classId;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String status; // 'present', 'absent', 'late'

    @Column(name = "verification_method")
    private String verificationMethod; // 'biometric', 'manual', 'geofence'

    private String note;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }

        if (date == null) {
            date = timestamp.toLocalDate();
        }

        if (verificationMethod == null) {
            if (latitude != null && longitude != null) {
                verificationMethod = "geofence";
            } else {
                verificationMethod = "manual";
            }
        }
    }
}