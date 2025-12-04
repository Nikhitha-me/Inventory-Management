package com.example.demo.repository;

import com.example.demo.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {

    // Custom method to find staff by email
    Optional<Staff> findByEmail(String email);

    // Check if email exists
    boolean existsByEmail(String email);

    // Find staff by department
    List<Staff> findByDepartment(String department);

    // Find staff by status
    List<Staff> findByStatus(String status);

    // Search staff by name (case insensitive)
    @Query("SELECT s FROM Staff s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Staff> findByNameContainingIgnoreCase(@Param("name") String name);

    // Find staff by designation
    List<Staff> findByDesignation(String designation);

    // Find active staff
    List<Staff> findByStatusOrderByNameAsc(String status);

    @Query("SELECT s FROM Staff s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(s.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Staff> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(@Param("query") String nameQuery, @Param("query") String emailQuery);
}