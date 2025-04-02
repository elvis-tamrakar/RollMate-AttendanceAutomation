package com.example.RollMate.exceptions;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standard API error response format
 */
@Data
@AllArgsConstructor
public class ApiError {
    private HttpStatus status;
    private String message;
    private Map<String, String> errors;
    private String path;
    private LocalDateTime timestamp;
}