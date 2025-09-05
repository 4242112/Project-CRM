package com.example.ClientNest.model;

import com.example.ClientNest.misc.ActivityStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    public enum CustomerType {
        NEW,
        EXISTING,
    }
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Pattern(regexp = "^(\\+?\\d{2})?[0-9]{10}$", message = "Phone number should be valid")
    private String phoneNumber;

    @Email(message = "Email should be valid")
    private String email;
    
    private String address;
    private String city;
    private String state;
    private Integer zipCode;
    private String country;

    private String website;
    
    @Column
    private String passwordHash;
    
    @Column
    private Boolean hasPassword = false;
    
    @Enumerated(EnumType.STRING)
    private CustomerType type = CustomerType.NEW;

    @Enumerated(EnumType.STRING)
    private ActivityStatus status = ActivityStatus.ACTIVE;
}