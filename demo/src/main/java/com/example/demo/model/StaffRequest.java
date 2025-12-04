package com.example.demo.model;

import jakarta.validation.constraints.*;

public class StaffRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Designation is required")
    @Size(min = 2, max = 50, message = "Designation must be between 2 and 50 characters")
    private String designation;

    @NotBlank(message = "Department is required")
    @Size(min = 2, max = 50, message = "Department must be between 2 and 50 characters")
    private String department;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Phone number must be 10-15 digits")
    private String phoneNumber;

    private String rightsPrivileges = "BASIC_STAFF";

    private String status = "ACTIVE";

    // Default constructor
    public StaffRequest() {}

    // Parameterized constructor
    public StaffRequest(String name, String email, String password, String designation, String department,
                        String phoneNumber, String rightsPrivileges, String status) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.designation = designation;
        this.department = department;
        this.phoneNumber = phoneNumber;
        this.rightsPrivileges = rightsPrivileges;
        this.status = status;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getRightsPrivileges() { return rightsPrivileges; }
    public void setRightsPrivileges(String rightsPrivileges) { this.rightsPrivileges = rightsPrivileges; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @Override
    public String toString() {
        return "StaffRequest{" +
                "name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", password='" + (password != null ? "[PROVIDED]" : "[NULL]") + '\'' +
                ", designation='" + designation + '\'' +
                ", department='" + department + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", rightsPrivileges='" + rightsPrivileges + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}