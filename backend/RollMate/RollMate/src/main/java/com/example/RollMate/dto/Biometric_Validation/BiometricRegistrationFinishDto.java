package com.example.RollMate.dto.Biometric_Validation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data; /**
 * Data Transfer Object for completing biometric registration
 */
@Data
public class BiometricRegistrationFinishDto {
    @NotBlank(message = "User ID is required")
    private String userId;

    @NotNull(message = "Registration response is required")
    private Object registrationResponse; // Complex WebAuthn object
}
