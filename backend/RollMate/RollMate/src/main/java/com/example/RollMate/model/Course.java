package com.example.RollMate.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "classes")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private User teacher;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String schedule;
    private String location;

    // Geofence data
    private String geofenceCoordinates; // Format: "latitude,longitude"
    private Double geofenceRadius; // In meters, changed to Double to match service method

    @ManyToMany
    @JoinTable(
            name = "student_courses",
            joinColumns = @JoinColumn(name = "course_id"),
            inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    @JsonIgnore
    private Set<User> students = new HashSet<>();

    // Constructors
    public Course() {
    }

    public Course(String name, String description, User teacher) {
        this.name = name;
        this.description = description;
        this.teacher = teacher;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public User getTeacher() {
        return teacher;
    }

    public void setTeacher(User teacher) {
        this.teacher = teacher;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public String getSchedule() {
        return schedule;
    }

    public void setSchedule(String schedule) {
        this.schedule = schedule;
    }

    public String getGeofenceCoordinates() {
        return geofenceCoordinates;
    }

    public void setGeofenceCoordinates(String geofenceCoordinates) {
        this.geofenceCoordinates = geofenceCoordinates;
    }

    public Double getGeofenceRadius() {
        return geofenceRadius;
    }

    public void setGeofenceRadius(Double geofenceRadius) {
        this.geofenceRadius = geofenceRadius;
    }

    public Set<User> getStudents() {
        return students;
    }

    public void setStudents(Set<User> students) {
        this.students = students;
    }

    // Helper methods
    public void addStudent(User student) {
        this.students.add(student);
    }

    public void removeStudent(User student) {
        this.students.remove(student);
    }

    @Override
    public String toString() {
        return "Course{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", teacherId=" + (teacher != null ? teacher.getId() : null) +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", schedule='" + schedule + '\'' +
                ", geofenceCoordinates='" + geofenceCoordinates + '\'' +
                ", geofenceRadius=" + geofenceRadius +
                '}';
    }
}