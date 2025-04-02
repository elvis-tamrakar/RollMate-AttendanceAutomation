package com.example.RollMate.repository;

import com.example.RollMate.model.BiometricData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BiometricDataRepository extends JpaRepository<BiometricData, Long> {

    /**
     * Find biometric data by user ID
     * @param userId the user's ID
     * @return the biometric data, if found
     */
    Optional<BiometricData> findByUserId(Long userId);
}