package com.example.ClientNest.dto;

public class PasswordResetDTO {
    private String token;
    private String password;
    

    public PasswordResetDTO() {
    }
    
    public PasswordResetDTO(String token, String password) {
        this.token = token;
        this.password = password;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
}