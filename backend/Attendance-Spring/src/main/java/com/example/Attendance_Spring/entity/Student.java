package com.example.Attendance_Spring.entity;

import jakarta.persistence.*;

import java.util.List;
import java.util.Set;

@Entity
public class Student extends User {

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "biometric_data_id")
    private BiometricData biometricData;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<Attendance> attendanceRecords;

    @ManyToOne
    @JoinColumn(name = "classroom_id")
    private Classroom classroom;

    @ManyToMany
    @JoinTable(
            name = "student_geofence",
            joinColumns = @JoinColumn(name = "student_id"),
            inverseJoinColumns = @JoinColumn(name = "geofence_id")
    )
    private Set<Geofence> geofences;  // FIX: Correct Many-to-Many relationship

    public Student() {
        super();
        setRole(Role.STUDENT);  // Automatically set as STUDENT
    }

    public Student(String email, String password, Classroom classroom) {
        super(email, password, Role.STUDENT);
        this.classroom = classroom;
    }


    public BiometricData getBiometricData() { return biometricData; }

    public void setBiometricData(BiometricData biometricData) { this.biometricData = biometricData; }

    public List<Attendance> getAttendanceRecords() { return attendanceRecords; }

    public void setAttendanceRecords(List<Attendance> attendanceRecords) { this.attendanceRecords = attendanceRecords; }

    public Classroom getClassroom() { return classroom; }

    public void setClassroom(Classroom classroom) { this.classroom = classroom; }

    public Set<Geofence> getGeofences() { return geofences; }  // FIX: Corrected Many-to-Many accessor

    public void setGeofences(Set<Geofence> geofences) { this.geofences = geofences; }
}
