package com.example.RollMate.controller;

import com.example.RollMate.model.User;
import com.example.RollMate.model.UserRole;
import com.example.RollMate.security.JwtRequest;
import com.example.RollMate.security.JwtResponse;
import com.example.RollMate.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth") // Removed /api prefix because it's already added in application.properties
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        System.out.println("==== LOGIN ENDPOINT HIT ====");

        // Frontend sends email, backend expects username
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        System.out.println("Login attempt for email: " + email);

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required"));
        }

        try {
            // Create a JwtRequest object with email as username for compatibility
            JwtRequest request = new JwtRequest(email, password);

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            JwtResponse jwtResponse = authService.generateJwtToken(authentication);

            // Log success
            System.out.println("Generated token: " + jwtResponse.getToken().substring(0, Math.min(10, jwtResponse.getToken().length())) + "...");
            System.out.println("Login successful for user: " + jwtResponse.getUsername());

            // For compatibility with frontend, just return the token as string if the client expects it
            if (loginRequest.containsKey("tokenOnly") && Boolean.parseBoolean(loginRequest.get("tokenOnly"))) {
                return ResponseEntity.ok(jwtResponse.getToken());
            }

            // Otherwise return the full response object
            return ResponseEntity.ok(jwtResponse);
        } catch (Exception e) {
            System.err.println("Login error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials: " + e.getMessage()));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        System.out.println("Test endpoint hit!");
        return ResponseEntity.ok("API is working!");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> requestBody) {
        System.out.println("==== REGISTER ENDPOINT HIT ====");

        try {
            // Extract fields from request map
            String email = (String) requestBody.get("email");
            String name = (String) requestBody.get("name");
            String username = (String) requestBody.get("username");
            String role = (String) requestBody.get("role");
            Long classId = requestBody.get("classId") != null ?
                    Long.valueOf(requestBody.get("classId").toString()) : null;

            // Get password - try both fields due to @JsonIgnore issue
            String password = (String) requestBody.get("password");
            String rawPassword = (String) requestBody.get("rawPassword");

            // Use rawPassword as fallback if password is null
            if (password == null) {
                password = rawPassword;
            }

            if (email == null || name == null || role == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("message",
                        "Required fields missing. Need email, name, role, and password."));
            }

            // Create and populate user object
            User user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setUsername(username != null && !username.isEmpty() ? username : email);
            user.setRole(UserRole.valueOf(role));
            user.setPassword(password);
            if (classId != null) {
                user.setClassId(classId);
            }

            System.out.println("User details: " + user.getEmail() + ", " + user.getName() +
                    ", role: " + user.getRole() + ", password present: " +
                    (user.getPassword() != null));

            User registeredUser = authService.register(user);
            System.out.println("User registered with ID: " + registeredUser.getId());
            return ResponseEntity.ok(registeredUser);
        } catch (Exception e) {
            System.err.println("Registration error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            User user = authService.getUserByUsername(userDetails.getUsername());
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }
    }
}