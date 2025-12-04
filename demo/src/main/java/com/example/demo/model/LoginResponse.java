package com.example.demo.model;

public class LoginResponse {
    private boolean success;
    private String message;
    private String token;
    private User user;
    private Staff staff;
    private Admin admin;

    // Constructors
    public LoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public LoginResponse(boolean success, String message, String token, User user, Staff staff, Admin admin) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.user = user;
        this.staff = staff;
        this.admin = admin;
    }

    // Getters and setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Staff getStaff() { return staff; }
    public void setStaff(Staff staff) { this.staff = staff; }

    public Admin getAdmin() { return admin; }
    public void setAdmin(Admin admin) { this.admin = admin; }
}