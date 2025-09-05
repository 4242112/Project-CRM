package com.example.ClientNest.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.ClientNest.dto.QuotationDTO;
import com.example.ClientNest.service.QuotationService;

@RestController
@RequestMapping("/api/quotations")
public class QuotationController {

    @Autowired
    private QuotationService quotationService;

    @GetMapping("/opportunity/{opportunityId}")
    public ResponseEntity<?> getQuotationByOpportunity(@PathVariable Long opportunityId) {
        return ResponseEntity.ok(quotationService.getQuotationByOpportunity(opportunityId));
    }

    @PostMapping("/opportunity/{opportunityId}")
    public ResponseEntity<?> createQuotation(
            @PathVariable Long opportunityId,
            @RequestBody QuotationDTO quotationDTO) {
        return new ResponseEntity<>(
                quotationService.createQuotation(opportunityId, quotationDTO),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuotation(
            @PathVariable Long id,
            @RequestBody QuotationDTO quotationDTO) {
                System.out.println("QuotationDTO: " + quotationDTO);
        return ResponseEntity.ok(quotationService.updateQuotation(id, quotationDTO));
    }

    /**
     * Send a quotation to the customer (change stage from DRAFT to SENT)
     * @param id The ID of the quotation to send
     * @return The updated quotation
     */
    @PostMapping("/{id}/send")
    public ResponseEntity<?> sendQuotation(@PathVariable Long id) {
        try {
            QuotationDTO updatedQuotation = quotationService.sendQuotation(id);
            return ResponseEntity.ok(updatedQuotation);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Accept a quotation (change stage from SENT to ACCEPTED)
     * @param id The ID of the quotation to accept
     * @return The updated quotation
     */
    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptQuotation(@PathVariable Long id) {
        try {
            QuotationDTO updatedQuotation = quotationService.acceptQuotation(id);
            return ResponseEntity.ok(updatedQuotation);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Reject a quotation (change stage from SENT to REJECTED)
     * @param id The ID of the quotation to reject
     * @return The updated quotation
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectQuotation(@PathVariable Long id) {
        try {
            QuotationDTO updatedQuotation = quotationService.rejectQuotation(id);
            return ResponseEntity.ok(updatedQuotation);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all quotations for a specific customer that are in SENT stage or later
     * @param customerId The ID of the customer
     * @return List of quotations for the customer
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<QuotationDTO>> getCustomerQuotations(@PathVariable Long customerId) {
        List<QuotationDTO> quotations = quotationService.getCustomerQuotations(customerId);
        return ResponseEntity.ok(quotations);
    }

    /**
     * Get all quotations for a customer by their email address
     * @param email The email address of the customer
     * @return List of quotations for the customer
     */
    @GetMapping("/customer/email/{email}")
    public ResponseEntity<List<QuotationDTO>> getQuotationsByEmail(@PathVariable String email) {
        List<QuotationDTO> quotations = quotationService.getQuotationsByCustomerEmail(email);
        return ResponseEntity.ok(quotations);
    }
    
}
