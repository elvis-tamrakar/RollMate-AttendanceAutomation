package com.example.Attendance_Spring.entity;

import jakarta.persistence.*;

@Entity
public class BiometricData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fingerprintHash;

    @OneToOne
    @JoinColumn(name = "student_id")
    private Student student; // FIX: Associate with Student instead of User

    public BiometricData() {}

    public BiometricData(String fingerprintHash, Student student) {
        this.fingerprintHash = fingerprintHash;
        this.student = student;
    }

    public Long getId() { return id; }

    public String getFingerprintHash() { return fingerprintHash; }

    public void setFingerprintHash(String fingerprintHash) { this.fingerprintHash = fingerprintHash; }

    public Student getStudent() { return student; }

    public void setStudent(Student student) { this.student = student; }
}
