package com.example.RollMate.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Column(name = "class_id")
    private Long classId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "username")
    private String username;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        // If username is not set, use email as username
        if (username == null || username.isEmpty()) {
            username = email;
        }
    }
}
