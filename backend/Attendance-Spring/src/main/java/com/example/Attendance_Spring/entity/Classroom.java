package com.example.Attendance_Spring.entity;
import jakarta.persistence.*;
import java.util.List;

@Entity
public class Classroom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @OneToMany(mappedBy = "classroom", cascade = CascadeType.ALL)
    private List<Student> students;

    public Classroom() {}

    public Classroom(String name, Teacher teacher) {
        this.name = name;
        this.teacher = teacher;
    }

    public Long getId() { return id; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public Teacher getTeacher() { return teacher; }

    public void setTeacher(Teacher teacher) { this.teacher = teacher; }

    public List<Student> getStudents() { return students; }

    public void setStudents(List<Student> students) { this.students = students; }
}
