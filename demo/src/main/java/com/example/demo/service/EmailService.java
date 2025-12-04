package com.example.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import com.example.demo.model.Product;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${stock.alert.threshold:10}")
    private int stockThreshold;

    @Value("${admin.email:admin@company.com}")
    private String adminEmail;

    @Value("${app.name:Inventory Management System}")
    private String appName;

    @Value("${app.url:http://localhost:3000}")
    private String appUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // Low Stock Alert - REMOVED THRESHOLD CHECK HERE
    public void sendLowStockAlert(Product product) {
        if (product == null || product.getUnitStockQuantity() == null) {
            System.err.println("❌ Product or stock quantity is null - email not sent");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(adminEmail);
            helper.setSubject("🚨 Low Stock Alert: " + product.getProductName());

            String emailContent = buildLowStockEmailContent(product);
            helper.setText(emailContent, true);

            mailSender.send(message);
            System.out.println("✅ Low stock alert sent for: " + product.getProductName() +
                    " | Stock: " + product.getUnitStockQuantity());

        } catch (MessagingException e) {
            System.err.println("❌ Failed to send low stock email: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("❌ Unexpected mail error: " + e.getMessage());
        }
    }

    // Order Confirmation
    public void sendOrderConfirmation(String customerEmail, String customerName,
                                      Map<String, Object> orderDetails) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(customerEmail);
            helper.setSubject("✅ Order Confirmed - Thank You for Your Purchase!");

            String emailContent = buildOrderConfirmationEmailContent(customerName, orderDetails);
            helper.setText(emailContent, true);

            mailSender.send(message);
            System.out.println("📩 Order confirmation sent to: " + customerEmail);

        } catch (MessagingException e) {
            System.err.println("❌ Failed to send order confirmation email: " + e.getMessage());
            // Fallback to simple email
            sendSimpleOrderConfirmation(customerEmail, customerName, orderDetails);
        } catch (Exception e) {
            System.err.println("❌ Unexpected mail error: " + e.getMessage());
        }
    }

    // Order Shipped Notification
    public void sendOrderShippedNotification(String customerEmail, String customerName,
                                             Map<String, Object> orderDetails) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(customerEmail);
            helper.setSubject("🚚 Your Order Has Been Shipped!");

            String emailContent = buildOrderShippedEmailContent(customerName, orderDetails);
            helper.setText(emailContent, true);

            mailSender.send(message);
            System.out.println("📩 Shipping notification sent to: " + customerEmail);

        } catch (MessagingException e) {
            System.err.println("❌ Failed to send shipping notification: " + e.getMessage());
        }
    }

    // New Product Added Notification
    public void sendNewProductNotification(Product product) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(adminEmail);
            helper.setSubject("🆕 New Product Added: " + product.getProductName());

            String emailContent = buildNewProductEmailContent(product);
            helper.setText(emailContent, true);

            mailSender.send(message);
            System.out.println("📩 New product notification sent for: " + product.getProductName());

        } catch (MessagingException e) {
            System.err.println("❌ Failed to send new product notification: " + e.getMessage());
        }
    }

    // Stock Replenishment Confirmation
    public void sendStockReplenishedNotification(Product product, int addedQuantity) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(adminEmail);
            helper.setSubject("📦 Stock Replenished: " + product.getProductName());

            String emailContent = buildStockReplenishedEmailContent(product, addedQuantity);
            helper.setText(emailContent, true);

            mailSender.send(message);
            System.out.println("📩 Stock replenishment notification sent for: " + product.getProductName());

        } catch (MessagingException e) {
            System.err.println("❌ Failed to send stock update notification: " + e.getMessage());
        }
    }

    private String buildLowStockEmailContent(Product product) {
        String currentTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm"));

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                        margin: 0;
                        padding: 20px;
                        min-height: 100vh;
                    }
                    .email-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: white;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #ff6b6b 0%%, #ee5a24 100%%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        position: relative;
                    }
                    .header::before {
                        content: '⚠';
                        font-size: 48px;
                        position: absolute;
                        top: 20px;
                        right: 30px;
                        opacity: 0.3;
                    }
                    .header h2 {
                        font-size: 28px;
                        font-weight: 700;
                        margin-bottom: 8px;
                    }
                    .header p {
                        opacity: 0.9;
                        font-size: 16px;
                    }
                    .content {
                        padding: 35px;
                    }
                    .alert-badge {
                        background: #fff2f2;
                        color: #d63031;
                        padding: 12px 20px;
                        border-radius: 10px;
                        border: 2px solid #ff7675;
                        text-align: center;
                        margin-bottom: 25px;
                        font-weight: 600;
                        font-size: 16px;
                    }
                    .product-card {
                        background: #f8f9fa;
                        border-radius: 12px;
                        padding: 25px;
                        margin: 20px 0;
                        border-left: 6px solid #ff6b6b;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    }
                    .product-info {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                        margin-top: 15px;
                    }
                    .info-item {
                        display: flex;
                        justify-content: between;
                    }
                    .info-label {
                        font-weight: 600;
                        color: #555;
                        min-width: 140px;
                    }
                    .info-value {
                        color: #333;
                        font-weight: 500;
                    }
                    .stock-critical {
                        color: #e84118;
                        font-weight: 700;
                        font-size: 18px;
                    }
                    .action-section {
                        background: linear-gradient(135deg, #74b9ff 0%%, #0984e3 100%%);
                        color: white;
                        padding: 25px;
                        border-radius: 12px;
                        margin: 25px 0;
                    }
                    .action-title {
                        font-size: 20px;
                        font-weight: 600;
                        margin-bottom: 15px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    .action-steps {
                        list-style: none;
                        padding: 0;
                    }
                    .action-steps li {
                        padding: 10px 0;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    .action-steps li::before {
                        content: '👉';
                        font-size: 16px;
                    }
                    .dashboard-button {
                        display: inline-block;
                        background: white;
                        color: #0984e3;
                        padding: 14px 28px;
                        border-radius: 8px;
                        text-decoration: none;
                        font-weight: 600;
                        margin-top: 15px;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    }
                    .dashboard-button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                    }
                    .footer {
                        background: #2d3436;
                        color: #dfe6e9;
                        padding: 25px;
                        text-align: center;
                        border-radius: 0 0 16px 16px;
                    }
                    .footer p {
                        margin: 5px 0;
                        font-size: 14px;
                    }
                    .timestamp {
                        background: #f1f2f6;
                        padding: 12px;
                        border-radius: 8px;
                        text-align: center;
                        margin-top: 20px;
                        font-size: 14px;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <h2>Low Stock Alert</h2>
                        <p>Immediate attention required</p>
                    </div>
                    
                    <div class="content">
                        <div class="alert-badge">
                            🚨 CRITICAL STOCK LEVEL DETECTED
                        </div>
                        
                        <p style="margin-bottom: 20px; font-size: 16px; color: #555;">
                            Dear Administrator,<br>
                            The following product has reached a critical stock level and requires immediate action.
                        </p>

                        <div class="product-card">
                            <h3 style="color: #2d3436; margin-bottom: 15px; font-size: 20px;">📦 %s</h3>
                            <div class="product-info">
                                <div class="info-item">
                                    <span class="info-label">Model:</span>
                                    <span class="info-value">%s</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Current Stock:</span>
                                    <span class="stock-critical">%d units</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Alert Threshold:</span>
                                    <span class="info-value">%d units</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Price per Unit:</span>
                                    <span class="info-value">₹%.2f</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Total Value:</span>
                                    <span class="info-value">₹%.2f</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Status:</span>
                                    <span class="info-value">%s</span>
                                </div>
                            </div>
                        </div>

                        <div class="action-section">
                            <div class="action-title">📋 Recommended Actions</div>
                            <ul class="action-steps">
                                <li>Review current inventory levels</li>
                                <li>Contact supplier for immediate restocking</li>
                                <li>Update expected delivery dates</li>
                                <li>Consider temporary product status change if needed</li>
                            </ul>
                            <a href="%s/dashboard/inventory" class="dashboard-button">
                                📊 Go to Inventory Dashboard
                            </a>
                        </div>

                        <div class="timestamp">
                            ⏰ Alert generated on: %s
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p><strong>%s</strong></p>
                        <p>Automated Inventory Management System</p>
                        <p>This is an automated alert. Please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                product.getProductName(),
                product.getModel() != null ? product.getModel() : "N/A",
                product.getUnitStockQuantity(),
                stockThreshold,
                product.getPricePerQuantity() != null ? product.getPricePerQuantity() : 0.0,
                product.getTotalPrice() != null ? product.getTotalPrice() : 0.0,
                product.getStatus() != null ? product.getStatus() : "N/A",
                appUrl,
                currentTime,
                appName
        );
    }

    private String buildOrderConfirmationEmailContent(String customerName, Map<String, Object> orderDetails) {
        String orderId = (String) orderDetails.getOrDefault("orderId", "N/A");
        String orderDate = (String) orderDetails.getOrDefault("orderDate",
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")));
        Double totalAmount = (Double) orderDetails.getOrDefault("totalAmount", 0.0);
        Integer totalItems = (Integer) orderDetails.getOrDefault("totalItems", 0);
        Map<String, Object> items = (Map<String, Object>) orderDetails.getOrDefault("items", Map.of());

        StringBuilder itemsHtml = new StringBuilder();
        for (Map.Entry<String, Object> entry : items.entrySet()) {
            Map<String, Object> item = (Map<String, Object>) entry.getValue();
            itemsHtml.append("""
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #007bff;">
                    <div style="font-weight: 600; color: #2d3436;">📦 %s</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px; font-size: 14px;">
                        <div>Quantity: <strong>%d</strong></div>
                        <div>Unit Price: <strong>₹%.2f</strong></div>
                        <div>Total: <strong style="color: #00b894;">$%.2f</strong></div>
                    </div>
                </div>
                """.formatted(
                    entry.getKey(),
                    item.get("quantity"),
                    item.get("unitPrice"),
                    item.get("total")
            ));
        }

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                        margin: 0;
                        padding: 20px;
                        min-height: 100vh;
                    }
                    .email-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: white;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #00b894 0%%, #00a085 100%%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    .content {
                        padding: 35px;
                    }
                    .order-summary {
                        background: #f8f9fa;
                        border-radius: 12px;
                        padding: 25px;
                        margin: 20px 0;
                    }
                    .total-section {
                        background: linear-gradient(135deg, #74b9ff 0%%, #0984e3 100%%);
                        color: white;
                        padding: 20px;
                        border-radius: 10px;
                        text-align: center;
                        margin: 20px 0;
                    }
                    .footer {
                        background: #2d3436;
                        color: #dfe6e9;
                        padding: 25px;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <h2>✅ Order Confirmed!</h2>
                        <p>Thank you for your purchase, %s!</p>
                    </div>
                    
                    <div class="content">
                        <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
                            Your order has been successfully processed. We're preparing your items for shipment.
                        </p>

                        <div class="order-summary">
                            <h3 style="color: #2d3436; margin-bottom: 15px;">📋 Order Summary</h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                                <div><strong>Order ID:</strong> %s</div>
                                <div><strong>Order Date:</strong> %s</div>
                                <div><strong>Total Items:</strong> %d</div>
                                <div><strong>Status:</strong> <span style="color: #00b894;">Confirmed</span></div>
                            </div>
                            
                            <h4 style="color: #2d3436; margin: 20px 0 10px 0;">🛍 Order Items</h4>
                            %s
                        </div>

                        <div class="total-section">
                            <h3 style="margin: 0 0 10px 0;">Total Amount</h3>
                            <div style="font-size: 28px; font-weight: 700;">₹%.2f</div>
                        </div>

                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                            <strong>📦 Shipping Information:</strong><br>
                            You will receive another email when your order ships. Expected delivery: 3-5 business days.
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p><strong>%s</strong></p>
                        <p>Thank you for choosing us! We appreciate your business.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                customerName,
                orderId,
                orderDate,
                totalItems,
                itemsHtml.toString(),
                totalAmount,
                appName
        );
    }

    private String buildOrderShippedEmailContent(String customerName, Map<String, Object> orderDetails) {
        // Similar structure to order confirmation but for shipped status
        return buildOrderConfirmationEmailContent(customerName, orderDetails)
                .replace("✅ Order Confirmed!", "🚚 Order Shipped!")
                .replace("Confirmed", "Shipped")
                .replace("We're preparing your items", "Your order is on the way");
    }

    private String buildNewProductEmailContent(Product product) {
        String currentTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm"));

        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .header { background: #00b894; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; }
                    .product-card { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>🆕 New Product Added</h2>
                </div>
                <div class="content">
                    <p>A new product has been added to the inventory:</p>
                    <div class="product-card">
                        <h3>%s</h3>
                        <p><strong>Model:</strong> %s</p>
                        <p><strong>Initial Stock:</strong> %d units</p>
                        <p><strong>Price:</strong> ₹%.2f</p>
                        <p><strong>Status:</strong> %s</p>
                    </div>
                    <p><strong>Time:</strong> %s</p>
                </div>
            </body>
            </html>
            """.formatted(
                product.getProductName(),
                product.getModel() != null ? product.getModel() : "N/A",
                product.getUnitStockQuantity(),
                product.getPricePerQuantity() != null ? product.getPricePerQuantity() : 0.0,
                product.getStatus() != null ? product.getStatus() : "N/A",
                currentTime
        );
    }

    private String buildStockReplenishedEmailContent(Product product, int addedQuantity) {
        String currentTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm"));

        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .header { background: #74b9ff; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; }
                    .product-card { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>📦 Stock Replenished</h2>
                </div>
                <div class="content">
                    <p>Stock has been successfully replenished:</p>
                    <div class="product-card">
                        <h3>%s</h3>
                        <p><strong>Quantity Added:</strong> %d units</p>
                        <p><strong>Current Stock:</strong> %d units</p>
                        <p><strong>Previous Stock:</strong> %d units</p>
                        <p><strong>Status:</strong> %s</p>
                    </div>
                    <p><strong>Time:</strong> %s</p>
                </div>
            </body>
            </html>
            """.formatted(
                product.getProductName(),
                addedQuantity,
                product.getUnitStockQuantity(),
                product.getUnitStockQuantity() - addedQuantity,
                product.getStatus() != null ? product.getStatus() : "N/A",
                currentTime
        );
    }

    // Fallback simple email method
    private void sendSimpleOrderConfirmation(String customerEmail, String customerName,
                                             Map<String, Object> orderDetails) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setTo(customerEmail);
            helper.setSubject("Order Confirmation - Thank You!");

            String textContent = buildSimpleOrderText(customerName, orderDetails);
            helper.setText(textContent, false);

            mailSender.send(message);
            System.out.println("📩 Simple order confirmation sent to: " + customerEmail);

        } catch (MessagingException e) {
            System.err.println("❌ Failed to send simple order confirmation: " + e.getMessage());
        }
    }

    private String buildSimpleOrderText(String customerName, Map<String, Object> orderDetails) {
        Double totalAmount = (Double) orderDetails.getOrDefault("totalAmount", 0.0);
        Integer totalItems = (Integer) orderDetails.getOrDefault("totalItems", 0);

        return """
            Dear %s,
            
            Thank you for your order!
            
            Order Summary:
            - Total Items: %d
            - Total Amount: ₹%.2f
            - Order Date: %s
            
            Your order has been confirmed and is being processed.
            You will receive another email when your order ships.
            
            Thank you for choosing %s!
            
            Best regards,
            %s Team
            """.formatted(
                customerName,
                totalItems,
                totalAmount,
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")),
                appName,
                appName
        );
    }

    // Utility method to send test email
    public void sendTestEmail(String toEmail) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Test Email - Email Service is Working");
            helper.setText("""
                <html>
                <body>
                    <h2>✅ Email Service Test</h2>
                    <p>This is a test email from %s.</p>
                    <p>If you're receiving this, the email service is configured correctly!</p>
                    <p><strong>Timestamp:</strong> %s</p>
                </body>
                </html>
                """.formatted(appName, LocalDateTime.now()), true);

            mailSender.send(message);
            System.out.println("✅ Test email sent successfully to: " + toEmail);

        } catch (MessagingException e) {
            System.err.println("❌ Failed to send test email: " + e.getMessage());
        }
    }
}