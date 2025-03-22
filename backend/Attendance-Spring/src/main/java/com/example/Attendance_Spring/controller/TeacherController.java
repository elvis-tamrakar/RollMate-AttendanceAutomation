package com.example.Attendance_Spring.controller;

import com.example.Attendance_Spring.entity.Teacher;
import com.example.Attendance_Spring.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teachers")
public class TeacherController {

    @Autowired
    private TeacherService teacherService;

    @GetMapping
    public List<Teacher> getAllTeachers(){
        return teacherService.getAllTeachers();
    }

    @GetMapping("/{id}")
    public Teacher getTeacherById(@PathVariable Long id){
        return teacherService.getTeacherById(id);
    }

    @PostMapping
    public Teacher addTeacher(@RequestBody Teacher teacher){
        return teacherService.saveTeacher(teacher);
    }
}
