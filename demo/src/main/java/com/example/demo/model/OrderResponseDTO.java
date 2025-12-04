package com.example.demo.model;

public class OrderResponseDTO {
    private boolean success;
    private String message;
    private String productName;
    private String model;
    private Integer orderedQuantity;
    private Integer remainingStock;
    private Double totalPrice;

    // Constructors
    public OrderResponseDTO() {
    }

    public OrderResponseDTO(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public OrderResponseDTO(boolean success, String message, String productName, String model,
                            Integer orderedQuantity, Integer remainingStock, Double totalPrice) {
        this.success = success;
        this.message = message;
        this.productName = productName;
        this.model = model;
        this.orderedQuantity = orderedQuantity;
        this.remainingStock = remainingStock;
        this.totalPrice = totalPrice;
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
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

    public Integer getOrderedQuantity() {
        return orderedQuantity;
    }

    public void setOrderedQuantity(Integer orderedQuantity) {
        this.orderedQuantity = orderedQuantity;
    }

    public Integer getRemainingStock() {
        return remainingStock;
    }

    public void setRemainingStock(Integer remainingStock) {
        this.remainingStock = remainingStock;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }
}