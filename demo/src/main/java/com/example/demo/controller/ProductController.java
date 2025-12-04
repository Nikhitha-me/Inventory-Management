package com.example.demo.controller;

import com.example.demo.model.Product;
import com.example.demo.model.ProductRequest;
import com.example.demo.service.GoogleSheetsService;
import com.example.demo.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final GoogleSheetsService googleSheetsService;

    public ProductController(ProductService productService, GoogleSheetsService googleSheetsService) {
        this.productService = productService;
        this.googleSheetsService = googleSheetsService;
        System.out.println("ProductController initialized with GoogleSheetsService: " + (googleSheetsService != null));
    }

    // PUBLIC ENDPOINTS - No authentication required
    @GetMapping("/public/all")
    @PreAuthorize("permitAll()")
    public List<Product> getAllPublicProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/public/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Product> getPublicProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        if (product != null) {
            return ResponseEntity.ok(product);
        }
        return ResponseEntity.notFound().build();
    }

    // USER ENDPOINTS - Requires USER, STAFF, or ADMIN role
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        if (product != null) {
            return ResponseEntity.ok(product);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/user/my-products")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    public ResponseEntity<String> getUserProducts() {
        return ResponseEntity.ok("User products accessed successfully");
    }

    // ORDER PROCESSING ENDPOINT - Requires USER, STAFF, or ADMIN role
    @PutMapping("/order")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    public ResponseEntity<?> processOrder(@Valid @RequestBody OrderRequest orderRequest,
                                          BindingResult bindingResult) {
        try {
            if (bindingResult.hasErrors()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Validation failed");
                errorResponse.put("message", "Please check the input data");
                errorResponse.put("details", bindingResult.getFieldErrors()
                        .stream()
                        .map(error -> error.getField() + ": " + error.getDefaultMessage())
                        .collect(Collectors.toList()));
                return ResponseEntity.badRequest().body(errorResponse);
            }

            System.out.println("Processing order: " + orderRequest.toString());

            Product updatedProduct = productService.processOrder(
                    orderRequest.getProductName(),
                    orderRequest.getModel(),
                    orderRequest.getQuantity()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order processed successfully");
            response.put("product", updatedProduct);
            response.put("orderedQuantity", orderRequest.getQuantity());
            response.put("remainingStock", updatedProduct.getUnitStockQuantity());
            response.put("totalOrderValue", updatedProduct.getPricePerQuantity() * orderRequest.getQuantity());
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Order processing failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // STAFF ENDPOINTS - Requires STAFF or ADMIN role
    @PostMapping("/staff/create")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductRequest productRequest,
                                           BindingResult bindingResult) {
        try {
            if (bindingResult.hasErrors()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Validation failed");
                errorResponse.put("message", "Please check the input data");
                errorResponse.put("details", bindingResult.getFieldErrors()
                        .stream()
                        .map(error -> error.getField() + ": " + error.getDefaultMessage())
                        .collect(Collectors.toList()));
                return ResponseEntity.badRequest().body(errorResponse);
            }

            System.out.println("Received valid product: " + productRequest.toString());

            Product product = convertToEntity(productRequest);
            Product savedProduct = productService.createProduct(product);
            return ResponseEntity.ok(savedProduct);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create product");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/staff/update/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<?> updateProduct(@PathVariable Long id,
                                           @Valid @RequestBody ProductRequest productRequest,
                                           BindingResult bindingResult) {
        try {
            if (bindingResult.hasErrors()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Validation failed");
                errorResponse.put("message", "Please check the input data");
                errorResponse.put("details", bindingResult.getFieldErrors()
                        .stream()
                        .map(error -> error.getField() + ": " + error.getDefaultMessage())
                        .collect(Collectors.toList()));
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Product product = convertToEntity(productRequest);
            Product updatedProduct = productService.updateProduct(id, product);
            if (updatedProduct != null) {
                return ResponseEntity.ok(updatedProduct);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update product");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/staff/inventory")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<String> getInventory() {
        return ResponseEntity.ok("Staff inventory accessed successfully");
    }

    @GetMapping("/staff/low-stock")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<List<Product>> getLowStockProducts() {
        List<Product> lowStockProducts = productService.getLowStockProducts();
        return ResponseEntity.ok(lowStockProducts);
    }

    // ADMIN ENDPOINTS - Requires ADMIN role only
    @DeleteMapping("/admin/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        boolean deleted = productService.deleteProduct(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/admin/bulk-upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> bulkUpload() {
        return ResponseEntity.ok("Bulk upload completed by admin");
    }

    // Manual stock check - Staff only
    @PostMapping("/staff/check-stock")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> manualStockCheck() {
        try {
            productService.checkAllProductsForLowStock();
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Stock check completed successfully");
            response.put("timestamp", LocalDateTime.now());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to perform stock check");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // NEW ENDPOINTS FOR LOW STOCK MANAGEMENT

    // Monitor current low stock status
    @GetMapping("/staff/stock-status")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getStockStatus() {
        try {
            List<Product> lowStockProducts = productService.getLowStockProducts();
            List<Long> alertedProducts = new java.util.ArrayList<>(productService.getAlertedProducts());

            Map<String, Object> response = new HashMap<>();
            response.put("lowStockCount", lowStockProducts.size());
            response.put("alertedProductsCount", alertedProducts.size());
            response.put("lowStockProducts", lowStockProducts);
            response.put("alertedProductIds", alertedProducts);
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get stock status");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Force check all products now
    @PostMapping("/staff/force-stock-check")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> forceStockCheck() {
        try {
            productService.checkAllProductsForLowStock();
            List<Product> lowStockProducts = productService.getLowStockProducts();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Manual stock check completed");
            response.put("lowStockProductsFound", lowStockProducts.size());
            response.put("lowStockProducts", lowStockProducts);
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Stock check failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Replenish stock endpoint
    @PutMapping("/staff/replenish-stock/{productId}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<?> replenishStock(@PathVariable Long productId,
                                            @RequestParam int quantity) {
        try {
            if (quantity <= 0) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid quantity");
                errorResponse.put("message", "Quantity must be greater than 0");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Product updatedProduct = productService.replenishStock(productId, quantity);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Stock replenished successfully");
            response.put("product", updatedProduct);
            response.put("quantityAdded", quantity);
            response.put("newStock", updatedProduct.getUnitStockQuantity());
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Stock replenishment failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Clear alert history (for testing)
    @PostMapping("/admin/clear-alerts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> clearAlertHistory() {
        try {
            productService.clearAlertHistory();
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Alert history cleared");
            response.put("timestamp", LocalDateTime.now());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to clear alerts");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    private String escapeCsvField(String field) {
        if (field == null) return "";
        if (field.contains(",") || field.contains("\"") || field.contains("\n")) {
            return "\"" + field.replace("\"", "\"\"") + "\"";
        }
        return field;
    }

    @PostMapping("/admin/clear-sheets-tokens")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> clearSheetsTokens() {
        try {
            googleSheetsService.clearStoredTokens();
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Google Sheets tokens cleared successfully");
            response.put("timestamp", LocalDateTime.now());
            response.put("nextSteps", "Please restart the application to re-authenticate");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to clear tokens");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Helper method to convert ProductRequest to Product entity
    private Product convertToEntity(ProductRequest productRequest) {
        Product product = new Product();
        product.setProductName(productRequest.getProductName());
        product.setModel(productRequest.getModel());
        product.setPricePerQuantity(productRequest.getPricePerQuantity());
        product.setUnitStockQuantity(productRequest.getUnitStockQuantity());
        product.setStatus(productRequest.getStatus());
        return product;
    }

    // Test endpoints - public
    @PostMapping("/public/test")
    @PreAuthorize("permitAll()")
    public String testEndpoint(@RequestBody String testData) {
        return "Test successful! Received: " + testData;
    }

    @PostMapping("/public/debug")
    @PreAuthorize("permitAll()")
    public String debugEndpoint(@RequestBody Object rawData) {
        System.out.println("Raw data received: " + rawData.toString());
        return "Debug data: " + rawData.toString();
    }

    @GetMapping("/staff/export-csv")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<byte[]> exportProductsAsCsv() {
        try {
            List<Product> products = productService.getAllProducts();

            StringBuilder csv = new StringBuilder();
            csv.append("Product Name,Model,Stock Quantity,Price Per Unit,Total Value,Status,Last Updated\n");

            for (Product product : products) {
                csv.append(escapeCsvField(product.getProductName())).append(",");
                csv.append(escapeCsvField(product.getModel() != null ? product.getModel() : "N/A")).append(",");
                csv.append(product.getUnitStockQuantity() != null ? product.getUnitStockQuantity() : 0).append(",");
                csv.append(String.format("%.2f", product.getPricePerQuantity() != null ? product.getPricePerQuantity() : 0.0)).append(",");
                csv.append(String.format("%.2f", product.getTotalPrice() != null ? product.getTotalPrice() : 0.0)).append(",");
                csv.append(escapeCsvField(product.getStatus())).append(",");
                csv.append(escapeCsvField(java.time.LocalDateTime.now().toString())).append("\n");
            }

            byte[] csvBytes = csv.toString().getBytes(StandardCharsets.UTF_8);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDisposition(ContentDisposition.attachment()
                    .filename("inventory_" + java.time.LocalDate.now() + ".csv")
                    .build());
            headers.setContentLength(csvBytes.length);

            return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            // Log the error but don't expose internal details
            System.err.println("CSV export error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Error generating CSV").getBytes());
        }
    }

    // ORDER REQUEST INNER CLASS
    public static class OrderRequest {
        private String productName;
        private String model;
        private Integer quantity;

        public OrderRequest() {}

        public OrderRequest(String productName, String model, Integer quantity) {
            this.productName = productName;
            this.model = model;
            this.quantity = quantity;
        }

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }

        public String getModel() { return model; }
        public void setModel(String model) { this.model = model; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        @Override
        public String toString() {
            return "OrderRequest{" +
                    "productName='" + productName + '\'' +
                    ", model='" + model + '\'' +
                    ", quantity=" + quantity +
                    '}';
        }
    }
}