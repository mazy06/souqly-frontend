package io.mazy.souqly_backend.repository;

import io.mazy.souqly_backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByIsActiveTrue(Pageable pageable);
    Page<Product> findByIsActiveAndTitleContainingIgnoreCase(Boolean isActive, String title, Pageable pageable);
} 