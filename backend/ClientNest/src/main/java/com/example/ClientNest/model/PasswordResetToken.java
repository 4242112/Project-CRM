package com.example.ClientNest.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "password_reset_tokens")
@Data
public class PasswordResetToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String token;
    
    @Column(name = "user_email", nullable = false)
    private String userEmail;
    
    @Column(name = "user_type", nullable = false)
    private String userType; // "CUSTOMER" or "EMPLOYEE"
    
    @Column(nullable = false)
    private LocalDateTime expiryDate;
    
    @Column
    private boolean used = false;
    
    // Default constructor
    public PasswordResetToken() {
    }
    
    // Constructor with all fields
    public PasswordResetToken(String token, String userEmail, String userType) {
        this.token = token;
        this.userEmail = userEmail;
        this.userType = userType;
        this.expiryDate = LocalDateTime.now().plusMinutes(30); // Default 30 minutes expiration
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryDate);
    }
}