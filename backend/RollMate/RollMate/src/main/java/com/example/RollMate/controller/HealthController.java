package com.example.RollMate.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private static final Logger logger = LoggerFactory.getLogger(HealthController.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();

        try {
            logger.info("Performing health check...");
            logger.debug("Testing database connection...");
            logger.debug("Database URL: {}", System.getenv("DATABASE_URL"));

            // Test database connectivity
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);

            response.put("status", "UP");
            response.put("database", "Connected");
            logger.info("Health check completed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Health check failed: {}", e.getMessage(), e);
            response.put("status", "DOWN");
            response.put("database", "Error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}