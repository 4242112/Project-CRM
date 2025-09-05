package com.example.ClientNest.model;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a quotation in the system
 */
@Entity
@Data
public class Quotation {
    public enum Stage {
        DRAFT,
        SENT,
        ACCEPTED,
        REJECTED,
        CONVERTED
    }
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column
    private Double total;

    @lombok.ToString.Exclude
    @OneToMany(mappedBy = "quotation", cascade = CascadeType.ALL)
    private List<QItem> items = new ArrayList<>();

    @Column
    private LocalDateTime validUntil;

    @Enumerated(EnumType.STRING)
    private Stage stage = Stage.DRAFT;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        
        // Set default validUntil to 30 days from now if not specified
        if (validUntil == null) {
            validUntil = LocalDateTime.now().plusDays(30);
        }
    }
}