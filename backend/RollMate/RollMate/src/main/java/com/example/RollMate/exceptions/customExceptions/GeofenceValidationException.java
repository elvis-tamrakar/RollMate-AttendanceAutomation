package com.example.RollMate.exceptions.customExceptions;

import lombok.Getter;

import java.util.Map; /**
 * Exception thrown when geofence validation fails
 */
@Getter
public class GeofenceValidationException extends RuntimeException {
    private final Map<String, String> errors;
    private final Double userLatitude;
    private final Double userLongitude;
    private final Double targetLatitude;
    private final Double targetLongitude;
    private final Integer radius;
    private final Double distance;

    public GeofenceValidationException(String message, Map<String, String> errors,
                                       Double userLatitude, Double userLongitude,
                                       Double targetLatitude, Double targetLongitude,
                                       Integer radius, Double distance) {
        super(message);
        this.errors = errors;
        this.userLatitude = userLatitude;
        this.userLongitude = userLongitude;
        this.targetLatitude = targetLatitude;
        this.targetLongitude = targetLongitude;
        this.radius = radius;
        this.distance = distance;
    }

    public GeofenceValidationException(String message) {
        super(message);
        this.errors = null;
        this.userLatitude = null;
        this.userLongitude = null;
        this.targetLatitude = null;
        this.targetLongitude = null;
        this.radius = null;
        this.distance = null;
    }
}
