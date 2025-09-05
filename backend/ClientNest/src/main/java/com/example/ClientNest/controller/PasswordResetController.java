package com.example.ClientNest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.ClientNest.dto.PasswordResetDTO;
import com.example.ClientNest.dto.PasswordResetRequestDTO;
import com.example.ClientNest.service.PasswordResetService;

@RestController
@RequestMapping("/api/password-reset")
@CrossOrigin(origins = "http://localhost:5173")
public class PasswordResetController {
    
    @Autowired
    private PasswordResetService passwordResetService;
    
    /**
     * Request a password reset
     * @param requestDTO Contains email and userType
     * @return Response with message
     */
    @PostMapping("/request")
    public ResponseEntity<String> requestPasswordReset(@RequestBody PasswordResetRequestDTO requestDTO) {
        // Always return 200 OK regardless of whether the email exists for security reasons
        @SuppressWarnings("unused")
        boolean emailSent = passwordResetService.createPasswordResetToken(requestDTO.getEmail(), requestDTO.getUserType());
        
        // We don't reveal whether the email exists or not to prevent user enumeration
        return ResponseEntity.ok("If the email address exists in our system, a password reset link will be sent.");
    }
    
    /**
     * Validate if a token is valid
     * @param token The token to validate
     * @return Boolean indicating if token is valid
     */
    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateToken(@RequestParam("token") String token) {
        boolean isValid = passwordResetService.validatePasswordResetToken(token);
        return ResponseEntity.ok(isValid);
    }
    
    /**
     * Reset password with token
     * @param resetDTO Contains token and new password
     * @return Response with result
     */
    @PostMapping("/reset")
    public ResponseEntity<String> resetPassword(@RequestBody PasswordResetDTO resetDTO) {
        boolean result = passwordResetService.resetPassword(resetDTO.getToken(), resetDTO.getPassword());
        
        if (result) {
            return ResponseEntity.ok("Password has been reset successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to reset password. The token may be invalid or expired.");
        }
    }
}