package com.example.demo.controller;

import com.example.demo.model.Product;
import com.example.demo.service.EmailService;
import com.example.demo.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final ProductService productService;
    private final EmailService emailService;

    public OrderController(ProductService productService, EmailService emailService) {
        this.productService = productService;
        this.emailService = emailService;
    }

    @PostMapping("/checkout")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    public ResponseEntity<?> processCheckout(@Valid @RequestBody CheckoutRequest checkoutRequest,
                                             BindingResult bindingResult) {
        try {
            System.out.println("Received checkout request: " + checkoutRequest);

            if (bindingResult.hasErrors()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Validation failed");
                errorResponse.put("message", "Please check the input data");
                errorResponse.put("details", bindingResult.getFieldErrors()
                        .stream()
                        .map(error -> error.getField() + ": " + error.getDefaultMessage())
                        .collect(Collectors.toList()));
                return ResponseEntity.badRequest().body(errorResponse);
            }

            if (checkoutRequest.getItems() == null || checkoutRequest.getItems().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Empty cart");
                errorResponse.put("message", "No items in cart");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            String userName = authentication.getName();

            // Process each order item
            Map<String, Object> orderSummary = new HashMap<>();
            double totalAmount = 0;
            int totalItems = 0;
            boolean allItemsProcessed = true;
            List<String> processingErrors = new java.util.ArrayList<>();

            for (OrderItem item : checkoutRequest.getItems()) {
                try {
                    System.out.println("Processing item: " + item.getProductName() + ", Quantity: " + item.getQuantity());

                    Product updatedProduct = productService.processOrder(
                            item.getProductName(),
                            item.getModel(),
                            item.getQuantity()
                    );

                    if (updatedProduct != null) {
                        double itemTotal = updatedProduct.getPricePerQuantity() * item.getQuantity();
                        totalAmount += itemTotal;
                        totalItems += item.getQuantity();

                        // Add to order summary
                        orderSummary.put(item.getProductName(), Map.of(
                                "quantity", item.getQuantity(),
                                "unitPrice", updatedProduct.getPricePerQuantity(),
                                "total", itemTotal,
                                "remainingStock", updatedProduct.getUnitStockQuantity()
                        ));
                        System.out.println("Successfully processed: " + item.getProductName());
                    } else {
                        allItemsProcessed = false;
                        processingErrors.add("Failed to process: " + item.getProductName());
                        System.out.println("Failed to process: " + item.getProductName());
                    }
                } catch (Exception e) {
                    allItemsProcessed = false;
                    processingErrors.add("Error processing " + item.getProductName() + ": " + e.getMessage());
                    System.out.println("Error processing item: " + e.getMessage());
                }
            }

            if (!allItemsProcessed) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Partial order failure");
                errorResponse.put("message", "Some items could not be processed");
                errorResponse.put("failedItems", processingErrors);
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Send confirmation email
            try {
                emailService.sendOrderConfirmation(userEmail, userName, orderSummary);
                System.out.println("Order confirmation email sent to: " + userEmail);
            } catch (Exception e) {
                System.out.println("Failed to send email: " + e.getMessage());
                // Continue even if email fails
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order processed successfully");
            response.put("orderSummary", orderSummary);
            response.put("totalAmount", totalAmount);
            response.put("totalItems", totalItems);
            response.put("timestamp", LocalDateTime.now());
            response.put("emailSent", true);

            System.out.println("Order completed successfully for user: " + userEmail);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("Order processing error: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Order processing failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Inner classes for request objects
    public static class CheckoutRequest {
        private List<OrderItem> items;

        public List<OrderItem> getItems() { return items; }
        public void setItems(List<OrderItem> items) { this.items = items; }
    }

    public static class OrderItem {
        private String productName;
        private String model;
        private Integer quantity;

        // Getters and setters
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }

        public String getModel() { return model; }
        public void setModel(String model) { this.model = model; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}