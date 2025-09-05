package com.example.ClientNest.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.example.ClientNest.misc.ActivityStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "leads")
public class Lead {

    public enum Type {
        INDIVIDUAL,
        COMPANY,
    }

    public enum Stage {
        NEW,
        CONTACTED,
        WON,
        LOST,
        CANCELED,
    }

    public enum Source {
        WEBSITE,
        INTERNET,
        REFERRAL,
        BROCHURE,
        ADVERTISEMENT,
        EMAIL,
        PHONE,
        EVENT,
        OTHER,
        UNKNOWN,
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String requirement;

    @Column(nullable = false)
    private Double expectedRevenue = 0.0;

    @Column(nullable = false, columnDefinition = "INT check (probability >= 0 AND probability <= 100)")
    private Integer probability = 0;

    @Enumerated(EnumType.STRING)
    private Source source = Source.UNKNOWN;

    @Enumerated(EnumType.STRING)
    private ActivityStatus status = ActivityStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    private Type type = Type.INDIVIDUAL;

    @Enumerated(EnumType.STRING)
    private Stage stage = Stage.NEW;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
}