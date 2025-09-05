package com.example.ClientNest.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.ClientNest.dto.InvoiceDTO;
import com.example.ClientNest.model.Invoice;
import com.example.ClientNest.model.Opportunity;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    @Query("""
            SELECT new com.example.ClientNest.dto.InvoiceDTO(q, i)
            FROM Invoice i
            LEFT JOIN i.quotation q
            """)
    List<InvoiceDTO> findAllInvoices();

    @Query("""
            SELECT new com.example.ClientNest.dto.InvoiceDTO(q, i)
            FROM Invoice i
            LEFT JOIN i.quotation q
            WHERE i.id = :id
            """)
    Optional<InvoiceDTO> findInvoiceById(Long id);

    @Query("""
            SELECT new com.example.ClientNest.dto.InvoiceDTO(q, i)
            FROM Invoice i
            JOIN i.customer c
            LEFT JOIN i.quotation q
            JOIN q.items qi
            JOIN qi.product p
            WHERE c.id = :customerId
            """)
    List<InvoiceDTO> findByCustomerId(Long customerId);

    /**
     * Find invoices by customer email
     * @param email The customer's email address
     * @return List of invoice DTOs for the customer
     */
    @Query("""
            SELECT new com.example.ClientNest.dto.InvoiceDTO(q, i)
            FROM Invoice i
            JOIN i.customer c
            LEFT JOIN i.quotation q
            WHERE c.email = :email
            """)
    List<InvoiceDTO> findByCustomerEmail(String email);

    Optional<Invoice> findByOpportunity(Opportunity opportunity);
    
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
}