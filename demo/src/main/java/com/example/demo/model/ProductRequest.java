package com.example.demo.model;

import jakarta.validation.constraints.*;

public class ProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(min = 2, max = 100, message = "Product name must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s\\-\\.,&()+]*$", message = "Product name contains invalid characters")
    private String productName;

    @NotBlank(message = "Model is required")
    @Size(min = 2, max = 50, message = "Model must be between 2 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s\\-\\.,]+$", message = "Model contains invalid characters")
    private String model;

    @NotNull(message = "Price per quantity is required")
    @DecimalMin(value = "0.01", message = "Price must be at least 0.01")
    @DecimalMax(value = "1000000.00", message = "Price cannot exceed 1,000,000.00")
    private Double pricePerQuantity;

    @NotNull(message = "Unit stock quantity is required")
    @Min(value = 0, message = "Unit stock quantity cannot be negative")
    @Max(value = 100000, message = "Unit stock quantity cannot exceed 100,000")
    private Integer unitStockQuantity;

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(ACTIVE|INACTIVE|DISCONTINUED)$",
            message = "Status must be ACTIVE, INACTIVE, or DISCONTINUED")
    private String status;

    // Default constructor
    public ProductRequest() {}

    // Parameterized constructor
    public ProductRequest(String productName, String model, Double pricePerQuantity,
                          Integer unitStockQuantity, String status) {
        this.productName = productName;
        this.model = model;
        this.pricePerQuantity = pricePerQuantity;
        this.unitStockQuantity = unitStockQuantity;
        this.status = status;
    }

    // Getters and Setters
    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Double getPricePerQuantity() {
        return pricePerQuantity;
    }

    public void setPricePerQuantity(Double pricePerQuantity) {
        this.pricePerQuantity = pricePerQuantity;
    }

    public Integer getUnitStockQuantity() {
        return unitStockQuantity;
    }

    public void setUnitStockQuantity(Integer unitStockQuantity) {
        this.unitStockQuantity = unitStockQuantity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "ProductRequest{" +
                "productName='" + productName + '\'' +
                ", model='" + model + '\'' +
                ", pricePerQuantity=" + pricePerQuantity +
                ", unitStockQuantity=" + unitStockQuantity +
                ", status='" + status + '\'' +
                '}';
    }
}