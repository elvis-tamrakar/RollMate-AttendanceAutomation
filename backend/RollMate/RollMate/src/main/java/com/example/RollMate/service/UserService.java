package com.example.RollMate.service;

import com.example.RollMate.model.User;
import com.example.RollMate.model.UserRole;
import com.example.RollMate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Find a user by username
     *
     * @param username the username to find
     * @return an Optional containing the user if found
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Find a user by username, returning the user directly or null if not found
     * This method is added for convenience with the biometric controllers
     *
     * @param username the username to find
     * @return the user or null if not found
     */
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    public List<User> getUsersByClassId(Long classId) {
        return userRepository.findByClassId(classId);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }
}