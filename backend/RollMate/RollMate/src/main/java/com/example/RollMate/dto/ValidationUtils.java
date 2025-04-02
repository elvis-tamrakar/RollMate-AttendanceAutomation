package com.example.RollMate.dto;

import com.example.RollMate.exception.GeofenceValidationException;
import com.example.RollMate.exception.ValidationException;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Utility class for common validation operations
 */
public class ValidationUtils {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$"
    );

    private static final double EARTH_RADIUS_KM = 6371.0; // Earth radius in kilometers

    /**
     * Validates an email address
     *
     * @param email Email address to validate
     * @return True if the email is valid, false otherwise
     */
    public static boolean isValidEmail(String email) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();
    }

    /**
     * Validates a password based on complexity requirements
     *
     * @param password Password to validate
     * @return Map of errors if any, empty map if valid
     */
    public static Map<String, String> validatePassword(String password) {
        Map<String, String> errors = new HashMap<>();

        if (password == null || password.isEmpty()) {
            errors.put("password", "Password cannot be empty");
            return errors;
        }

        if (password.length() < 8) {
            errors.put("password", "Password must be at least 8 characters long");
        }

        if (!Pattern.compile("[A-Z]").matcher(password).find()) {
            errors.put("passwordUppercase", "Password must contain at least one uppercase letter");
        }

        if (!Pattern.compile("[a-z]").matcher(password).find()) {
            errors.put("passwordLowercase", "Password must contain at least one lowercase letter");
        }

        if (!Pattern.compile("[0-9]").matcher(password).find()) {
            errors.put("passwordDigit", "Password must contain at least one digit");
        }

        if (!Pattern.compile("[^a-zA-Z0-9]").matcher(password).find()) {
            errors.put("passwordSpecial", "Password must contain at least one special character");
        }

        return errors;
    }

    /**
     * Validates a timestamp string is in ISO 8601 format
     *
     * @param timestamp Timestamp string to validate
     * @return True if the timestamp is valid, false otherwise
     */
    public static boolean isValidTimestamp(String timestamp) {
        try {
            LocalDateTime.parse(timestamp, DateTimeFormatter.ISO_DATE_TIME);
            return true;
        } catch (DateTimeParseException e) {
            return false;
        }
    }

    /**
     * Validates coordinates are within the valid range
     *
     * @param latitude Latitude to validate
     * @param longitude Longitude to validate
     * @return Map of errors if any, empty map if valid
     */
    public static Map<String, String> validateCoordinates(Double latitude, Double longitude) {
        Map<String, String> errors = new HashMap<>();

        if (latitude == null) {
            errors.put("latitude", "Latitude cannot be null");
        } else if (latitude < -90.0 || latitude > 90.0) {
            errors.put("latitude", "Latitude must be between -90 and 90");
        }

        if (longitude == null) {
            errors.put("longitude", "Longitude cannot be null");
        } else if (longitude < -180.0 || longitude > 180.0) {
            errors.put("longitude", "Longitude must be between -180 and 180");
        }

        return errors;
    }

    /**
     * Calculates the distance between two points on the Earth's surface using the Haversine formula
     *
     * @param lat1 Latitude of the first point
     * @param lon1 Longitude of the first point
     * @param lat2 Latitude of the second point
     * @param lon2 Longitude of the second point
     * @return Distance in meters
     */
    public static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Convert latitude and longitude from degrees to radians
        double latRad1 = Math.toRadians(lat1);
        double lonRad1 = Math.toRadians(lon1);
        double latRad2 = Math.toRadians(lat2);
        double lonRad2 = Math.toRadians(lon2);

        // Haversine formula
        double dLat = latRad2 - latRad1;
        double dLon = lonRad2 - lonRad1;
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(latRad1) * Math.cos(latRad2) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distanceKm = EARTH_RADIUS_KM * c;

        // Convert to meters
        return distanceKm * 1000;
    }

    /**
     * Validates if a user is within a geofenced area
     *
     * @param userLat User's latitude
     * @param userLng User's longitude
     * @param geofenceLat Geofence center latitude
     * @param geofenceLng Geofence center longitude
     * @param radiusInMeters Geofence radius in meters
     * @throws GeofenceValidationException if user is outside the geofence
     */
    public static void validateGeofence(
            double userLat, double userLng,
            double geofenceLat, double geofenceLng,
            int radiusInMeters) {

        // Validate coordinates
        Map<String, String> userCoordErrors = validateCoordinates(userLat, userLng);
        Map<String, String> geofenceCoordErrors = validateCoordinates(geofenceLat, geofenceLng);

        Map<String, String> errors = new HashMap<>();
        errors.putAll(userCoordErrors);
        errors.putAll(geofenceCoordErrors);

        if (!errors.isEmpty()) {
            throw new GeofenceValidationException("Invalid coordinates", errors);
        }

        // Calculate distance
        double distance = calculateDistance(userLat, userLng, geofenceLat, geofenceLng);

        // Validate distance against radius
        if (distance > radiusInMeters) {
            Map<String, String> distanceErrors = new HashMap<>();
            distanceErrors.put("distance", "User is outside the geofence area. Distance: " +
                    String.format("%.2f", distance) + "m, Allowed radius: " + radiusInMeters + "m");

            throw new GeofenceValidationException(
                    "User is outside the geofence area",
                    distanceErrors,
                    userLat, userLng,
                    geofenceLat, geofenceLng,
                    radiusInMeters,
                    distance
            );
        }
    }

    /**
     * Validates that a given value is not null
     *
     * @param value Value to check
     * @param fieldName Name of the field
     * @throws ValidationException if the value is null
     */
    public static void validateNotNull(Object value, String fieldName) {
        if (value == null) {
            Map<String, String> errors = new HashMap<>();
            errors.put(fieldName, fieldName + " cannot be null");
            throw new ValidationException(fieldName + " cannot be null", errors);
        }
    }

    /**
     * Validates that a string is not empty
     *
     * @param value String to check
     * @param fieldName Name of the field
     * @throws ValidationException if the string is null or empty
     */
    public static void validateNotEmpty(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            Map<String, String> errors = new HashMap<>();
            errors.put(fieldName, fieldName + " cannot be empty");
            throw new ValidationException(fieldName + " cannot be empty", errors);
        }
    }
}