package com.example.demo.service;

import com.example.demo.model.Staff;
import com.example.demo.repository.StaffRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class StaffService {

    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;

    public StaffService(StaffRepository staffRepository, PasswordEncoder passwordEncoder) {
        this.staffRepository = staffRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Staff> getAllStaff() {
        return staffRepository.findAll();
    }

    public Staff getStaffById(Long id) {
        return staffRepository.findById(id).orElse(null);
    }


    public Staff createStaff(Staff staff) {
        System.out.println("Creating staff with email: " + staff.getEmail());

        // Check if email already exists
        if (staffRepository.existsByEmail(staff.getEmail())) {
            throw new RuntimeException("Email already exists: " + staff.getEmail());
        }

        // Validate required fields
        validateStaffFields(staff);

        // Encode password
        staff.setPassword(passwordEncoder.encode(staff.getPassword()));
        staff.setCreatedDate(LocalDateTime.now());
        staff.setUpdatedDate(LocalDateTime.now());

        // Set default values if not provided
        if (staff.getRightsPrivileges() == null || staff.getRightsPrivileges().trim().isEmpty()) {
            staff.setRightsPrivileges("BASIC");
        }
        if (staff.getStatus() == null || staff.getStatus().trim().isEmpty()) {
            staff.setStatus("ACTIVE");
        }

        Staff savedStaff = staffRepository.save(staff);
        System.out.println("Staff created successfully with ID: " + savedStaff.getId());
        return savedStaff;
    }

    public Staff updateStaff(Long id, Staff staffDetails) {
        return staffRepository.findById(id)
                .map(staff -> {
                    // Check if email is being changed and if new email already exists
                    if (!staff.getEmail().equals(staffDetails.getEmail()) &&
                            staffRepository.existsByEmail(staffDetails.getEmail())) {
                        throw new RuntimeException("Email already exists: " + staffDetails.getEmail());
                    }

                    staff.setName(staffDetails.getName());
                    staff.setEmail(staffDetails.getEmail());

                    // Only update password if it's provided and not empty
                    if (staffDetails.getPassword() != null &&
                            !staffDetails.getPassword().trim().isEmpty()) {
                        staff.setPassword(passwordEncoder.encode(staffDetails.getPassword()));
                    }

                    staff.setDesignation(staffDetails.getDesignation());
                    staff.setDepartment(staffDetails.getDepartment());
                    staff.setPhoneNumber(staffDetails.getPhoneNumber());
                    staff.setRightsPrivileges(staffDetails.getRightsPrivileges());
                    staff.setStatus(staffDetails.getStatus());
                    staff.setUpdatedDate(LocalDateTime.now());

                    return staffRepository.save(staff);
                })
                .orElse(null);
    }
    public Staff getCurrentStaffProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return staffRepository.findByEmail(email).orElse(null);
    }
    public Staff findByEmail(String email) {
        return staffRepository.findByEmail(email).orElse(null);
    }

    public boolean deleteStaff(Long id) {
        if (staffRepository.existsById(id)) {
            staffRepository.deleteById(id);
            return true;
        }
        return false;
    }
    public List<Staff> searchStaff(String query) {
        return staffRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
    }

    public boolean isEmailExists(String email) {
        return staffRepository.existsByEmail(email);
    }

    public List<Staff> getStaffByStatus(String status) {
        return staffRepository.findByStatus(status);
    }

    // Verify staff credentials for login
    public boolean verifyStaffCredentials(String email, String password) {
        Optional<Staff> staff = staffRepository.findByEmail(email);
        return staff.map(s -> passwordEncoder.matches(password, s.getPassword())).orElse(false);
    }

    public Staff updateStaffStatus(Long id, String status) {
        Optional<Staff> optionalStaff = staffRepository.findById(id);
        if (optionalStaff.isPresent()) {
            Staff staff = optionalStaff.get();
            staff.setStatus(status);
            return staffRepository.save(staff);
        }
        return null;
    }
    // Get staff by email
    public Optional<Staff> getStaffByEmail(String email) {
        return staffRepository.findByEmail(email);
    }

    // Validate staff fields
    private void validateStaffFields(Staff staff) {
        if (staff.getName() == null || staff.getName().trim().isEmpty()) {
            throw new RuntimeException("Name is required");
        }
        if (staff.getEmail() == null || staff.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        if (staff.getPassword() == null || staff.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Password is required");
        }
        if (staff.getPhoneNumber() == null || staff.getPhoneNumber().trim().isEmpty()) {
            throw new RuntimeException("Phone number is required");
        }
        if (staff.getDesignation() == null || staff.getDesignation().trim().isEmpty()) {
            throw new RuntimeException("Designation is required");
        }
        if (staff.getDepartment() == null || staff.getDepartment().trim().isEmpty()) {
            throw new RuntimeException("Department is required");
        }
    }
}