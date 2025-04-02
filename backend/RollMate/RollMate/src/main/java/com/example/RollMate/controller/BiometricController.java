package com.example.RollMate.controller;

import com.example.RollMate.model.BiometricData;
import com.example.RollMate.model.User;
import com.example.RollMate.service.BiometricService;
import com.example.RollMate.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/biometrics")
@CrossOrigin
public class BiometricController {

    @Autowired
    private BiometricService biometricService;

    @Autowired
    private UserService userService;

    /**
     * Start the biometric registration process
     * This generates a challenge that the client will use for registration
     */
    @PostMapping("/register/start")
    @PreAuthorize("hasAnyAuthority('student', 'STUDENT')")
    public ResponseEntity<?> startRegistration() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userService.getUserByUsername(username);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "User not found",
                    "success", false
            ));
        }

        Map<String, Object> registrationOptions = biometricService.startRegistration(user.getId());
        return ResponseEntity.ok(registrationOptions);
    }

    /**
     * Complete the biometric registration process
     * This verifies the client's response and stores the credential
     */
    @PostMapping("/register/complete")
    @PreAuthorize("hasAnyAuthority('student', 'STUDENT')")
    public ResponseEntity<?> completeRegistration(@RequestBody Map<String, Object> clientResponse) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userService.getUserByUsername(username);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "User not found",
                    "success", false
            ));
        }

        try {
            BiometricData data = biometricService.completeRegistration(user.getId(), clientResponse);
            return ResponseEntity.ok(Map.of(
                    "message", "Biometric registration successful",
                    "success", true,
                    "biometricId", data.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Biometric registration failed: " + e.getMessage(),
                    "success", false
            ));
        }
    }

    /**
     * Start the biometric verification process
     * This generates a challenge that the client will use for verification
     */
    @PostMapping("/verify/start")
    @PreAuthorize("hasAnyAuthority('student', 'STUDENT')")
    public ResponseEntity<?> startVerification() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userService.getUserByUsername(username);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "User not found",
                    "success", false
            ));
        }

        // Check if user has registered biometrics
        if (!biometricService.hasBiometrics(user.getId())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "No biometric data found for user. Please register first.",
                    "success", false,
                    "needsRegistration", true
            ));
        }

        Map<String, Object> verificationOptions = biometricService.startVerification(user.getId());
        return ResponseEntity.ok(verificationOptions);
    }

    /**
     * Complete the biometric verification process
     * This verifies the client's response
     */
    @PostMapping("/verify/complete")
    @PreAuthorize("hasAnyAuthority('student', 'STUDENT')")
    public ResponseEntity<?> completeVerification(@RequestBody Map<String, Object> clientResponse) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userService.getUserByUsername(username);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "User not found",
                    "success", false
            ));
        }

        try {
            boolean verified = biometricService.completeVerification(user.getId(), clientResponse);
            if (verified) {
                return ResponseEntity.ok(Map.of(
                        "message", "Biometric verification successful",
                        "success", true
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Biometric verification failed",
                        "success", false
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Biometric verification failed: " + e.getMessage(),
                    "success", false
            ));
        }
    }

    /**
     * Check if a user has registered biometric data
     */
    @GetMapping("/status")
    @PreAuthorize("hasAnyAuthority('student', 'STUDENT') or hasAnyAuthority('teacher', 'TEACHER')")
    public ResponseEntity<?> checkBiometricStatus() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userService.getUserByUsername(username);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "User not found",
                    "success", false
            ));
        }

        boolean hasBiometrics = biometricService.hasBiometrics(user.getId());
        return ResponseEntity.ok(Map.of(
                "registered", hasBiometrics,
                "success", true
        ));
    }

    /**
     * Delete a user's biometric data
     */
    @DeleteMapping
    @PreAuthorize("hasAnyAuthority('student', 'STUDENT') or hasAnyAuthority('admin', 'ADMIN')")
    public ResponseEntity<?> deleteBiometricData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userService.getUserByUsername(username);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "User not found",
                    "success", false
            ));
        }

        boolean deleted = biometricService.deleteBiometricData(user.getId());
        if (deleted) {
            return ResponseEntity.ok(Map.of(
                    "message", "Biometric data deleted successfully",
                    "success", true
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Failed to delete biometric data",
                    "success", false
            ));
        }
    }
}