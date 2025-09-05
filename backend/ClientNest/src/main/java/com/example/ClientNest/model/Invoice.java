package com.example.ClientNest.model;

import java.time.LocalDate;
import java.time.LocalDateTime;


import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import jakarta.persistence.OneToOne;
import lombok.Data;

@Entity
@Data
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String invoiceNumber;
    
    private String status = "PENDING";

    @Column(nullable = true)
    private String title;

    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private String terms;
    
    // Financial details
    private Double subtotal;
    private Double discount;
    private Double taxRate;
    private Double taxAmount;
    private Double total;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Relationships
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "opportunity_id", nullable = true)
    private Opportunity opportunity;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "quotation_id", nullable = true)
    private Quotation quotation;
}