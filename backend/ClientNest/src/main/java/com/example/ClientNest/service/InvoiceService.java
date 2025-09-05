package com.example.ClientNest.service;

import java.util.List;

import com.example.ClientNest.dto.InvoiceDTO;

public interface InvoiceService {
    List<InvoiceDTO> getAllInvoices();
    List<InvoiceDTO> getInvoicesByCustomerId(Long customerId);
    InvoiceDTO getInvoiceById(Long id);
    
    /**
     * Create a new invoice for a customer
     * @param customerId The ID of the customer
     * @param invoiceDTO The invoice data
     * @return The created invoice
     */
    InvoiceDTO createInvoice(Long customerId, InvoiceDTO invoiceDTO);
    
    /**
     * Generate an invoice from an accepted quotation
     * @param quotationId The ID of the accepted quotation
     * @return The newly created invoice
     */
    InvoiceDTO generateInvoiceFromQuotation(Long quotationId);
    
    /**
     * Get invoices by customer email
     * @param email The customer's email address
     * @return List of invoices for the customer
     */
    List<InvoiceDTO> getInvoicesByEmail(String email);
    
    void deleteInvoice(Long id);
    String generateInvoiceNumber();
}