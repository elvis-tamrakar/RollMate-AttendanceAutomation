package com.example.Attendance_Spring.service;

import com.example.Attendance_Spring.entity.User;
import com.example.Attendance_Spring.repository.UserRepository;
import com.example.Attendance_Spring.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;  // Add this dependency

    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService() {
        this.passwordEncoder = new BCryptPasswordEncoder(); // BCryptPasswordEncoder to hash passwords
    }

    // Register a new user, hash the password before saving
    public User register(User user) {
        // Hash the password before saving it to the database
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);

        return userRepository.save(user); // Save the user with the hashed password
    }

    // Login method - compare the entered password with the stored hashed password
    public String login(String email, String password) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Generate JWT token using the JwtTokenProvider
        return jwtTokenProvider.generateToken(user.getEmail()); // Using email as the username for the token
    }
}
