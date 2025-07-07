package io.mazy.souqly_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @PostMapping("/search-by-image")
    public ResponseEntity<Map<String, Object>> searchByImage(@RequestParam("image") MultipartFile image) {
        if (image.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Aucune image reçue"));
        }

        List<Product> products = productService.findProductsByImage(image);
        List<ProductListDTO> productDTOs = products.stream()
            .map(product -> {
                product.setImages(productImageRepository.findByProductId(product.getId()));
                return new ProductListDTO(product, favoriteService.getFavoriteCount(product.getId()));
            })
            .collect(java.util.stream.Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("products", productDTOs);
        return ResponseEntity.ok(response);
    }
} 