package com.example.demo.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class OrderRequestDTO {

    @NotBlank(message = "Product name is required")
    private String productName;

    @NotBlank(message = "Model is required")
    private String model;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    // Default constructor
    public OrderRequestDTO() {
    }

    // Parameterized constructor
    public OrderRequestDTO(String productName, String model, Integer quantity) {
        this.productName = productName;
        this.model = model;
        this.quantity = quantity;
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

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}