package com.example.demo.service;

import com.example.demo.model.Staff;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

public class StaffValidationTest {

    private Validator validator;
    private Staff validStaff;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();

        // Create a valid staff instance for testing
        validStaff = new Staff();
        validStaff.setName("John Doe");
        validStaff.setEmail("john.doe@example.com");
        validStaff.setDesignation("Senior Manager");
        validStaff.setDepartment("Information Technology");
        validStaff.setPhoneNumber("+1234567890");
        validStaff.setRightsPrivileges("READ_WRITE_DELETE");
        validStaff.setStatus("ACTIVE");
    }

    @Test
    void testValidStaff() {
        Set<ConstraintViolation<Staff>> violations = validator.validate(validStaff);
        assertTrue(violations.isEmpty(),
                "No validation errors expected for valid staff. Violations: " + violations);
    }

    @Test
    void testInvalidNameTooShort() {
        Staff staff = new Staff();
        staff.setName("J"); // Too short
        staff.setEmail("john.doe@example.com");
        staff.setDesignation("Manager");
        staff.setDepartment("IT");
        staff.setPhoneNumber("+1234567890");
        staff.setRightsPrivileges("READ_WRITE");
        staff.setStatus("ACTIVE");

        Set<ConstraintViolation<Staff>> violations = validator.validate(staff);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Name must be between 2 and 50 characters")));
    }

    @Test
    void testInvalidNameNull() {
        Staff staff = new Staff();
        staff.setName(null); // Null name
        staff.setEmail("john.doe@example.com");
        staff.setDesignation("Manager");
        staff.setDepartment("IT");
        staff.setPhoneNumber("+1234567890");
        staff.setRightsPrivileges("READ_WRITE");
        staff.setStatus("ACTIVE");

        Set<ConstraintViolation<Staff>> violations = validator.validate(staff);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Name is required")));
    }

    @Test
    void testInvalidNameCharacters() {
        Staff staff = new Staff();
        staff.setName("John@Doe123"); // Invalid characters
        staff.setEmail("john.doe@example.com");
        staff.setDesignation("Manager");
        staff.setDepartment("IT");
        staff.setPhoneNumber("+1234567890");
        staff.setRightsPrivileges("READ_WRITE");
        staff.setStatus("ACTIVE");

        Set<ConstraintViolation<Staff>> violations = validator.validate(staff);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Name can only contain letters, spaces, apostrophes, hyphens, and dots")));
    }

    @Test
    void testInvalidEmailFormat() {
        Staff staff = new Staff();
        staff.setName("John Doe");
        staff.setEmail("invalid-email"); // Invalid email format
        staff.setDesignation("Manager");
        staff.setDepartment("IT");
        staff.setPhoneNumber("+1234567890");
        staff.setRightsPrivileges("READ_WRITE");
        staff.setStatus("ACTIVE");

        Set<ConstraintViolation<Staff>> violations = validator.validate(staff);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Email should be valid")));
    }

    @Test
    void testInvalidEmailNull() {
        Staff staff = new Staff();
        staff.setName("John Doe");
        staff.setEmail(null); // Null email
        staff.setDesignation("Manager");
        staff.setDepartment("IT");
        staff.setPhoneNumber("+1234567890");
        staff.setRightsPrivileges("READ_WRITE");
        staff.setStatus("ACTIVE");

        Set<ConstraintViolation<Staff>> violations = validator.validate(staff);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Email is required")));
    }

    @Test
    void testInvalidPhoneNumberTooShort() {
        Staff staff = new Staff();
        staff.setName("John Doe");
        staff.setEmail("john.doe@example.com");
        staff.setDesignation("Manager");
        staff.setDepartment("IT");
        staff.setPhoneNumber("123"); // Too short
        staff.setRightsPrivileges("READ_WRITE");
        staff.setStatus("ACTIVE");

        Set<ConstraintViolation<Staff>> violations = validator.validate(staff);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Phone number must be 10-15 digits, optionally starting with +")));
    }

    @Test
    void testInvalidPhoneNumberCharacters() {
        Staff staff = new Staff();
        staff.setName("John Doe");
        staff.setEmail("john.doe@example.com");
        staff.setDesignation("Manager");
        staff.setDepartment("IT");
        staff.setPhoneNumber("+123-456-789"); // Invalid characters
        staff.setRightsPrivileges("READ_WRITE");
        staff.setStatus("ACTIVE");

        Set<ConstraintViolation<Staff>> violations = validator.validate(staff);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Phone number must be 10-15 digits, optionally starting with +")));
    }

    @Test
    void testInvalidPhoneNumberNull() {
        Staff staff = new Staff();
        staff.setName("John Doe");
        staff.setEmail("john.doe@example.com");
        staff.setDesignation("Manager");
        staff.setDepartment("IT");
        staff.setPhoneNumber(null); // Null phone number
        staff.setRightsPrivileges("READ_WRITE");
        staff.setStatus("ACTIVE");

        Set<ConstraintViolation<Staff>> violations = validator.validate(staff);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Phone number is required")));
    }

    @Test
    void testInvalidDesignationTooShort() {
        Staff staff = new Staff();
        staff.setName("John Doe");
        staff.setEmail("john.doe@example.com");
        staff.setDesignation("M"); // Too short
        staff.setDepartment("IT");
        staff.setPhoneNumber("+1234567890");
        staff.setRightsPrivileges("READ_WRITE");
        staff.setStatus("ACTIVE");

        Set<ConstraintViolation<Staff>> violations = validator.validate(staff);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Designation must be between 2 and 50 characters")));
    }

    @Test
    void testInvalidDesignationNull() {
        Staff staff = new Staff();
        staff.setName("John Doe");
        staff.setEmail("john.doe@example.com");
        staff.setDesignation(null); // Null designation
        staff.setDepartment("IT");
        staff.setPhoneNumber("+1234567890");
        staff.setRightsPrivileges("READ_WRITE");
        staff.setStatus("ACTIVE");

        Set<ConstraintViolation<Staff>> violations = validator.validate(staff);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Designation is required")));
    }

    @Test
    void testInvalidDepartmentTooShort() {
        Staff staff = new Staff();
        staff.setName("John Doe");
        staff.setEmail("john.doe@example.com");
        staff.setDesignation("Manager");
        staff.setDepartment("I"); // Too short
        staff.setPhoneNumber("+1234567890");
        staff.setRightsPrivileges("READ_WRITE");
        staff.setStatus("ACTIVE");

        Set<ConstraintViolation<Staff>> violations = validator.validate(staff);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Department must be between 2 and 50 characters")));
    }

    @Test
    void testInvalidDepartmentNull() {
        Staff staff = new Staff();
        staff.setName("John Doe");
        staff.setEmail("john.doe@example.com");
        staff.setDesignation("Manager");
        staff.setDepartment(null); // Null department
        staff.setPhoneNumber("+1234567890");
        staff.setRightsPrivileges("READ_WRITE");
        staff.setStatus("ACTIVE");

        Set<ConstraintViolation<Staff>> violations = validator.validate(staff);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Department is required")));
    }

    @Test
    void testInvalidRightsPrivilegesTooShort() {
        Staff staff = new Staff();
        staff.setName("John Doe");
        staff.setEmail("john.doe@example.com");
        staff.setDesignation("Manager");
        staff.setDepartment("IT");
        staff.setPhoneNumber("+1234567890");
        staff.setRightsPrivileges("R"); // Too short
        staff.setStatus("ACTIVE");

        Set<ConstraintViolation<Staff>> violations = validator.validate(staff);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Rights and privileges must be between 2 and 100 characters")));
    }

    @Test
    void testInvalidRightsPrivilegesNull() {
        Staff staff = new Staff();
        staff.setName("John Doe");
        staff.setEmail("john.doe@example.com");
        staff.setDesignation("Manager");
        staff.setDepartment("IT");
        staff.setPhoneNumber("+1234567890");
        staff.setRightsPrivileges(null); // Null rights privileges
        staff.setStatus("ACTIVE");

        Set<ConstraintViolation<Staff>> violations = validator.validate(staff);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Rights and privileges are required")));
    }

    @Test
    void testInvalidStatus() {
        Staff staff = new Staff();
        staff.setName("John Doe");
        staff.setEmail("john.doe@example.com");
        staff.setDesignation("Manager");
        staff.setDepartment("IT");
        staff.setPhoneNumber("+1234567890");
        staff.setRightsPrivileges("READ_WRITE");
        staff.setStatus("INVALID_STATUS"); // Invalid status

        Set<ConstraintViolation<Staff>> violations = validator.validate(staff);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Status must be ACTIVE, INACTIVE, SUSPENDED, or TERMINATED")));
    }

    @Test
    void testInvalidStatusNull() {
        Staff staff = new Staff();
        staff.setName("John Doe");
        staff.setEmail("john.doe@example.com");
        staff.setDesignation("Manager");
        staff.setDepartment("IT");
        staff.setPhoneNumber("+1234567890");
        staff.setRightsPrivileges("READ_WRITE");
        staff.setStatus(null); // Null status

        Set<ConstraintViolation<Staff>> violations = validator.validate(staff);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Status is required")));
    }

    @Test
    void testValidPhoneNumberWithPlus() {
        Staff staff = new Staff();
        staff.setName("John Doe");
        staff.setEmail("john.doe@example.com");
        staff.setDesignation("Manager");
        staff.setDepartment("IT");
        staff.setPhoneNumber("+441234567890"); // Valid with country code
        staff.setRightsPrivileges("READ_WRITE");
        staff.setStatus("ACTIVE");

        Set<ConstraintViolation<Staff>> violations = validator.validate(staff);
        assertTrue(violations.isEmpty(),
                "Phone number with plus should be valid. Violations: " + violations);
    }

    @Test
    void testValidPhoneNumberWithoutPlus() {
        Staff staff = new Staff();
        staff.setName("John Doe");
        staff.setEmail("john.doe@example.com");
        staff.setDesignation("Manager");
        staff.setDepartment("IT");
        staff.setPhoneNumber("1234567890"); // Valid without plus
        staff.setRightsPrivileges("READ_WRITE");
        staff.setStatus("ACTIVE");

        Set<ConstraintViolation<Staff>> violations = validator.validate(staff);
        assertTrue(violations.isEmpty(),
                "Phone number without plus should be valid. Violations: " + violations);
    }

    @Test
    void testValidEmailWithSubdomain() {
        Staff staff = new Staff();
        staff.setName("John Doe");
        staff.setEmail("john.doe@company.co.uk"); // Valid email with subdomain
        staff.setDesignation("Manager");
        staff.setDepartment("IT");
        staff.setPhoneNumber("+1234567890");
        staff.setRightsPrivileges("READ_WRITE");
        staff.setStatus("ACTIVE");

        Set<ConstraintViolation<Staff>> violations = validator.validate(staff);
        assertTrue(violations.isEmpty(),
                "Email with subdomain should be valid. Violations: " + violations);
    }

    @Test
    void testValidDifferentStatusValues() {
        String[] validStatuses = {"ACTIVE", "INACTIVE", "SUSPENDED", "TERMINATED"};

        for (String status : validStatuses) {
            Staff staff = new Staff();
            staff.setName("John Doe");
            staff.setEmail("john.doe@example.com");
            staff.setDesignation("Manager");
            staff.setDepartment("IT");
            staff.setPhoneNumber("+1234567890");
            staff.setRightsPrivileges("READ_WRITE");
            staff.setStatus(status);

            Set<ConstraintViolation<Staff>> violations = validator.validate(staff);
            assertTrue(violations.isEmpty(),
                    "Status '" + status + "' should be valid. Violations: " + violations);
        }
    }
}