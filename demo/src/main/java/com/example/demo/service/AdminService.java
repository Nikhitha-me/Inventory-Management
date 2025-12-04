package com.example.demo.service;

import com.example.demo.model.Admin;
import com.example.demo.repository.AdminRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }
    // AdminService.java
    public boolean isAnyAdminExists() {
        return adminRepository.count() > 0;
    }
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    public Optional<Admin> getAdminById(Long id) {
        return adminRepository.findById(id);
    }

    public Admin createAdmin(Admin admin) {
        // Check if email already exists
        if (adminRepository.existsByEmail(admin.getEmail())) {
            throw new RuntimeException("Email already exists: " + admin.getEmail());
        }

        // Encode password
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));

        return adminRepository.save(admin);
    }

    public Admin updateAdmin(Long id, Admin adminDetails) {
        return adminRepository.findById(id)
                .map(admin -> {
                    // Check if email is being changed and if new email already exists
                    if (!admin.getEmail().equals(adminDetails.getEmail()) &&
                            adminRepository.existsByEmail(adminDetails.getEmail())) {
                        throw new RuntimeException("Email already exists: " + adminDetails.getEmail());
                    }

                    admin.setName(adminDetails.getName());
                    admin.setEmail(adminDetails.getEmail());

                    // Only update password if it's provided and not empty
                    if (adminDetails.getPassword() != null &&
                            !adminDetails.getPassword().trim().isEmpty()) {
                        admin.setPassword(passwordEncoder.encode(adminDetails.getPassword()));
                    }


                    admin.setRightsPrivileges(adminDetails.getRightsPrivileges());
                    admin.setStatus(adminDetails.getStatus());


                    return adminRepository.save(admin);
                })
                .orElse(null);
    }

    public boolean deleteAdmin(Long id) {
        if (adminRepository.existsById(id)) {
            adminRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public boolean isEmailExists(String email) {
        return adminRepository.existsByEmail(email);
    }

    public Optional<Admin> findByEmail(String email) {
        return adminRepository.findByEmail(email);
    }

    public boolean verifyAdminCredentials(String email, String password) {
        Optional<Admin> admin = adminRepository.findByEmail(email);
        return admin.map(a -> passwordEncoder.matches(password, a.getPassword())).orElse(false);
    }
}