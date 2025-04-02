package com.example.RollMate.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

/**
 * A very simple controller with endpoints to debug authorization issues
 */
@RestController
@RequestMapping("/debug-auth")
public class SimpleDebugController {

    @GetMapping("/public")
    public ResponseEntity<Map<String, Object>> publicEndpoint(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "This is a public endpoint that anyone can access");
        response.put("headers", getHeadersInfo(request));

        // Add authentication info if available
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            response.put("authenticated", auth.isAuthenticated());
            response.put("principal", auth.getPrincipal().toString());
            response.put("authorities", auth.getAuthorities().toString());
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/student")
    @PreAuthorize("hasAnyAuthority('student', 'STUDENT')")
    public ResponseEntity<Map<String, Object>> studentEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "You have successfully accessed a STUDENT endpoint");

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        response.put("user", auth.getName());
        response.put("authorities", auth.getAuthorities().toString());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/teacher")
    @PreAuthorize("hasAnyAuthority('teacher', 'TEACHER')")
    public ResponseEntity<Map<String, Object>> teacherEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "You have successfully accessed a TEACHER endpoint");

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        response.put("user", auth.getName());
        response.put("authorities", auth.getAuthorities().toString());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAnyAuthority('admin', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> adminEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "You have successfully accessed an ADMIN endpoint");

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        response.put("user", auth.getName());
        response.put("authorities", auth.getAuthorities().toString());

        return ResponseEntity.ok(response);
    }

    private Map<String, String> getHeadersInfo(HttpServletRequest request) {
        Map<String, String> map = new HashMap<>();
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String key = headerNames.nextElement();
            String value = request.getHeader(key);
            map.put(key, value);
        }
        return map;
    }
}