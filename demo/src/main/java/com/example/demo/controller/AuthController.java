package com.example.demo.controller;

import com.example.demo.config.JwtUtil;
import com.example.demo.model.*;
import com.example.demo.service.AdminService;
import com.example.demo.service.StaffService;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final StaffService staffService;
    private final AdminService adminService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, StaffService staffService,
                          AdminService adminService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.staffService = staffService;
        this.adminService = adminService;
        this.jwtUtil = jwtUtil;
    }

    // LOGIN endpoint - Auto-detect user type
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest,
                                   BindingResult bindingResult) {
        try {
            System.out.println("=== LOGIN REQUEST ===");
            System.out.println("Email: " + loginRequest.getEmail());

            // Check for validation errors
            if (bindingResult.hasErrors()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Validation failed");
                errorResponse.put("message", "Please check the input data");
                errorResponse.put("details", bindingResult.getFieldErrors()
                        .stream()
                        .map(error -> error.getField() + ": " + error.getDefaultMessage())
                        .collect(Collectors.toList()));
                return ResponseEntity.badRequest().body(errorResponse);
            }

            String email = loginRequest.getEmail();
            String password = loginRequest.getPassword();

            // Try to login as Admin first, then Staff, then User
            ResponseEntity<?> adminResponse = tryAdminLogin(email, password);
            if (adminResponse != null) return adminResponse;

            ResponseEntity<?> staffResponse = tryStaffLogin(email, password);
            if (staffResponse != null) return staffResponse;

            ResponseEntity<?> userResponse = tryUserLogin(email, password);
            if (userResponse != null) return userResponse;

            // If no account found
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse(false, "Invalid email or password", null, null, null, null));

        } catch (Exception e) {
            System.out.println("Login error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new LoginResponse(false, "Login failed: " + e.getMessage(), null, null, null, null));
        }
    }

    private ResponseEntity<?> tryAdminLogin(String email, String password) {
        Optional<Admin> adminOptional = adminService.findByEmail(email);
        if (adminOptional.isPresent()) {
            Admin admin = adminOptional.get();
            if (!"ACTIVE".equalsIgnoreCase(admin.getStatus())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new LoginResponse(false, "Admin account is not active. Current status: " + admin.getStatus(), null, null, null, null));
            }
            if (adminService.verifyAdminCredentials(email, password)) {
                String token = jwtUtil.generateToken(email, "ADMIN", admin.getId());
                admin.setPassword(null);
                return ResponseEntity.ok(new LoginResponse(true, "Admin login successful", token, null, null, admin));
            }
        }
        return null;
    }

    private ResponseEntity<?> tryStaffLogin(String email, String password) {
        Optional<Staff> staffOptional = staffService.getStaffByEmail(email);
        if (staffOptional.isPresent()) {
            Staff staff = staffOptional.get();
            if (!"ACTIVE".equalsIgnoreCase(staff.getStatus())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new LoginResponse(false, "Staff account is not active. Current status: " + staff.getStatus(), null, null, null, null));
            }
            if (staffService.verifyStaffCredentials(email, password)) {
                String token = jwtUtil.generateToken(email, "STAFF", staff.getId());
                staff.setPassword(null);
                return ResponseEntity.ok(new LoginResponse(true, "Staff login successful", token, null, staff, null));
            }
        }
        return null;
    }

    private ResponseEntity<?> tryUserLogin(String email, String password) {
        Optional<User> userOptional = userService.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new LoginResponse(false, "User account is not active. Current status: " + user.getStatus(), null, null, null, null));
            }
            if (userService.verifyPassword(password, user.getPassword())) {
                String token = jwtUtil.generateToken(email, "USER", user.getId());
                user.setPassword(null);
                return ResponseEntity.ok(new LoginResponse(true, "User login successful", token, user, null, null));
            }
        }
        return null;
    }

    // REGISTER endpoint for Users (Customers)
    @PostMapping("/register/user")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRequest userRequest,
                                          BindingResult bindingResult) {
        try {
            System.out.println("=== USER REGISTRATION REQUEST ===");
            System.out.println("User Data: " + userRequest.toString());

            if (bindingResult.hasErrors()) {
                return createValidationErrorResponse(bindingResult);
            }

            // Set default status to ACTIVE
            if (userRequest.getStatus() == null || userRequest.getStatus().isEmpty()) {
                userRequest.setStatus("ACTIVE");
            }
            if (userRequest.getRightsPrivileges() == null || userRequest.getRightsPrivileges().isEmpty()) {
                userRequest.setRightsPrivileges("BASIC_USER");
            }
            // Convert to entity and create user
            User user = convertToUserEntity(userRequest);
            User createdUser = userService.createUser(user);

            // Remove password from response
            createdUser.setPassword(null);

            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("success", true);
            successResponse.put("message", "User registered successfully");
            successResponse.put("user", createdUser);

            return ResponseEntity.status(HttpStatus.CREATED).body(successResponse);

        } catch (RuntimeException e) {
            return createErrorResponse("Registration failed", e.getMessage(), HttpStatus.CONFLICT);
        } catch (Exception e) {
            return createErrorResponse("Registration failed", e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // REGISTER endpoint for Staff
    @PostMapping("/register/staff")
    public ResponseEntity<?> registerStaff(@Valid @RequestBody StaffRequest staffRequest,
                                           BindingResult bindingResult) {
        try {
            System.out.println("=== STAFF REGISTRATION REQUEST ===");
            System.out.println("Staff Data: " + staffRequest.toString());

            if (bindingResult.hasErrors()) {
                return createValidationErrorResponse(bindingResult);
            }

            // Set default status if not provided
            if (staffRequest.getStatus() == null || staffRequest.getStatus().isEmpty()) {
                staffRequest.setStatus("ACTIVE");
            }

            // Set default rights if not provided
            if (staffRequest.getRightsPrivileges() == null || staffRequest.getRightsPrivileges().isEmpty()) {
                staffRequest.setRightsPrivileges("BASIC_STAFF");
            }

            // Convert DTO to Entity
            Staff staff = convertToStaffEntity(staffRequest);
            Staff createdStaff = staffService.createStaff(staff);

            // Remove password from response for security
            createdStaff.setPassword(null);

            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("success", true);
            successResponse.put("message", "Staff registered successfully");
            successResponse.put("staff", createdStaff);
            return ResponseEntity.status(HttpStatus.CREATED).body(successResponse);

        } catch (RuntimeException e) {
            return createErrorResponse("Registration failed", e.getMessage(), HttpStatus.CONFLICT);
        } catch (Exception e) {
            return createErrorResponse("Registration failed", e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // Check if email exists (for all types)
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailExists(@RequestParam String email) {
        try {
            boolean userExists = userService.isEmailExists(email);
            boolean staffExists = staffService.isEmailExists(email);
            boolean adminExists = adminService.isEmailExists(email);
            boolean emailExists = userExists || staffExists || adminExists;

            Map<String, Object> response = new HashMap<>();
            response.put("email", email);
            response.put("exists", emailExists);
            response.put("userExists", userExists);
            response.put("staffExists", staffExists);
            response.put("adminExists", adminExists);
            response.put("message", emailExists ? "Email already registered" : "Email available");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return createErrorResponse("Failed to check email", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Helper methods
    private ResponseEntity<Map<String, Object>> createValidationErrorResponse(BindingResult bindingResult) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("error", "Validation failed");
        errorResponse.put("message", "Please check the input data");
        errorResponse.put("details", bindingResult.getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.toList()));
        return ResponseEntity.badRequest().body(errorResponse);
    }

    private ResponseEntity<Map<String, Object>> createErrorResponse(String error, String message, HttpStatus status) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("error", error);
        errorResponse.put("message", message);
        return ResponseEntity.status(status).body(errorResponse);
    }

    // Helper method to convert UserRequest to User entity
    private User convertToUserEntity(UserRequest userRequest) {
        User user = new User();
        user.setName(userRequest.getName());
        user.setEmail(userRequest.getEmail());
        user.setPassword(userRequest.getPassword());
        user.setPhoneNumber(userRequest.getPhoneNumber());
        user.setRightsPrivileges(userRequest.getRightsPrivileges());
        user.setStatus(userRequest.getStatus());
        return user;
    }

    // Helper method to convert StaffRequest to Staff entity
    private Staff convertToStaffEntity(StaffRequest staffRequest) {
        Staff staff = new Staff();
        staff.setName(staffRequest.getName());
        staff.setEmail(staffRequest.getEmail());
        staff.setPassword(staffRequest.getPassword());
        staff.setDesignation(staffRequest.getDesignation());
        staff.setDepartment(staffRequest.getDepartment());
        staff.setPhoneNumber(staffRequest.getPhoneNumber());
        staff.setRightsPrivileges(staffRequest.getRightsPrivileges());
        staff.setStatus(staffRequest.getStatus());
        return staff;
    }
    // AuthController.java - Add this method
    @PostMapping("/register/super-admin")
    public ResponseEntity<?> registerSuperAdmin(@RequestBody Admin admin) {
        try {
            // Check if any admin already exists
            if (adminService.isAnyAdminExists()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Super admin already exists");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            Admin createdAdmin = adminService.createAdmin(admin);
            createdAdmin.setPassword(null);

            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("success", true);
            successResponse.put("message", "Super admin created successfully");
            successResponse.put("admin", createdAdmin);
            return ResponseEntity.status(HttpStatus.CREATED).body(successResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Super admin creation failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    // TEMPORARY: Add this endpoint to reset admin data

}