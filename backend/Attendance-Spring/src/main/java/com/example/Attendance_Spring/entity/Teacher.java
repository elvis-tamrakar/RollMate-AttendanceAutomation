package com.example.Attendance_Spring.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
public class Teacher extends User {

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore  // Prevents infinite recursion in JSON responses
    private List<Classroom> classes;

    public Teacher() {
        super();
        setRole(Role.TEACHER); // Automatically set as TEACHER
    }

    public Teacher(String email, String password) {
        super(email, password, Role.TEACHER);
    }

    public List<Classroom> getClasses() { return classes; }

    public void setClasses(List<Classroom> classes) { this.classes = classes; }
}
