package com.example.demo.controller;

import com.example.demo.model.Staff;
import com.example.demo.model.StaffRequest;
import com.example.demo.service.StaffService;
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
@RequestMapping("/api/staff")
public class StaffController {

    private final StaffService staffService;

    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    // GET ALL - Read (Only ADMIN can view all staff)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllStaff() {
        try {
            List<Staff> staffList = staffService.getAllStaff();
            // Remove passwords from response for security
            staffList.forEach(staff -> staff.setPassword(null));

            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("success", true);
            successResponse.put("message", "Staff retrieved successfully");
            successResponse.put("data", staffList);
            successResponse.put("count", staffList.size());

            return ResponseEntity.ok(successResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Internal server error");
            errorResponse.put("message", "Failed to retrieve staff list");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // GET BY ID - Read (ADMIN can view any staff, STAFF can view their own profile)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('STAFF') and @staffSecurity.isOwnProfile(#id))")
    public ResponseEntity<?> getStaffById(@PathVariable Long id) {
        try {
            Staff staff = staffService.getStaffById(id);
            if (staff != null) {
                // Remove password from response for security
                staff.setPassword(null);

                Map<String, Object> successResponse = new HashMap<>();
                successResponse.put("success", true);
                successResponse.put("message", "Staff retrieved successfully");
                successResponse.put("data", staff);

                return ResponseEntity.ok(successResponse);
            }

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Staff not found");
            errorResponse.put("message", "Staff with ID " + id + " not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Internal server error");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // CREATE - Insert with validation (Only ADMIN can create staff)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createStaff(@Valid @RequestBody StaffRequest staffRequest,
                                         BindingResult bindingResult) {
        try {
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

            // Convert DTO to Entity
            Staff staff = convertToEntity(staffRequest);
            Staff createdStaff = staffService.createStaff(staff);

            // Remove password from response for security
            createdStaff.setPassword(null);

            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("success", true);
            successResponse.put("message", "Staff created successfully");
            successResponse.put("data", createdStaff);

            return ResponseEntity.status(HttpStatus.CREATED).body(successResponse);

        } catch (RuntimeException e) {
            // Handle email duplication error
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Email already exists");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Failed to create staff");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // UPDATE - Update with validation (ADMIN can update any staff, STAFF can update their own profile)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('STAFF') and @staffSecurity.isOwnProfile(#id))")
    public ResponseEntity<?> updateStaff(@PathVariable Long id,
                                         @Valid @RequestBody StaffRequest staffRequest,
                                         BindingResult bindingResult) {
        try {
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

            // Convert DTO to Entity
            Staff staffDetails = convertToEntity(staffRequest);
            Staff updatedStaff = staffService.updateStaff(id, staffDetails);
            if (updatedStaff != null) {
                // Remove password from response for security
                updatedStaff.setPassword(null);

                Map<String, Object> successResponse = new HashMap<>();
                successResponse.put("success", true);
                successResponse.put("message", "Staff updated successfully");
                successResponse.put("data", updatedStaff);
                return ResponseEntity.ok(successResponse);
            }

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Staff not found");
            errorResponse.put("message", "Staff with ID " + id + " not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (RuntimeException e) {
            // Handle email duplication error
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Email already exists");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Failed to update staff");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // DELETE - Delete (Only ADMIN can delete staff)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteStaff(@PathVariable Long id) {
        try {
            boolean deleted = staffService.deleteStaff(id);
            if (deleted) {
                Map<String, Object> successResponse = new HashMap<>();
                successResponse.put("success", true);
                successResponse.put("message", "Staff deleted successfully");
                successResponse.put("deletedId", id);
                return ResponseEntity.ok(successResponse);
            }

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Staff not found");
            errorResponse.put("message", "Staff with ID " + id + " not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Failed to delete staff");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Additional endpoint to check if email exists (Public for registration checks)
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailExists(@RequestParam String email) {
        try {
            boolean exists = staffService.isEmailExists(email);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("email", email);
            response.put("exists", exists);
            response.put("message", exists ? "Email already registered" : "Email available");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Failed to check email");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Get staff by status (Only ADMIN)
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getStaffByStatus(@PathVariable String status) {
        try {
            List<Staff> staffList = staffService.getStaffByStatus(status);
            // Remove passwords from response
            staffList.forEach(staff -> staff.setPassword(null));

            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("success", true);
            successResponse.put("message", "Staff retrieved successfully");
            successResponse.put("data", staffList);
            successResponse.put("count", staffList.size());
            successResponse.put("status", status);

            return ResponseEntity.ok(successResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Failed to fetch staff by status");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Update staff status (Only ADMIN)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStaffStatus(@PathVariable Long id,
                                               @RequestBody Map<String, String> statusUpdate) {
        try {
            String newStatus = statusUpdate.get("status");
            if (newStatus == null || (!newStatus.equals("ACTIVE") && !newStatus.equals("INACTIVE"))) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Invalid status");
                errorResponse.put("message", "Status must be either 'ACTIVE' or 'INACTIVE'");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Staff updatedStaff = staffService.updateStaffStatus(id, newStatus);
            if (updatedStaff != null) {
                updatedStaff.setPassword(null);
                Map<String, Object> successResponse = new HashMap<>();
                successResponse.put("success", true);
                successResponse.put("message", "Staff status updated successfully");
                successResponse.put("data", updatedStaff);
                successResponse.put("newStatus", newStatus);
                return ResponseEntity.ok(successResponse);
            }

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Staff not found");
            errorResponse.put("message", "Staff with ID " + id + " not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Failed to update staff status");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Get current staff profile (for staff members to view their own profile)
    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<?> getCurrentStaffProfile() {
        try {
            Staff staff = staffService.getCurrentStaffProfile();
            if (staff != null) {
                staff.setPassword(null);

                Map<String, Object> successResponse = new HashMap<>();
                successResponse.put("success", true);
                successResponse.put("message", "Profile retrieved successfully");
                successResponse.put("data", staff);

                return ResponseEntity.ok(successResponse);
            }

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Profile not found");
            errorResponse.put("message", "Unable to retrieve current staff profile");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Failed to fetch profile");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Search staff by name or email (Only ADMIN)
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> searchStaff(@RequestParam String query) {
        try {
            List<Staff> staffList = staffService.searchStaff(query);
            // Remove passwords from response
            staffList.forEach(staff -> staff.setPassword(null));

            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("success", true);
            successResponse.put("message", "Staff search completed");
            successResponse.put("data", staffList);
            successResponse.put("count", staffList.size());
            successResponse.put("query", query);

            return ResponseEntity.ok(successResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Search failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Helper method to convert StaffRequest to Staff entity
    private Staff convertToEntity(StaffRequest staffRequest) {
        Staff staff = new Staff();
        staff.setName(staffRequest.getName());
        staff.setEmail(staffRequest.getEmail());
        staff.setPassword(staffRequest.getPassword()); // Password will be hashed in service
        staff.setDesignation(staffRequest.getDesignation());
        staff.setDepartment(staffRequest.getDepartment());
        staff.setPhoneNumber(staffRequest.getPhoneNumber());
        staff.setRightsPrivileges(staffRequest.getRightsPrivileges());
        staff.setStatus(staffRequest.getStatus());
        return staff;
    }
}