package com.example.demo.controller;

import com.example.demo.model.Admin;
import com.example.demo.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // Create Admin (Only accessible by authenticated admins)
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createAdmin(@RequestBody Admin admin) {
        try {
            Admin createdAdmin = adminService.createAdmin(admin);
            // Remove password from response
            createdAdmin.setPassword(null);

            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("success", true);
            successResponse.put("message", "Admin created successfully");
            successResponse.put("admin", createdAdmin);
            return ResponseEntity.status(HttpStatus.CREATED).body(successResponse);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Admin creation failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Admin creation failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // Get all admins (Protected - only for admins)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Admin>> getAllAdmins() {
        List<Admin> admins = adminService.getAllAdmins();
        // Remove passwords from response
        admins.forEach(admin -> admin.setPassword(null));
        return ResponseEntity.ok(admins);
    }

    // Delete admin
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAdmin(@PathVariable Long id) {
        try {
            boolean deleted = adminService.deleteAdmin(id);
            if (deleted) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Admin deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Failed to delete admin");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Update admin
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateAdmin(@PathVariable Long id, @RequestBody Admin adminDetails) {
        try {
            Admin updatedAdmin = adminService.updateAdmin(id, adminDetails);
            if (updatedAdmin != null) {
                updatedAdmin.setPassword(null);
                return ResponseEntity.ok(updatedAdmin);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Failed to update admin");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}