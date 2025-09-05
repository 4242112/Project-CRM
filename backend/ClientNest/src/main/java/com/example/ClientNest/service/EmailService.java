package com.example.ClientNest.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.example.ClientNest.dto.InvoiceDTO;
import com.example.ClientNest.dto.QuotationDTO;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender emailSender;
    
    public void sendPasswordNotification(String to, String name, boolean isUpdate) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(isUpdate ? "Your ClientNest Password Has Been Updated" : "Your ClientNest Account Password Has Been Set");
        
        String emailContent = "Hello " + name + ",\n\n" +
                              "This is to inform you that " + (isUpdate ? "your password has been updated" : "a password has been set for your account") + 
                              " in the ClientNest CRM system.\n\n" +
                              "You can now log in using your email address and the password provided to you by the administrator.\n\n" +
                              "If you didn't request this change or have any questions, please contact your account administrator.\n\n" +
                              "Best regards,\n" +
                              "The ClientNest Team";
        
        message.setText(emailContent);
        emailSender.send(message);
    }
    
    public boolean sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            emailSender.send(message);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public void sendRegistrationConfirmation(String to, String name) {

        System.out.println("\n\nSending registration confirmation email to: " + to + "\n\n");
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Welcome to ClientNest - Registration Complete");
        
        String emailContent = "Dear " + name + ",\n\n" +
                              "Welcome to ClientNest! Your account registration has been completed successfully.\n\n" +
                              "You can now log in to your customer portal using your email address and the password you've set during registration.\n\n" +
                              "With your ClientNest account, you can:\n" +
                              "- View your invoices and quotations\n" +
                              "- Submit and track support tickets\n" +
                              "- Update your account information\n\n" +
                              "If you have any questions or need assistance, please don't hesitate to contact our support team.\n\n" +
                              "Thank you for choosing ClientNest!\n\n" +
                              "Best regards,\n" +
                              "The ClientNest Team";
        
        message.setText(emailContent);
        emailSender.send(message);
    }

    /**
     * Send a password reset link to the user
     * @param to The recipient email
     * @param name The recipient name
     * @param resetToken The password reset token
     */
    public void sendPasswordResetLink(String to, String name, String resetToken) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("ClientNest - Password Reset Request");
        
        // Create reset link with token
        String resetLink = "http://localhost:5173/reset-password?token=" + resetToken;
        
        String emailContent = "Dear " + name + ",\n\n" +
                              "We received a request to reset your password for your ClientNest account.\n\n" +
                              "To reset your password, please click on the link below or copy and paste it into your browser:\n\n" +
                              resetLink + "\n\n" +
                              "This link will expire in 30 minutes for security reasons.\n\n" +
                              "If you did not request a password reset, please ignore this email.\n\n" +
                              "Best regards,\n" +
                              "The ClientNest Team";
        
        message.setText(emailContent);
        emailSender.send(message);
    }
    
    /**
     * Send notification when a quotation is sent to a customer
     * @param to The customer's email address
     * @param name The customer's name
     * @param quotation The quotation details
     */
    public void sendQuotationNotification(String to, String name, QuotationDTO quotation) {
        System.out.println("\n\nSending quotation notification email to: " + to + "\n\n");
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("ClientNest - New Quotation Available");
        
        String emailContent = "Dear " + name + ",\n\n" +
                              "We are pleased to inform you that a new quotation has been prepared for you.\n\n" +
                              "Quotation Details:\n" +
                              "- Title: " + quotation.getTitle() + "\n" +
                              "- Description: " + quotation.getDescription() + "\n" +
                              "- Amount: ₹" + quotation.getAmount() + "\n" +
                              "- Valid Until: " + quotation.getValidUntil().toLocalDate() + "\n\n" +
                              "You can view and respond to this quotation by logging into your ClientNest account.\n\n" +
                              "If you have any questions or need any clarification, please don't hesitate to contact us.\n\n" +
                              "Best regards,\n" +
                              "The ClientNest Team";
        
        message.setText(emailContent);
        emailSender.send(message);
    }
    
    /**
     * Send notification when an invoice is generated for a customer
     * @param to The customer's email address
     * @param name The customer's name
     * @param invoice The invoice details
     */
    public void sendInvoiceNotification(String to, String name, InvoiceDTO invoice) {
        System.out.println("\n\nSending invoice notification email to: " + to + "\n\n");
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("ClientNest - New Invoice Generated");
        
        String emailContent = "Dear " + name + ",\n\n" +
                              "An invoice has been generated for your accepted quotation.\n\n" +
                              "Invoice Details:\n" +
                              "- Invoice Number: " + invoice.getInvoiceNumber() + "\n" +
                              "- Amount: ₹" + invoice.getTotal() + "\n" +
                              "- Due Date: " + invoice.getDueDate() + "\n\n" +
                              "You can view the complete invoice details by logging into your ClientNest account.\n\n" +
                              "If you have any questions regarding this invoice, please contact our support team.\n\n" +
                              "Thank you for your business.\n\n" +
                              "Best regards,\n" +
                              "The ClientNest Team";
        
        message.setText(emailContent);
        emailSender.send(message);
    }
}