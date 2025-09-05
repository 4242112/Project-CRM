package com.example.ClientNest.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LoginResponseDTO {
    private Boolean isAuthenticated;
    private Long userId;
    private String name;
    private String email;
    private String role;
    private Long customerId;
    private String customerName;
    
    public LoginResponseDTO(Boolean isAuthenticated, Long userId, String name, String email, String role) {
        this.isAuthenticated = isAuthenticated;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
    }
}