package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Product name is required")
    @Size(min = 2, max = 100, message = "Product name must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s\\-\\.,&()+]*$", message = "Product name contains invalid characters")
    @Column(name = "product_name")
    private String productName;

    @NotBlank(message = "Model is required")
    @Size(min = 2, max = 50, message = "Model must be between 2 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s\\-\\.,]+$", message = "Model contains invalid characters")
    private String model;

    @NotNull(message = "Price per quantity is required")
    @DecimalMin(value = "0.01", message = "Price must be at least 0.01")
    @DecimalMax(value = "1000000.00", message = "Price cannot exceed 1,000,000.00")
    @Column(name = "price_per_quantity")
    private Double pricePerQuantity;

    @NotNull(message = "Unit stock quantity is required")
    @Min(value = 0, message = "Unit stock quantity cannot be negative")
    @Max(value = 100000, message = "Unit stock quantity cannot exceed 100,000")
    @Column(name = "unit_stock_quantity")
    private Integer unitStockQuantity;

    @Column(name = "total_price")
    private Double totalPrice;

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(ACTIVE|INACTIVE|DISCONTINUED)$",
            message = "Status must be ACTIVE, INACTIVE, or DISCONTINUED")
    private String status;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    // Default constructor (REQUIRED for JSON parsing)
    public Product() {
    }

    // Parameterized constructor
    public Product(String productName, String model, Double pricePerQuantity, Integer unitStockQuantity, String status) {
        this.productName = productName;
        this.model = model;
        this.pricePerQuantity = pricePerQuantity;
        this.unitStockQuantity = unitStockQuantity;
        this.status = status;
        this.createdDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
        calculateTotalPrice();
    }

    // Business method to calculate total price
    public void calculateTotalPrice() {
        if (this.pricePerQuantity != null && this.unitStockQuantity != null) {
            this.totalPrice = this.pricePerQuantity * this.unitStockQuantity;
        }
    }

    // Getters and Setters (ALL are REQUIRED)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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
        calculateTotalPrice();
    }

    public Integer getUnitStockQuantity() {
        return unitStockQuantity;
    }

    public void setUnitStockQuantity(Integer unitStockQuantity) {
        this.unitStockQuantity = unitStockQuantity;
        calculateTotalPrice();
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getUpdatedDate() {
        return updatedDate;
    }

    public void setUpdatedDate(LocalDateTime updatedDate) {
        this.updatedDate = updatedDate;
    }

    // toString method for debugging
    @Override
    public String toString() {
        return "Product{" +
                "id=" + id +
                ", productName='" + productName + '\'' +
                ", model='" + model + '\'' +
                ", pricePerQuantity=" + pricePerQuantity +
                ", unitStockQuantity=" + unitStockQuantity +
                ", totalPrice=" + totalPrice +
                ", status='" + status + '\'' +
                ", createdDate=" + createdDate +
                ", updatedDate=" + updatedDate +
                '}';
    }
}
