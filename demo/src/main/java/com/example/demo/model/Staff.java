package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "staff")
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String designation;

    @Column(nullable = false)
    private String department;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "rights_privileges")
    private String rightsPrivileges = "BASIC_STAFF";

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    private String status = "ACTIVE";

    // Default constructor
    public Staff() {}

    // Constructor with parameters
    public Staff(String name, String email, String password, String designation, String department,
                 String phoneNumber, String rightsPrivileges, String status) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.designation = designation;
        this.department = department;
        this.phoneNumber = phoneNumber;
        this.rightsPrivileges = rightsPrivileges;
        this.status = status;
        this.createdDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public LocalDateTime getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(LocalDateTime updatedDate) { this.updatedDate = updatedDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @Override
    public String toString() {
        return "Staff{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", designation='" + designation + '\'' +
                ", department='" + department + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", rightsPrivileges='" + rightsPrivileges + '\'' +
                ", status='" + status + '\'' +
                ", createdDate=" + createdDate +
                ", updatedDate=" + updatedDate +
                '}';
    }
}