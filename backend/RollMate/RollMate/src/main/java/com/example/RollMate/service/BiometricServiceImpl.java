package com.example.RollMate.service;

import com.example.RollMate.model.BiometricData;
import com.example.RollMate.repository.BiometricDataRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class BiometricServiceImpl implements BiometricService {

    @Autowired
    private BiometricDataRepository biometricDataRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final SecureRandom secureRandom = new SecureRandom();

    // Cache to store temporary challenges and data during registration/verification process
    private final Map<Long, Map<String, Object>> challengeCache = new HashMap<>();

    /**
     * Generate a random challenge
     *
     * @return a random challenge as a Base64 string
     */
    private String generateChallenge() {
        byte[] challenge = new byte[32]; // 256 bits
        secureRandom.nextBytes(challenge);
        return Base64.getEncoder().encodeToString(challenge);
    }

    @Override
    public Map<String, Object> startRegistration(Long userId) {
        // Generate a challenge for the registration process
        String challenge = generateChallenge();

        Map<String, Object> publicKeyOptions = new HashMap<>();
        publicKeyOptions.put("challenge", challenge);
        publicKeyOptions.put("rp", Map.of(
                "name", "RollMate Attendance System",
                "id", "rollmate.example.com"
        ));
        publicKeyOptions.put("user", Map.of(
                "id", Base64.getEncoder().encodeToString(userId.toString().getBytes()),
                "name", "user" + userId,
                "displayName", "User " + userId
        ));
        publicKeyOptions.put("pubKeyCredParams", new Object[]{
                Map.of("type", "public-key", "alg", -7),  // ES256
                Map.of("type", "public-key", "alg", -257) // RS256
        });
        publicKeyOptions.put("timeout", 60000);
        publicKeyOptions.put("attestation", "direct");
        publicKeyOptions.put("authenticatorSelection", Map.of(
                "authenticatorAttachment", "platform",
                "requireResidentKey", false,
                "userVerification", "preferred"
        ));

        // Store the challenge for verification
        Map<String, Object> sessionData = new HashMap<>();
        sessionData.put("challenge", challenge);
        sessionData.put("timestamp", Instant.now().getEpochSecond());
        challengeCache.put(userId, sessionData);

        return publicKeyOptions;
    }

    @Override
    public BiometricData completeRegistration(Long userId, Map<String, Object> clientResponse) {
        // Get stored challenge
        Map<String, Object> sessionData = challengeCache.get(userId);
        if (sessionData == null) {
            throw new IllegalStateException("Registration session expired or invalid");
        }

        String expectedChallenge = (String) sessionData.get("challenge");

        // Verify the challenge
        // In a real implementation, we'd perform cryptographic verification of the WebAuthn response
        // For now, we're simplifying by just checking the response contains valid data

        String credentialId = extractCredentialId(clientResponse);
        String publicKey = extractPublicKey(clientResponse);

        if (credentialId == null || publicKey == null) {
            throw new IllegalArgumentException("Invalid credential data received");
        }

        // Remove the challenge from cache
        challengeCache.remove(userId);

        // Delete any existing biometric data for this user
        deleteBiometricData(userId);

        // Store the biometric credential
        BiometricData data = new BiometricData();
        data.setUserId(userId);
        data.setCredentialId(credentialId);
        data.setPublicKey(publicKey);
        data.setCreatedAt(Instant.now());

        // Save and return the biometric data
        return biometricDataRepository.save(data);
    }

    @Override
    public Map<String, Object> startVerification(Long userId) {
        // Check if user has registered biometric data
        if (!hasBiometrics(userId)) {
            throw new IllegalStateException("No biometric data found for user");
        }

        // Retrieve stored credential
        BiometricData biometricData = biometricDataRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("No biometric data found"));

        // Generate a new challenge
        String challenge = generateChallenge();

        Map<String, Object> publicKeyOptions = new HashMap<>();
        publicKeyOptions.put("challenge", challenge);
        publicKeyOptions.put("timeout", 60000);
        publicKeyOptions.put("rpId", "rollmate.example.com");
        publicKeyOptions.put("allowCredentials", new Object[]{
                Map.of(
                        "id", biometricData.getCredentialId(),
                        "type", "public-key"
                )
        });
        publicKeyOptions.put("userVerification", "preferred");

        // Store the challenge for verification
        Map<String, Object> sessionData = new HashMap<>();
        sessionData.put("challenge", challenge);
        sessionData.put("timestamp", Instant.now().getEpochSecond());
        challengeCache.put(userId, sessionData);

        return publicKeyOptions;
    }

    @Override
    public boolean completeVerification(Long userId, Map<String, Object> clientResponse) {
        // Get stored challenge
        Map<String, Object> sessionData = challengeCache.get(userId);
        if (sessionData == null) {
            throw new IllegalStateException("Verification session expired or invalid");
        }

        String expectedChallenge = (String) sessionData.get("challenge");

        // Retrieve stored credential
        BiometricData biometricData = biometricDataRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("No biometric data found"));

        // Verify the credential
        // In a real implementation, we'd perform cryptographic verification of the WebAuthn response
        // For now, we're simplifying by just checking if the credential ID matches

        String credentialId = extractCredentialId(clientResponse);
        if (credentialId == null || !credentialId.equals(biometricData.getCredentialId())) {
            return false;
        }

        // Remove the challenge from cache
        challengeCache.remove(userId);

        // Update last used timestamp
        biometricData.setLastUsed(Instant.now());
        biometricDataRepository.save(biometricData);

        return true;
    }

    @Override
    public boolean hasBiometrics(Long userId) {
        return biometricDataRepository.findByUserId(userId).isPresent();
    }

    @Override
    public boolean deleteBiometricData(Long userId) {
        Optional<BiometricData> data = biometricDataRepository.findByUserId(userId);
        if (data.isPresent()) {
            biometricDataRepository.delete(data.get());
            return true;
        }
        return false;
    }

    /**
     * Extract the credential ID from the client response
     */
    private String extractCredentialId(Map<String, Object> clientResponse) {
        try {
            // This would depend on the exact structure of the client response
            // Here we're assuming a standard WebAuthn response structure
            @SuppressWarnings("unchecked")
            Map<String, Object> credential = (Map<String, Object>) clientResponse.get("credential");
            if (credential != null) {
                return (String) credential.get("id");
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Extract the public key from the client response
     */
    private String extractPublicKey(Map<String, Object> clientResponse) {
        try {
            // In a real implementation, this would extract the public key from the attestation
            // Here we're simplifying by assuming it's directly available
            @SuppressWarnings("unchecked")
            Map<String, Object> credential = (Map<String, Object>) clientResponse.get("credential");
            if (credential != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> response = (Map<String, Object>) credential.get("response");
                if (response != null) {
                    return (String) response.get("publicKey");
                }
            }

            // If not found through that path, look for attestationObject
            String attestationObject = (String) clientResponse.get("attestationObject");
            if (attestationObject != null) {
                // In real implementation, we'd parse the CBOR-encoded attestation object
                // For simplicity, we'll just return it as-is
                return attestationObject;
            }

            return null;
        } catch (Exception e) {
            return null;
        }
    }
}