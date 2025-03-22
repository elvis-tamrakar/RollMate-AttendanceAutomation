package com.example.Attendance_Spring.security;

import java.util.Base64;
import java.security.SecureRandom;

public class KeyGenerator {
    public static void main(String[] args) {
        byte[] key = new byte[32]; // 256-bit key
        new SecureRandom().nextBytes(key);
        String encodedKey = Base64.getEncoder().encodeToString(key);
        System.out.println("Generated Key: " + encodedKey);
    }
}
