package com.example.ClientNest.dto;

import com.example.ClientNest.model.QItem;

import lombok.Data;

@Data
public class QItemDTO {
    
    private Long id;
    private Integer quantity = 1;
    private Double discount = 0.0;
    private ProductDTO product;

    public QItemDTO() {}

    public QItemDTO(Long id) {
        this.id = id;
    }

    public QItemDTO(Long id, Integer quantity, Double discount, Double total, ProductDTO product) {
        this.id = id;
        this.quantity = quantity;
        this.discount = discount;
        this.product = product;
    }

    public QItemDTO(QItem qItem) {
        this.id = qItem.getId();
        this.quantity = qItem.getQuantity();
        this.discount = qItem.getDiscount();
        this.product = new ProductDTO(qItem.getProduct());
    }
}
