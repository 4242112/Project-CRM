package com.example.ClientNest.dto;

import com.example.ClientNest.model.Product;

import lombok.Data;

@Data
public class ProductDTO {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private String category;
    private String status;

    public ProductDTO() {
    }

    public ProductDTO(Long id, String name, String description, Double price, String category, String status) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.status = status;
    }

    public ProductDTO(Product product) {
        this.id = product.getId();
        this.name = product.getName();
        this.description = product.getDescription();
        this.price = product.getPrice();
        this.category = product.getCategory();
        this.status = product.getStatus();
    }
}