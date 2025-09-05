package com.example.ClientNest.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ClientNest.dto.InvoiceDTO;
import com.example.ClientNest.service.InvoiceService;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "http://localhost:5173")
public class InvoiceController {
    
    @Autowired
    private InvoiceService invoiceService;
    
    @GetMapping
    public ResponseEntity<List<InvoiceDTO>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDTO> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }
    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<InvoiceDTO>> getInvoicesByCustomerId(@PathVariable Long customerId) {
        return ResponseEntity.ok(invoiceService.getInvoicesByCustomerId(customerId));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/generate-invoice-number")
    public ResponseEntity<String> generateInvoiceNumber() {
        return ResponseEntity.ok(invoiceService.generateInvoiceNumber());
    }
    
    @org.springframework.web.bind.annotation.PostMapping("/customer/{customerId}")
    public ResponseEntity<InvoiceDTO> createInvoice(
            @PathVariable Long customerId,
            @org.springframework.web.bind.annotation.RequestBody InvoiceDTO invoiceDTO) {
        return ResponseEntity.ok(invoiceService.createInvoice(customerId, invoiceDTO));
    }
    
    /**
     * Generate an invoice from an accepted quotation
     * @param quotationId The ID of the accepted quotation
     * @return The newly created invoice
     */
    @org.springframework.web.bind.annotation.PostMapping("/from-quotation/{quotationId}")
    public ResponseEntity<?> generateInvoiceFromQuotation(@PathVariable Long quotationId) {
        try {
            InvoiceDTO invoice = invoiceService.generateInvoiceFromQuotation(quotationId);
            return ResponseEntity.ok(invoice);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to generate invoice: " + e.getMessage());
        }
    }
    
    /**
     * Get invoices by customer email
     * @param email The customer's email address
     * @return List of invoices for the customer
     */
    @GetMapping("/customer/email/{email}")
    public ResponseEntity<List<InvoiceDTO>> getInvoicesByEmail(@PathVariable String email) {
        return ResponseEntity.ok(invoiceService.getInvoicesByEmail(email));
    }
}