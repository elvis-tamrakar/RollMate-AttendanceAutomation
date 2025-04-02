package com.example.RollMate.dto.Biometric_Validation;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * Data Transfer Object for starting biometric registration
 */
@Data
public class BiometricRegistrationStartDto {
    @NotBlank(message = "User ID is required")
    private String userId;
}

