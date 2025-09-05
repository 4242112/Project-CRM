package com.example.ClientNest.dto;

import java.time.format.DateTimeFormatter;

import com.example.ClientNest.model.Lead;

import lombok.Data;

@Data
public class LeadDTO {
    // customer
    private Long customerId;
    private String name;
    private String email;
    private String phoneNumber;
    private String address;
    private String city;
    private String state;
    private Integer zipCode;
    private String country;
    private String website;
    
    // lead
    private Long id;
    private String requirement;
    private String assignedTo;
    private String source;
    private Integer conversionProbability;
    private Double expectedRevenue;
    private String createdDate; // Formatted date field

    public LeadDTO() {}

    public LeadDTO(Long customerId, String name, String email, String phoneNumber, String address, String city,
            String state, Integer zipCode, String country, String website, Long id, String requirement,
            String assignedTo, Integer conversionProbability, Double expectedRevenue, String source) {
        this.customerId = customerId;
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.country = country;
        this.website = website;
        
        this.id = id;
        this.requirement = requirement;
        this.assignedTo = assignedTo;
        this.conversionProbability = conversionProbability;
        this.expectedRevenue = expectedRevenue;
        this.source = source;
    }

    public LeadDTO(Lead lead) {
        var customer = lead.getCustomer();
        this.customerId = customer.getId();
        this.name = customer.getName();
        this.email = customer.getEmail();
        this.phoneNumber = customer.getPhoneNumber();
        this.address = customer.getAddress();
        this.city = customer.getCity();
        this.state = customer.getState();
        this.zipCode = customer.getZipCode();
        this.country = customer.getCountry();
        this.website = customer.getWebsite();
        
        this.id = lead.getId();
        this.requirement = lead.getRequirement();
        this.assignedTo = lead.getEmployee().getName();
        this.conversionProbability = lead.getProbability();
        this.expectedRevenue = lead.getExpectedRevenue();
        this.source = lead.getSource().name();
        
        // Format the creation date as dd/mm/yy
        if (lead.getCreatedAt() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yy");
            this.createdDate = lead.getCreatedAt().format(formatter);
        }
    }
}