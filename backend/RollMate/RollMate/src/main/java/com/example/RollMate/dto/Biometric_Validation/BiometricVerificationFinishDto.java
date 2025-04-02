package com.example.RollMate.dto.Biometric_Validation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data; /**
 * Data Transfer Object for completing biometric verification
 */
@Data
public class BiometricVerificationFinishDto {
    @NotBlank(message = "User ID is required")
    private String userId;

    @NotNull(message = "Verification response is required")
    private Object verificationResponse; // Complex WebAuthn object
}
