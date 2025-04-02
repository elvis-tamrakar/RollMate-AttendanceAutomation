package com.example.RollMate.service;

import com.example.RollMate.model.BiometricData;

import java.util.Map;

/**
 * Service for managing biometric registration and verification
 */
public interface BiometricService {

    /**
     * Start the registration process for a user's biometric
     * @param userId the user's ID
     * @return options for the client to use for registration
     */
    Map<String, Object> startRegistration(Long userId);

    /**
     * Complete the registration process and store the biometric data
     * @param userId the user's ID
     * @param clientResponse the client's response to the registration challenge
     * @return the stored biometric data
     */
    BiometricData completeRegistration(Long userId, Map<String, Object> clientResponse);

    /**
     * Start the verification process for a user's biometric
     * @param userId the user's ID
     * @return options for the client to use for verification
     */
    Map<String, Object> startVerification(Long userId);

    /**
     * Complete the verification process
     * @param userId the user's ID
     * @param clientResponse the client's response to the verification challenge
     * @return true if verification was successful, false otherwise
     */
    boolean completeVerification(Long userId, Map<String, Object> clientResponse);

    /**
     * Check if a user has registered biometric data
     * @param userId the user's ID
     * @return true if the user has registered biometric data, false otherwise
     */
    boolean hasBiometrics(Long userId);

    /**
     * Delete a user's biometric data
     * @param userId the user's ID
     * @return true if the data was deleted, false otherwise
     */
    boolean deleteBiometricData(Long userId);
}