package com.example.demo.service;

import com.example.demo.model.Product;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

public class ProductValidationTest {

    private Validator validator;
    private Product validProduct;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();

        // Create a valid product instance for testing
        validProduct = new Product();
        validProduct.setProductName("Laptop Computer");
        validProduct.setModel("XPS 13");
        validProduct.setPricePerQuantity(999.99);
        validProduct.setUnitStockQuantity(50);
        validProduct.setStatus("ACTIVE");
        validProduct.calculateTotalPrice();
    }

    @Test
    void testValidProduct() {
        Set<ConstraintViolation<Product>> violations = validator.validate(validProduct);
        assertTrue(violations.isEmpty(),
                "No validation errors expected for valid product. Violations: " + violations);
    }

    @Test
    void testInvalidProductNameTooShort() {
        Product product = new Product();
        product.setProductName("A"); // Too short
        product.setModel("XPS 13");
        product.setPricePerQuantity(999.99);
        product.setUnitStockQuantity(50);
        product.setStatus("ACTIVE");

        Set<ConstraintViolation<Product>> violations = validator.validate(product);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Product name must be between 2 and 100 characters")));
    }

    @Test
    void testInvalidProductNameNull() {
        Product product = new Product();
        product.setProductName(null); // Null name
        product.setModel("XPS 13");
        product.setPricePerQuantity(999.99);
        product.setUnitStockQuantity(50);
        product.setStatus("ACTIVE");

        Set<ConstraintViolation<Product>> violations = validator.validate(product);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Product name is required")));
    }

    @Test
    void testInvalidPriceNegative() {
        Product product = new Product();
        product.setProductName("Laptop Computer");
        product.setModel("XPS 13");
        product.setPricePerQuantity(-10.0); // Negative price
        product.setUnitStockQuantity(50);
        product.setStatus("ACTIVE");

        Set<ConstraintViolation<Product>> violations = validator.validate(product);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Price must be at least 0.01")));
    }

    @Test
    void testInvalidPriceNull() {
        Product product = new Product();
        product.setProductName("Laptop Computer");
        product.setModel("XPS 13");
        product.setPricePerQuantity(null); // Null price
        product.setUnitStockQuantity(50);
        product.setStatus("ACTIVE");

        Set<ConstraintViolation<Product>> violations = validator.validate(product);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Price per quantity is required")));
    }

    @Test
    void testInvalidQuantityNegative() {
        Product product = new Product();
        product.setProductName("Laptop Computer");
        product.setModel("XPS 13");
        product.setPricePerQuantity(999.99);
        product.setUnitStockQuantity(-5); // Negative quantity
        product.setStatus("ACTIVE");

        Set<ConstraintViolation<Product>> violations = validator.validate(product);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Unit stock quantity cannot be negative")));
    }

    @Test
    void testInvalidQuantityNull() {
        Product product = new Product();
        product.setProductName("Laptop Computer");
        product.setModel("XPS 13");
        product.setPricePerQuantity(999.99);
        product.setUnitStockQuantity(null); // Null quantity
        product.setStatus("ACTIVE");

        Set<ConstraintViolation<Product>> violations = validator.validate(product);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Unit stock quantity is required")));
    }

    @Test
    void testInvalidStatus() {
        Product product = new Product();
        product.setProductName("Laptop Computer");
        product.setModel("XPS 13");
        product.setPricePerQuantity(999.99);
        product.setUnitStockQuantity(50);
        product.setStatus("INVALID_STATUS"); // Invalid status

        Set<ConstraintViolation<Product>> violations = validator.validate(product);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Status must be ACTIVE, INACTIVE, or DISCONTINUED")));
    }

    @Test
    void testInvalidModelTooShort() {
        Product product = new Product();
        product.setProductName("Laptop Computer");
        product.setModel("A"); // Too short
        product.setPricePerQuantity(999.99);
        product.setUnitStockQuantity(50);
        product.setStatus("ACTIVE");

        Set<ConstraintViolation<Product>> violations = validator.validate(product);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Model must be between 2 and 50 characters")));
    }

    @Test
    void testInvalidModelNull() {
        Product product = new Product();
        product.setProductName("Laptop Computer");
        product.setModel(null); // Null model
        product.setPricePerQuantity(999.99);
        product.setUnitStockQuantity(50);
        product.setStatus("ACTIVE");

        Set<ConstraintViolation<Product>> violations = validator.validate(product);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Model is required")));
    }

    @Test
    void testTotalPriceCalculation() {
        Product product = new Product();
        product.setProductName("Laptop Computer");
        product.setModel("XPS 13");
        product.setPricePerQuantity(1000.0);
        product.setUnitStockQuantity(10);
        product.setStatus("ACTIVE");
        product.calculateTotalPrice();

        assertEquals(10000.0, product.getTotalPrice(), 0.001,
                "Total price should be price * quantity");
    }
}