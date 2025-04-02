package com.example.RollMate.model;

public enum UserRole {
    STUDENT,
    TEACHER,
    ADMIN;

    // Convert from lowercase string (from frontend) to enum
    public static UserRole fromString(String role) {
        if (role == null) {
            return null;
        }

        switch (role.toLowerCase()) {
            case "student":
                return STUDENT;
            case "teacher":
                return TEACHER;
            case "admin":
                return ADMIN;
            default:
                throw new IllegalArgumentException("Unknown role: " + role);
        }
    }

    // Convert to lowercase string (for frontend)
    @Override
    public String toString() {
        return name().toLowerCase();
    }
}

