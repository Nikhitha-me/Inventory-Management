package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling  // Enables automatic scheduling (used later for daily stock checks if needed)
public class TablesApplication {

    public static void main(String[] args) {
        SpringApplication.run(TablesApplication.class, args);
        System.out.println("🚀 Inventory Management System started successfully!");
    }
}