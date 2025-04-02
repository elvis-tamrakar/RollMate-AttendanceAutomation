package com.example.RollMate.dto.Biometric_Validation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data; /**
 * Data Transfer Object for WebAuthn credential
 */
@Data
public class WebAuthnCredentialDto {
    @NotBlank(message = "Credential ID is required")
    private String credentialId;

    @NotBlank(message = "Public key is required")
    private String publicKey;

    @NotNull(message = "User ID is required")
    private Long userId;

    private String transports; // Optional field for credential transports

    @NotBlank(message = "Attestation format is required")
    private String format;

    @NotNull(message = "Counter value is required")
    @PositiveOrZero(message = "Counter must be a positive number or zero")
    private Long counter;
}
