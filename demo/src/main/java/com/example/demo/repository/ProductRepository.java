package com.example.demo.repository;

import com.example.demo.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Find product by product name (exact match)
    Optional<Product> findByProductName(String productName);

    // Find products by product name containing (case insensitive)
    List<Product> findByProductNameContainingIgnoreCase(String productName);

    // Find products by model name
    List<Product> findByModel(String model);

    // Find products by model containing (case insensitive)
    List<Product> findByModelContainingIgnoreCase(String model);

    // Find products by status
    List<Product> findByStatus(String status);

    // Find products by status ordered by product name
    List<Product> findByStatusOrderByProductNameAsc(String status);

    // Find active products
    List<Product> findByStatusOrderByCreatedDateDesc(String status);

    // Find products with price less than specified amount
    List<Product> findByPricePerQuantityLessThan(Double price);

    // Find products with price greater than specified amount
    List<Product> findByPricePerQuantityGreaterThan(Double price);

    // Find products with price between range
    List<Product> findByPricePerQuantityBetween(Double minPrice, Double maxPrice);

    // Find products with stock quantity less than specified amount (low stock)
    List<Product> findByUnitStockQuantityLessThan(Integer quantity);

    // Find products with stock quantity greater than specified amount
    List<Product> findByUnitStockQuantityGreaterThan(Integer quantity);

    // Find products that are out of stock
    List<Product> findByUnitStockQuantity(Integer quantity);

    // Find products by category (if you add category field later)
    // List<Product> findByCategory(String category);

    // Check if product exists by product name
    boolean existsByProductName(String productName);

    // Check if product exists by model
    boolean existsByModel(String model);

    // Count products by status
    long countByStatus(String status);

    // Custom query to find products with total price greater than specified amount
    @Query("SELECT p FROM Product p WHERE p.totalPrice > :totalPrice")
    List<Product> findProductsWithTotalPriceGreaterThan(@Param("totalPrice") Double totalPrice);

    // Custom query to find products by name pattern using SQL LIKE
    @Query("SELECT p FROM Product p WHERE LOWER(p.productName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Product> findProductsByNamePattern(@Param("name") String name);

    // Custom query to find products by model pattern
    @Query("SELECT p FROM Product p WHERE LOWER(p.model) LIKE LOWER(CONCAT('%', :model, '%'))")
    List<Product> findProductsByModelPattern(@Param("model") String model);

    // Custom query to find products with low stock (less than specified threshold)
    @Query("SELECT p FROM Product p WHERE p.unitStockQuantity < :threshold")
    List<Product> findProductsWithLowStock(@Param("threshold") Integer threshold);

    // Custom query to find products created after specified date
    @Query("SELECT p FROM Product p WHERE p.createdDate > :date")
    List<Product> findProductsCreatedAfter(@Param("date") java.time.LocalDateTime date);

    // Custom query to find products updated before specified date
    @Query("SELECT p FROM Product p WHERE p.updatedDate < :date")
    List<Product> findProductsUpdatedBefore(@Param("date") java.time.LocalDateTime date);

    // Custom query to get total inventory value
    @Query("SELECT SUM(p.totalPrice) FROM Product p WHERE p.status = 'ACTIVE'")
    Double getTotalInventoryValue();

    // Custom query to get average product price
    @Query("SELECT AVG(p.pricePerQuantity) FROM Product p WHERE p.status = 'ACTIVE'")
    Double getAverageProductPrice();

    // Custom query to get products sorted by total price descending
    @Query("SELECT p FROM Product p ORDER BY p.totalPrice DESC")
    List<Product> findAllOrderByTotalPriceDesc();

    // Custom query to get products sorted by stock quantity ascending
    @Query("SELECT p FROM Product p ORDER BY p.unitStockQuantity ASC")
    List<Product> findAllOrderByStockQuantityAsc();

    // Custom query to find products with specific status and price range
    @Query("SELECT p FROM Product p WHERE p.status = :status AND p.pricePerQuantity BETWEEN :minPrice AND :maxPrice")
    List<Product> findProductsByStatusAndPriceRange(
            @Param("status") String status,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice);

    // Custom query to find products with specific status and minimum stock
    @Query("SELECT p FROM Product p WHERE p.status = :status AND p.unitStockQuantity >= :minStock")
    List<Product> findProductsByStatusAndMinStock(
            @Param("status") String status,
            @Param("minStock") Integer minStock);

    // Custom native query to get product statistics
    @Query(value =
            "SELECT " +
                    "COUNT(*) as total_products, " +
                    "SUM(unit_stock_quantity) as total_stock, " +
                    "AVG(price_per_quantity) as avg_price, " +
                    "SUM(total_price) as total_value " +
                    "FROM products WHERE status = 'ACTIVE'",
            nativeQuery = true)
    Object[] getProductStatistics();

    // Custom native query to find products by name or model
    @Query(value =
            "SELECT * FROM products WHERE " +
                    "LOWER(product_name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                    "LOWER(model) LIKE LOWER(CONCAT('%', :searchTerm, '%'))",
            nativeQuery = true)
    List<Product> searchProductsByNameOrModel(@Param("searchTerm") String searchTerm);

    // Find top N most expensive products
    @Query("SELECT p FROM Product p ORDER BY p.pricePerQuantity DESC LIMIT :limit")
    List<Product> findTopExpensiveProducts(@Param("limit") int limit);

    // Find top N products with highest stock
    @Query("SELECT p FROM Product p ORDER BY p.unitStockQuantity DESC LIMIT :limit")
    List<Product> findTopStockedProducts(@Param("limit") int limit);

    // Find products that need reordering (stock less than reorder level)
    @Query("SELECT p FROM Product p WHERE p.unitStockQuantity < :reorderLevel")
    List<Product> findProductsNeedReorder(@Param("reorderLevel") Integer reorderLevel);

    // Custom query to update product status by ID
    @Query("UPDATE Product p SET p.status = :status, p.updatedDate = CURRENT_TIMESTAMP WHERE p.id = :id")
    void updateProductStatus(@Param("id") Long id, @Param("status") String status);

    // Custom query to update stock quantity
    @Query("UPDATE Product p SET p.unitStockQuantity = :quantity, p.updatedDate = CURRENT_TIMESTAMP WHERE p.id = :id")
    void updateStockQuantity(@Param("id") Long id, @Param("quantity") Integer quantity);

    // Find products by multiple status values
    @Query("SELECT p FROM Product p WHERE p.status IN :statusList")
    List<Product> findProductsByStatusIn(@Param("statusList") List<String> statusList);


    List<Product> findByUnitStockQuantityLessThanEqual(Integer threshold);

    @Query("SELECT p FROM Product p WHERE p.unitStockQuantity <= :threshold AND p.status = 'ACTIVE'")
    List<Product> findActiveLowStockProducts(Integer threshold);

    Optional<Product> findByProductNameAndModel(String productName, String model);

    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.unitStockQuantity = p.unitStockQuantity - :quantity, p.updatedDate = CURRENT_TIMESTAMP WHERE p.productName = :productName AND p.model = :model AND p.unitStockQuantity >= :quantity")
    int updateStockQuantity(@Param("productName") String productName,
                            @Param("model") String model,
                            @Param("quantity") Integer quantity);

    @Query("SELECT p.unitStockQuantity FROM Product p WHERE p.productName = :productName AND p.model = :model")
    Optional<Integer> findStockQuantityByProductNameAndModel(@Param("productName") String productName,
                                                             @Param("model") String model);

    // Existing methods

    // Query for finding products with stock below threshold and specific status
    @Query("SELECT p FROM Product p WHERE p.unitStockQuantity <= :threshold AND p.status = 'ACTIVE'")
    List<Product> findLowStockActiveProducts(@Param("threshold") Integer threshold);
}