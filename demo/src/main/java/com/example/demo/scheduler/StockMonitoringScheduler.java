package com.example.demo.scheduler;

import com.example.demo.service.ProductService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class StockMonitoringScheduler {

    private final ProductService productService;

    public StockMonitoringScheduler(ProductService productService) {
        this.productService = productService;
    }

    // Run every day at 9 AM
    @Scheduled(cron = "0 0 9 * * ?")
    public void checkLowStockDaily() {
        productService.checkAllProductsForLowStock();
    }
}