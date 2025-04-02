package com.example.RollMate.exceptions.customExceptions;

import lombok.Getter;

import java.util.Map; /**
 * Exception thrown when biometric validation fails
 */
@Getter
public class BiometricValidationException extends RuntimeException {
    private final Map<String, String> errors;

    public BiometricValidationException(String message, Map<String, String> errors) {
        super(message);
        this.errors = errors;
    }

    public BiometricValidationException(String message) {
        super(message);
        this.errors = null;
    }
}
