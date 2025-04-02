package com.example.RollMate.dto.User_Validation;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data; /**
 * Data Transfer Object for password reset request
 */
@Data
public class PasswordResetRequestDto {

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;
}
