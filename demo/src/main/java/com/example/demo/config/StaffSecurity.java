package com.example.demo.config;

import com.example.demo.model.Staff;
import com.example.demo.service.StaffService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("staffSecurity")
public class StaffSecurity {

    private final StaffService staffService;

    public StaffSecurity(StaffService staffService) {
        this.staffService = staffService;
    }

    public boolean isOwnProfile(Long staffId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String currentUsername = authentication.getName();
        Staff currentStaff = staffService.findByEmail(currentUsername);

        return currentStaff != null && currentStaff.getId().equals(staffId);
    }
}