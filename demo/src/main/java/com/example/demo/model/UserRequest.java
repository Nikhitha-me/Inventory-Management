package com.example.demo.model;

public class UserRequest {
    private String name;
    private String email;
    private String password;
    private String phoneNumber;
    private String rightsPrivileges = "BASIC_USER";
    private String status = "ACTIVE";

    // Default constructor
    public UserRequest() {}

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getRightsPrivileges() { return rightsPrivileges; }
    public void setRightsPrivileges(String rightsPrivileges) { this.rightsPrivileges = rightsPrivileges; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @Override
    public String toString() {
        return "UserRequest{" +
                "name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", rightsPrivileges='" + rightsPrivileges + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}