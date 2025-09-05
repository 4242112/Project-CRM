package com.example.ClientNest.repository;

import com.example.ClientNest.dto.QuotationDTO;
import com.example.ClientNest.model.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Quotation entity
 */
@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {
    
    @Query("""
            SELECT new com.example.ClientNest.dto.QuotationDTO(q)
            FROM Opportunity o
            JOIN o.quotation q
            WHERE o.id = :opportunityId
            """)
    Optional<QuotationDTO> findByOpportunityId(Long opportunityId);
    
    /**
     * Find all quotations for a specific customer that are not in a specific stage
     * 
     * @param customerId The ID of the customer
     * @param stage The stage to exclude from results
     * @return List of quotations for the customer that are not in the specified stage
     */
    @Query("""
            SELECT q
            FROM Opportunity o
            JOIN o.quotation q
            JOIN o.customer c
            WHERE c.id = :customerId
			AND q.stage IN (
                'SENT', 
                'ACCEPTED', 
                'REJECTED'
			)
            """)
    List<Quotation> findByCustomerId(Long customerId);
    
    /**
     * Find all quotations for a customer by their email address and only include SENT, ACCEPTED, or REJECTED stages
     * (hide DRAFT quotations from customers)
     * 
     * @param email The email address of the customer
     * @return List of non-draft quotations for the customer with the specified email
     */
    @Query("""
            SELECT q
            FROM Opportunity o
            JOIN o.quotation q
            JOIN o.customer c
            WHERE c.email = :email 
            AND q.stage IN (
                'SENT', 
                'ACCEPTED', 
                'REJECTED'
        )
            """)
    List<Quotation> findByCustomerEmail(String email);
}