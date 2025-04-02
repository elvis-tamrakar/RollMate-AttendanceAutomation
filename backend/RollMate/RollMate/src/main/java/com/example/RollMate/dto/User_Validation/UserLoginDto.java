package com.example.RollMate.dto.User_Validation;

import jakarta.validation.constraints.NotBlank;
import lombok.Data; /**
 * Data Transfer Object for user login
 */
@Data
public class UserLoginDto {

    @NotBlank(message = "Username or email is required")
    private String username; // Can be either username or email

    @NotBlank(message = "Password is required")
    private String password;
}
