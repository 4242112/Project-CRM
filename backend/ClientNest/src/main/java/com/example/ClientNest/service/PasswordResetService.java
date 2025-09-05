package com.example.ClientNest.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ClientNest.model.Customer;
import com.example.ClientNest.model.Employee;
import com.example.ClientNest.model.PasswordResetToken;
import com.example.ClientNest.repository.CustomerRepository;
import com.example.ClientNest.repository.EmployeeRepository;
import com.example.ClientNest.repository.PasswordResetTokenRepository;

@Service
public class PasswordResetService {
    
    @Autowired
    private PasswordResetTokenRepository tokenRepository;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private EmailService emailService;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    /**
     * Create a password reset token for a customer or employee
     * @param email The email of the user
     * @param userType The type of user (CUSTOMER or EMPLOYEE)
     * @return true if token was created, false otherwise
     */
    @Transactional
    public boolean createPasswordResetToken(String email, String userType) {
        // Validate user exists before creating token
        boolean userExists = false;
        String userName = "";
        
        if ("CUSTOMER".equals(userType)) {
            var customerOpt = customerRepository.findByEmail(email);
            userExists = customerOpt.isPresent();
            if (userExists) {
                userName = customerOpt.get().getName();
            }
        } else if ("EMPLOYEE".equals(userType)) {
            var employeeOpt = employeeRepository.findByEmail(email);
            userExists = employeeOpt.isPresent();
            if (userExists) {
                userName = employeeOpt.get().getName();
            }
        }
        
        // If user doesn't exist, return false but don't reveal this to the client
        if (!userExists) {
            return false;
        }
        
        // Delete any existing tokens for this user
        tokenRepository.findByUserEmailAndUserType(email, userType)
            .ifPresent(token -> tokenRepository.delete(token));
        
        // Create new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, email, userType);
        tokenRepository.save(resetToken);
        
        // Send email with reset link
        emailService.sendPasswordResetLink(email, userName, token);
        
        return true;
    }
    
    /**
     * Validate if a password reset token is valid
     * @param token The token to validate
     * @return true if token is valid, false otherwise
     */
    public boolean validatePasswordResetToken(String token) {
        return tokenRepository.findByToken(token)
                .map(resetToken -> !resetToken.isExpired() && !resetToken.isUsed())
                .orElse(false);
    }
    
    /**
     * Reset password using a valid token
     * @param token The token
     * @param newPassword The new password
     * @return true if password was reset, false otherwise
     */
    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        var tokenOptional = tokenRepository.findByToken(token);
        
        if (tokenOptional.isEmpty()) {
            return false;
        }
        
        PasswordResetToken resetToken = tokenOptional.get();
        
        // Check if token is expired or used
        if (resetToken.isExpired() || resetToken.isUsed()) {
            return false;
        }
        
        // Hash the new password
        String hashedPassword = passwordEncoder.encode(newPassword);
        
        // Update password based on user type
        boolean updated = false;
        if ("CUSTOMER".equals(resetToken.getUserType())) {
            updated = updateCustomerPassword(resetToken.getUserEmail(), hashedPassword);
        } else if ("EMPLOYEE".equals(resetToken.getUserType())) {
            updated = updateEmployeePassword(resetToken.getUserEmail(), hashedPassword);
        }
        
        if (updated) {
            // Mark token as used
            resetToken.setUsed(true);
            tokenRepository.save(resetToken);
            return true;
        }
        
        return false;
    }
    
    /**
     * Update customer password
     * @param email The customer email
     * @param hashedPassword The hashed password
     * @return true if password was updated, false otherwise
     */
    private boolean updateCustomerPassword(String email, String hashedPassword) {
        var customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            customer.setPasswordHash(hashedPassword);
            customer.setHasPassword(true);
            customerRepository.save(customer);
            return true;
        }
        return false;
    }
    
    /**
     * Update employee password
     * @param email The employee email
     * @param hashedPassword The hashed password
     * @return true if password was updated, false otherwise
     */
    private boolean updateEmployeePassword(String email, String hashedPassword) {
        var employeeOpt = employeeRepository.findByEmail(email);
        if (employeeOpt.isPresent()) {
            Employee employee = employeeOpt.get();
            employee.setHashedPassword(hashedPassword);
            employeeRepository.save(employee);
            return true;
        }
        return false;
    }
    
    /**
     * Clean up expired and used tokens
     */
    @Transactional
    public void cleanupTokens() {
        tokenRepository.deleteExpiredOrUsedTokens(LocalDateTime.now());
    }
}