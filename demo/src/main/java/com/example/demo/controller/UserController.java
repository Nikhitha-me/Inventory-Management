package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.model.UserRequest;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // All authenticated users can view users (but consider if this should be restricted)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')") // Only ADMIN and STAFF can view all users
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // Users can view their own profile, admins/staff can view any
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or (hasRole('USER') and @userSecurity.isOwnProfile(#id))")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Only admins can create users (or make this public for registration)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or isAnonymous()") // Allow anonymous for registration
    public ResponseEntity<?> createUser(@Valid @RequestBody UserRequest userRequest,
                                        BindingResult bindingResult) {
        try {
            if (bindingResult.hasErrors()) {
                return createValidationErrorResponse(bindingResult);
            }

            User user = convertToEntity(userRequest);
            User createdUser = userService.createUser(user);
            return ResponseEntity.ok(createdUser);

        } catch (RuntimeException e) {
            return createErrorResponse("Email already exists", e.getMessage(), HttpStatus.CONFLICT);
        } catch (Exception e) {
            return createErrorResponse("Failed to create user", e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // Users can update their own profile, admins can update any
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('USER') and @userSecurity.isOwnProfile(#id))")
    public ResponseEntity<?> updateUser(@PathVariable Long id,
                                        @Valid @RequestBody UserRequest userRequest,
                                        BindingResult bindingResult) {
        try {
            if (bindingResult.hasErrors()) {
                return createValidationErrorResponse(bindingResult);
            }

            User userDetails = convertToEntity(userRequest);
            User updatedUser = userService.updateUser(id, userDetails);
            if (updatedUser != null) {
                return ResponseEntity.ok(updatedUser);
            }
            return ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            return createErrorResponse("Email already exists", e.getMessage(), HttpStatus.CONFLICT);
        } catch (Exception e) {
            return createErrorResponse("Failed to update user", e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // Only admins can delete users
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        boolean deleted = userService.deleteUser(id);
        return deleted ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    // Public endpoint for email checking (used during registration)
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Object>> checkEmailExists(@RequestParam String email) {
        boolean exists = userService.isEmailExists(email);
        Map<String, Object> response = new HashMap<>();
        response.put("email", email);
        response.put("exists", exists);
        response.put("message", exists ? "Email already registered" : "Email available");
        return ResponseEntity.ok(response);
    }

    // Helper methods
    private ResponseEntity<Map<String, Object>> createValidationErrorResponse(BindingResult bindingResult) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "Validation failed");
        errorResponse.put("message", "Please check the input data");
        errorResponse.put("details", bindingResult.getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.toList()));
        return ResponseEntity.badRequest().body(errorResponse);
    }

    private ResponseEntity<Map<String, String>> createErrorResponse(String error, String message, HttpStatus status) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", error);
        errorResponse.put("message", message);
        return ResponseEntity.status(status).body(errorResponse);
    }

    private User convertToEntity(UserRequest userRequest) {
        User user = new User();
        user.setName(userRequest.getName());
        user.setEmail(userRequest.getEmail());
        user.setPassword(userRequest.getPassword());
        user.setPhoneNumber(userRequest.getPhoneNumber());
        user.setRightsPrivileges(userRequest.getRightsPrivileges());
        user.setStatus(userRequest.getStatus());
        return user;
    }
}