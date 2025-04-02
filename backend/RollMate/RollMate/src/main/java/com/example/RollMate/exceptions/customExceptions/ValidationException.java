package com.example.RollMate.exceptions.customExceptions;

import lombok.Getter;

import java.util.Map; /**
 * Exception thrown when data validation fails
 */
@Getter
public class ValidationException extends RuntimeException {
    private final Map<String, String> errors;

    public ValidationException(String message, Map<String, String> errors) {
        super(message);
        this.errors = errors;
    }

    public ValidationException(String message) {
        super(message);
        this.errors = null;
    }
}
