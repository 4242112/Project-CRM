package com.example.ClientNest.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.example.ClientNest.model.Quotation;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class QuotationDTO {
    
    private Long id;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime validUntil;
    private Double amount;
    private List<QItemDTO> items;
    private Quotation.Stage stage;

    public QuotationDTO() {}
    
    public QuotationDTO(Long id) {
        this.id = id;
    }

    public QuotationDTO(Quotation quotation) {
        this.id = quotation.getId();
        this.title = quotation.getTitle();
        this.description = quotation.getDescription();
        this.createdAt = quotation.getCreatedAt();
        this.validUntil = quotation.getValidUntil();
        this.amount = quotation.getTotal();
        this.stage = quotation.getStage();
        this.items = quotation
          .getItems()
          .stream()
          .map(QItemDTO::new)
          .toList();
             
    }
}
