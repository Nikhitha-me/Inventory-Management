package com.example.demo.config;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles validation errors for @Valid annotated objects
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
        errorResponse.put("error", "Validation Failed");
        errorResponse.put("path", request.getDescription(false).replace("uri=", ""));

        // Get all field errors
        Map<String, String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fieldError -> fieldError.getDefaultMessage() != null ?
                                fieldError.getDefaultMessage() : "Validation error",
                        (existing, replacement) -> existing
                ));

        errorResponse.put("fieldErrors", errors);
        errorResponse.put("message", "Please check the input data for validation errors");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles database constraint violations (like unique constraint)
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, WebRequest request) {

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("status", HttpStatus.CONFLICT.value());
        errorResponse.put("error", "Data Integrity Violation");
        errorResponse.put("path", request.getDescription(false).replace("uri=", ""));

        String errorMessage = ex.getMostSpecificCause().getMessage();
        if (errorMessage.contains("Duplicate entry") || errorMessage.contains("unique constraint")) {
            errorResponse.put("message", "Data already exists. Please check for duplicates.");
        } else {
            errorResponse.put("message", "Database constraint violation occurred");
        }

        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    /**
     * Handles generic runtime exceptions
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException ex, WebRequest request) {

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
        errorResponse.put("error", "Bad Request");
        errorResponse.put("path", request.getDescription(false).replace("uri=", ""));
        errorResponse.put("message", ex.getMessage());

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles illegal argument exceptions
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
        errorResponse.put("error", "Invalid Argument");
        errorResponse.put("path", request.getDescription(false).replace("uri=", ""));
        errorResponse.put("message", ex.getMessage());

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles resource not found scenarios
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("status", HttpStatus.NOT_FOUND.value());
        errorResponse.put("error", "Resource Not Found");
        errorResponse.put("path", request.getDescription(false).replace("uri=", ""));
        errorResponse.put("message", ex.getMessage());

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Handles order processing exceptions
     */
    @ExceptionHandler(OrderProcessingException.class)
    public ResponseEntity<Map<String, Object>> handleOrderProcessingException(
            OrderProcessingException ex, WebRequest request) {

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
        errorResponse.put("error", "Order Processing Failed");
        errorResponse.put("path", request.getDescription(false).replace("uri=", ""));
        errorResponse.put("message", ex.getMessage());
        errorResponse.put("productName", ex.getProductName());
        errorResponse.put("model", ex.getModel());

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles all other exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception ex, WebRequest request) {

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        errorResponse.put("error", "Internal Server Error");
        errorResponse.put("path", request.getDescription(false).replace("uri=", ""));
        errorResponse.put("message", "An unexpected error occurred. Please try again later.");

        // Log the actual exception for debugging
        ex.printStackTrace(); // Replace with proper logger in production

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Custom exception for resource not found
     */
    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) {
            super(message);
        }
    }

    /**
     * Custom exception for order processing - NEW
     */
    public static class OrderProcessingException extends RuntimeException {
        private String productName;
        private String model;

        public OrderProcessingException(String message, String productName, String model) {
            super(message);
            this.productName = productName;
            this.model = model;
        }

        public String getProductName() {
            return productName;
        }

        public String getModel() {
            return model;
        }
    }
}