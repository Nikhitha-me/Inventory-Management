package com.example.demo.service;

import com.example.demo.model.Product;
import com.example.demo.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final EmailService emailService;
    private final GoogleSheetsService googleSheetsService;

    @Value("${stock.alert.threshold:10}")
    private int stockThreshold;

    // Track products that have been alerted to avoid spam
    private final Set<Long> alertedProducts = Collections.synchronizedSet(new HashSet<>());

    public ProductService(ProductRepository productRepository,
                          EmailService emailService,
                          GoogleSheetsService googleSheetsService) {
        this.productRepository = productRepository;
        this.emailService = emailService;
        this.googleSheetsService = googleSheetsService;
        System.out.println("✅ ProductService started. Low stock threshold: " + stockThreshold);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    public Product createProduct(Product product) {
        try {
            product.setCreatedDate(LocalDateTime.now());
            product.setUpdatedDate(LocalDateTime.now());

            if (product.getStatus() == null) product.setStatus("ACTIVE");
            product.calculateTotalPrice();

            if (productRepository.existsByProductName(product.getProductName())) {
                throw new RuntimeException("Product '" + product.getProductName() + "' already exists");
            }

            Product savedProduct = productRepository.save(product);
            System.out.println("💾 Product saved: " + savedProduct.getProductName() +
                    " | Stock: " + savedProduct.getUnitStockQuantity());

            // Check for low stock immediately after saving
            checkAndAlertLowStock(savedProduct);

            // Send new product notification
            emailService.sendNewProductNotification(savedProduct);

            // Export to Google Sheets
            if (googleSheetsService != null) {
                try {
                    googleSheetsService.exportProductToSheet(savedProduct);
                } catch (Exception e) {
                    System.err.println("⚠ Failed to export to Google Sheets: " + e.getMessage());
                }
            }

            return savedProduct;
        } catch (Exception e) {
            throw new RuntimeException("❌ Error saving product: " + e.getMessage());
        }
    }

    public Product updateProduct(Long id, Product productDetails) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (optionalProduct.isEmpty()) return null;

        Product product = optionalProduct.get();
        Integer oldStock = product.getUnitStockQuantity();

        if (productDetails.getProductName() != null &&
                !productDetails.getProductName().equals(product.getProductName()) &&
                productRepository.existsByProductName(productDetails.getProductName())) {
            throw new RuntimeException("Product with name '" + productDetails.getProductName() + "' already exists");
        }

        if (productDetails.getProductName() != null) product.setProductName(productDetails.getProductName());
        if (productDetails.getModel() != null) product.setModel(productDetails.getModel());
        if (productDetails.getPricePerQuantity() != null)
            product.setPricePerQuantity(productDetails.getPricePerQuantity());
        if (productDetails.getUnitStockQuantity() != null)
            product.setUnitStockQuantity(productDetails.getUnitStockQuantity());
        if (productDetails.getStatus() != null) product.setStatus(productDetails.getStatus());

        product.calculateTotalPrice();
        product.setUpdatedDate(LocalDateTime.now());

        Product updatedProduct = productRepository.save(product);

        System.out.println("✏ Product updated: " + updatedProduct.getProductName() +
                " | Stock: " + oldStock + " → " + updatedProduct.getUnitStockQuantity());

        // Check for low stock immediately after updating
        checkAndAlertLowStock(updatedProduct);

        // Export to Google Sheets
        if (googleSheetsService != null) {
            try {
                googleSheetsService.exportProductToSheet(updatedProduct);
            } catch (Exception e) {
                System.err.println("⚠ Google Sheets export failed: " + e.getMessage());
            }
        }

        return updatedProduct;
    }

    public Product processOrder(String productName, String model, Integer quantity) {
        try {
            Product product = productRepository.findByProductNameAndModel(productName, model)
                    .orElseThrow(() -> new RuntimeException("Product not found: " + productName));

            Integer oldStock = product.getUnitStockQuantity();

            if (product.getUnitStockQuantity() < quantity) {
                throw new RuntimeException("Insufficient stock for: " + productName +
                        ". Available: " + product.getUnitStockQuantity() +
                        ", Requested: " + quantity);
            }

            product.setUnitStockQuantity(product.getUnitStockQuantity() - quantity);
            Product updatedProduct = productRepository.save(product);

            System.out.println("🛒 Order processed: " + productName +
                    " | Stock: " + oldStock + " → " + updatedProduct.getUnitStockQuantity());

            // Check for low stock after order processing
            checkAndAlertLowStock(updatedProduct);

            return updatedProduct;

        } catch (Exception e) {
            System.out.println("❌ Error in processOrder: " + e.getMessage());
            throw e;
        }
    }

    // Enhanced low stock checking with alert tracking
    private void checkAndAlertLowStock(Product product) {
        if (product == null) {
            System.err.println("⚠ Product is null, cannot check stock.");
            return;
        }

        Integer stock = product.getUnitStockQuantity();
        if (stock == null) {
            System.err.println("⚠ Stock quantity is null for product: " + product.getProductName());
            return;
        }

        boolean isLowStock = stock <= stockThreshold;
        Long productId = product.getId();

        System.out.println("🔍 Stock check - " + product.getProductName() +
                ": " + stock + " units (Threshold: " + stockThreshold + ")");

        if (isLowStock) {
            // Check if we haven't alerted for this product recently
            if (!alertedProducts.contains(productId)) {
                System.out.println("🚨 LOW STOCK DETECTED! Product: " + product.getProductName() +
                        " | Stock: " + stock);
                emailService.sendLowStockAlert(product);
                alertedProducts.add(productId); // Mark as alerted
            } else {
                System.out.println("ℹ Low stock alert already sent for: " + product.getProductName());
            }
        } else {
            // Stock is back to normal, remove from alerted set
            if (alertedProducts.contains(productId)) {
                System.out.println("✅ Stock recovered for: " + product.getProductName() +
                        " | Removing from alert list");
                alertedProducts.remove(productId);
            }
        }
    }

    // Method to manually replenish stock and send notification
    public Product replenishStock(Long productId, int quantityToAdd) {
        Optional<Product> optionalProduct = productRepository.findById(productId);
        if (optionalProduct.isEmpty()) {
            throw new RuntimeException("Product not found with ID: " + productId);
        }

        Product product = optionalProduct.get();
        Integer oldStock = product.getUnitStockQuantity();

        product.setUnitStockQuantity(oldStock + quantityToAdd);
        product.setUpdatedDate(LocalDateTime.now());

        Product updatedProduct = productRepository.save(product);

        System.out.println("📦 Stock replenished: " + product.getProductName() +
                " | Stock: " + oldStock + " → " + updatedProduct.getUnitStockQuantity());

        // Send stock replenished notification
        emailService.sendStockReplenishedNotification(updatedProduct, quantityToAdd);

        // Check if still low stock after replenishment
        checkAndAlertLowStock(updatedProduct);

        return updatedProduct;
    }

    // Method to check all products in database
    public void checkAllProductsForLowStock() {
        System.out.println("🔍 Checking ALL products for low stock...");
        List<Product> allProducts = productRepository.findAll();
        int lowStockCount = 0;

        for (Product product : allProducts) {
            if (product.getUnitStockQuantity() != null &&
                    product.getUnitStockQuantity() <= stockThreshold) {
                lowStockCount++;
                checkAndAlertLowStock(product);
            }
        }

        if (lowStockCount == 0) {
            System.out.println("✅ No low-stock products found in database.");
        } else {
            System.out.println("🚨 Found " + lowStockCount + " low-stock products in database.");
        }
    }

    // Get low stock products from database
    public List<Product> getLowStockProducts() {
        return productRepository.findByUnitStockQuantityLessThanEqual(stockThreshold);
    }

    // Clear alert history (useful for testing)
    public void clearAlertHistory() {
        alertedProducts.clear();
        System.out.println("🧹 Alert history cleared");
    }

    // Get currently alerted products
    public Set<Long> getAlertedProducts() {
        return new HashSet<>(alertedProducts);
    }

    public boolean deleteProduct(Long id) {
        if (productRepository.existsById(id)) {
            // Remove from alerted products if it was there
            alertedProducts.remove(id);
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // SCHEDULED TASKS - Check database regularly

    // Check every 10 minutes
    @Scheduled(fixedRate = 600000)
    public void scheduledStockCheck() {
        System.out.println("🕒 Running scheduled stock check at " + LocalDateTime.now());
        checkAllProductsForLowStock();
    }

    // Daily comprehensive check at 9 AM
    @Scheduled(cron = "0 0 9 * * ?")
    public void scheduledDailyStockCheck() {
        System.out.println("🕘 Running daily comprehensive stock check at " + LocalDateTime.now());
        checkAllProductsForLowStock();
    }

    // Clear alert history daily at midnight (to reset daily alerts)
    @Scheduled(cron = "0 0 0 * * ?")
    public void clearDailyAlerts() {
        System.out.println("🔄 Clearing daily alert history at " + LocalDateTime.now());
        alertedProducts.clear();
    }
}