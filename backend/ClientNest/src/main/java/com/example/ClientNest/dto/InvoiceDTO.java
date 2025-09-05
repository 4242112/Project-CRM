package com.example.ClientNest.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.example.ClientNest.model.Invoice;
import com.example.ClientNest.model.Quotation;

import lombok.Data;

@Data
public class InvoiceDTO {
    private Long id;
    private String invoiceNumber;
    private String customerName;
    private String employeeName;
    private Double amount;
    private String status;
    private String title;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private String terms;
    private Double subtotal;
    private Double discount;
    private Double taxRate;
    private Double taxAmount;
    private Double total;

    private List<QItemDTO> items;
    private Long opportunityId;
    private Long customerId;
    private Long quotationId;

    public InvoiceDTO() {
        this.items = new ArrayList<>();
    }

    public InvoiceDTO(Long id, String invoiceNumber,String customerName, String employeeName, Double amount, String status, String title,
            LocalDateTime createdAt, LocalDateTime updatedAt, LocalDate dueDate, List<QItemDTO> items,
            Long opportunityId, Long customerId, Long quotationId) {
        this.id = id;
        this.invoiceNumber = invoiceNumber;
        this.customerName = customerName;
        this.employeeName = employeeName;
        this.amount = amount;
        this.status = status;
        this.title = title;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.dueDate = dueDate;
        this.items = items;
        this.opportunityId = opportunityId;
        this.customerId = customerId;
        this.quotationId = quotationId;
    }

    // Constructor used in the repository for queries
    public InvoiceDTO(Quotation quotation, Invoice invoice) {
        this.id = invoice.getId();
        this.invoiceNumber = invoice.getInvoiceNumber();

        this.customerName = invoice.getCustomer() != null ? invoice.getCustomer().getName() : null;

        this.employeeName = invoice.getEmployee() != null ? invoice.getEmployee().getName() : null;

        this.amount = invoice.getTotal();
        this.status = invoice.getStatus();
        this.title = quotation != null ? quotation.getTitle() : "Invoice";
        this.createdAt = invoice.getCreatedAt();
        this.updatedAt = invoice.getUpdatedAt();
        this.dueDate = invoice.getDueDate();
        this.invoiceDate = invoice.getInvoiceDate();
        this.terms = invoice.getTerms();
        this.subtotal = invoice.getSubtotal();
        this.discount = invoice.getDiscount();
        this.taxRate = invoice.getTaxRate();
        this.taxAmount = invoice.getTaxAmount();
        this.total = invoice.getTotal();
        
        
        // Convert invoice items to DTOs
        this.items = invoice.getQuotation().getItems().stream()
                .map(QItemDTO::new)
                .collect(Collectors.toList());
        if (invoice.getCustomer() != null) {
            this.customerId = invoice.getCustomer().getId();
        }
        if (invoice.getQuotation() != null) {
            this.quotationId = invoice.getQuotation().getId();
        }
    }
    
    // Constructor used when there's no quotation reference
    public InvoiceDTO(Invoice invoice) {
        this.id = invoice.getId();
        this.invoiceNumber = invoice.getInvoiceNumber();

        this.customerName = invoice.getCustomer() != null ? invoice.getCustomer().getName() : null;

        this.employeeName = invoice.getEmployee() != null ? invoice.getEmployee().getName() : null;

        this.status = invoice.getStatus();
        this.createdAt = invoice.getCreatedAt();
        this.updatedAt = invoice.getUpdatedAt();
        this.invoiceDate = invoice.getInvoiceDate();
        this.dueDate = invoice.getDueDate();
        this.terms = invoice.getTerms();
        this.subtotal = invoice.getSubtotal();
        this.discount = invoice.getDiscount();
        this.taxRate = invoice.getTaxRate();
        this.taxAmount = invoice.getTaxAmount();
        this.total = invoice.getTotal();
        
        // Convert invoice items to DTOs
        this.items = invoice.getQuotation().getItems().stream()
                .map(QItemDTO::new)
                .collect(Collectors.toList());
        
        if (invoice.getCustomer() != null) {
            this.customerId = invoice.getCustomer().getId();
        }
        if (invoice.getQuotation() != null) {
            this.quotationId = invoice.getQuotation().getId();
        }
    }
}