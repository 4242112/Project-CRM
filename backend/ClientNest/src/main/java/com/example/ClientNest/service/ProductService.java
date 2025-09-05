package com.example.ClientNest.service;

import com.example.ClientNest.dto.ProductDTO;
import java.util.List;

public interface ProductService {
    List<ProductDTO> getAllProducts();
    ProductDTO getProductById(Long id);
    ProductDTO createProduct(ProductDTO productDTO);
    ProductDTO updateProduct(Long id, ProductDTO productDTO);
    void deleteProduct(Long id);
    ProductDTO searchProductByName(String name);
    List<ProductDTO> getProductsByCategory(String category);
    List<ProductDTO> getProductsByStatus(String status);
}