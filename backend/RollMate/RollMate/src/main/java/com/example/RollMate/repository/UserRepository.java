package com.example.RollMate.repository;

import com.example.RollMate.model.User;
import com.example.RollMate.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    List<User> findByRole(UserRole role);
    List<User> findByClassId(Long classId);
}
