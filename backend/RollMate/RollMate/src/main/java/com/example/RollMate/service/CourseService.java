package com.example.RollMate.service;

import com.example.RollMate.model.Course;
import com.example.RollMate.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    public List<Course> getAllClasses() {
        return courseRepository.findAll();
    }

    public List<Course> getClassesByTeacher(Long teacherId) {
        return courseRepository.findByTeacherId(teacherId);
    }

    public Course getClass(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found with id: " + id));
    }

    @Transactional
    public Course createClass(Course course) {
        return courseRepository.save(course);
    }

    @Transactional
    public Course updateClass(Long id, Course course) {
        Course existing = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found with id: " + id));

        if (course.getName() != null) {
            existing.setName(course.getName());
        }
        if (course.getDescription() != null) {
            existing.setDescription(course.getDescription());
        }
        if (course.getSchedule() != null) {
            existing.setSchedule(course.getSchedule());
        }
        if (course.getLocation() != null) {
            existing.setLocation(course.getLocation());
        }
        if (course.getStartDate() != null) {
            existing.setStartDate(course.getStartDate());
        }
        if (course.getEndDate() != null) {
            existing.setEndDate(course.getEndDate());
        }
        if (course.getGeofenceCoordinates() != null) {
            existing.setGeofenceCoordinates(course.getGeofenceCoordinates());
        }
        if (course.getGeofenceRadius() != null) {
            existing.setGeofenceRadius(course.getGeofenceRadius());
        }

        return courseRepository.save(existing);
    }

    @Transactional
    public void deleteClass(Long id) {
        Course existing = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found with id: " + id));

        courseRepository.delete(existing);
    }

    @Transactional
    public Course updateGeofence(Long id, String coordinates, Double radius) {
        Course existing = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found with id: " + id));

        existing.setGeofenceCoordinates(coordinates);
        existing.setGeofenceRadius(radius);

        return courseRepository.save(existing);
    }
}
