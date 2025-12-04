package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User createUser(User user) {
        // Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists: " + user.getEmail());
        }

        // Hash password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedDate(LocalDateTime.now());
        user.setUpdatedDate(LocalDateTime.now());

        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        return userRepository.findById(id)
                .map(user -> {
                    // Check if email is being changed and if new email already exists
                    if (!user.getEmail().equals(userDetails.getEmail()) &&
                            userRepository.existsByEmail(userDetails.getEmail())) {
                        throw new RuntimeException("Email already exists: " + userDetails.getEmail());
                    }

                    user.setName(userDetails.getName());
                    user.setEmail(userDetails.getEmail());

                    // Only update password if it's provided and different
                    if (userDetails.getPassword() != null &&
                            !userDetails.getPassword().isEmpty() &&
                            !passwordEncoder.matches(userDetails.getPassword(), user.getPassword())) {
                        user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
                    }

                    user.setPhoneNumber(userDetails.getPhoneNumber());
                    user.setRightsPrivileges(userDetails.getRightsPrivileges());
                    user.setStatus(userDetails.getStatus());
                    user.setUpdatedDate(LocalDateTime.now());

                    return userRepository.save(user);
                })
                .orElse(null);
    }

    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public boolean isEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findByEmailAndStatus(String email, String status) {
        return userRepository.findByEmailAndStatus(email, status);
    }

    // Add this method to your existing UserService class
    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}
