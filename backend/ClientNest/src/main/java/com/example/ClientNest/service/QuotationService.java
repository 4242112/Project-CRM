package com.example.ClientNest.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.ClientNest.dto.QuotationDTO;
import com.example.ClientNest.model.Customer;
import com.example.ClientNest.model.QItem;
import com.example.ClientNest.model.Quotation;
import com.example.ClientNest.repository.OpportunityRepository;
import com.example.ClientNest.repository.ProductRepository;
import com.example.ClientNest.repository.QuotationRepository;

@Service
public class QuotationService {

    @Autowired
    private OpportunityRepository opportunityRepository;

    @Autowired
    private QuotationRepository quotationRepository;

    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private EmailService emailService;

    public Optional<QuotationDTO> getQuotationByOpportunity(Long opportunityId) {
        return quotationRepository.findByOpportunityId(opportunityId);
    }

    public QuotationDTO createQuotation(Long opportunityId, QuotationDTO quotationDTO) {
        Quotation quotation = new Quotation();
        quotation.setTitle(quotationDTO.getTitle());
        quotation.setDescription(quotationDTO.getDescription());
        quotation.setValidUntil(quotationDTO.getValidUntil());
        quotation.setTotal(quotationDTO.getAmount());

        // Create a mutable list instead of using toList() which returns an immutable list
        List<QItem> itemsList = new ArrayList<>();
        for (var item : quotationDTO.getItems()) {
            QItem qItem = new QItem();
            var product = productRepository.findByNameContainingIgnoreCase(
                item.getProduct().getName()
            );
            qItem.setProduct((product));
            qItem.setQuantity(item.getQuantity());
            // Set the discount value from DTO to entity
            qItem.setDiscount(item.getDiscount() != null ? item.getDiscount() : 0.0);
            qItem.setQuotation(quotation);
            itemsList.add(qItem);
        }
        quotation.setItems(itemsList);

        var opportunity = opportunityRepository.findById(opportunityId);
        Quotation savedQuotation = null;
        if (opportunity.isPresent()) {
            var opp = opportunity.get();
            opp.setQuotation(quotation);

            savedQuotation = opportunityRepository.save(opp).getQuotation();
        } else {
            throw new RuntimeException("Opportunity not found");
        }
        return new QuotationDTO(savedQuotation);
    }

    public QuotationDTO updateQuotation(Long id, QuotationDTO quotationDTO) {
        Optional<Quotation> optionalQuotation = quotationRepository.findById(id);
        if (optionalQuotation.isPresent()) {
            Quotation quotation = optionalQuotation.get();
            quotation.setTitle(quotationDTO.getTitle());
            quotation.setDescription(quotationDTO.getDescription());
            quotation.setValidUntil(quotationDTO.getValidUntil());
            quotation.setTotal(quotationDTO.getAmount());

            // Clear existing items to avoid issues with modification
            quotation.getItems().clear();
            
            // Create a mutable list instead of using toList() which returns an immutable list
            List<QItem> updatedItems = new ArrayList<>();
            for (var item : quotationDTO.getItems()) {
                QItem qItem = new QItem();
                var product = productRepository.findByNameContainingIgnoreCase(
                    item.getProduct().getName()
                );
                qItem.setProduct((product));
                qItem.setQuantity(item.getQuantity());
                // Set the discount value from DTO to entity
                qItem.setDiscount(item.getDiscount() != null ? item.getDiscount() : 0.0);
                qItem.setQuotation(quotation);
                updatedItems.add(qItem);
            }
            quotation.setItems(updatedItems);

            var updatedQuotation = quotationRepository.save(quotation);
            return new QuotationDTO(updatedQuotation);
        } else {
            throw new RuntimeException("Quotation not found");
        }
    }

    /**
     * Get all quotations for a specific customer that are in SENT stage or later
     * (visible to customers)
     * 
     * @param customerId The ID of the customer
     * @return List of quotation DTOs for the customer
     */
    public List<QuotationDTO> getCustomerQuotations(Long customerId) {
        List<Quotation> quotations = quotationRepository.findByCustomerId(
            customerId);
        
        return quotations.stream()
            .map(QuotationDTO::new)
            .collect(Collectors.toList());
    }

    /**
     * Get all quotations for a customer by their email address
     * 
     * @param email The email address of the customer
     * @return List of quotation DTOs for the customer
     */
    public List<QuotationDTO> getQuotationsByCustomerEmail(String email) {
        List<Quotation> quotations = quotationRepository.findByCustomerEmail(email);
        
        return quotations.stream()
            .map(QuotationDTO::new)
            .collect(Collectors.toList());
    }

    /**
     * Change the stage of a quotation from DRAFT to SENT
     * @param id The ID of the quotation to send
     * @return The updated quotation DTO
     * @throws IllegalStateException if the quotation is not in DRAFT stage
     * @throws RuntimeException if the quotation is not found
     */
    public QuotationDTO sendQuotation(Long id) {
        Optional<Quotation> optionalQuotation = quotationRepository.findById(id);
        if (optionalQuotation.isPresent()) {
            Quotation quotation = optionalQuotation.get();
            
            // Check if quotation is in DRAFT stage
            if (quotation.getStage() != Quotation.Stage.DRAFT) {
                throw new IllegalStateException("Quotation must be in DRAFT stage to be sent");
            }
            
            // Update the stage to SENT
            quotation.setStage(Quotation.Stage.SENT);
            
            // Save the updated quotation
            Quotation updatedQuotation = quotationRepository.save(quotation);
            
            // Send email notification to customer
            try {
                var opportunity = opportunityRepository.findByQuotation(updatedQuotation)
                    .orElseThrow(() -> new RuntimeException("No opportunity found for this quotation"));
                
                Customer customer = opportunity.getCustomer();
                if (customer != null && customer.getEmail() != null) {
                    QuotationDTO quotationDTO = new QuotationDTO(updatedQuotation);
                    emailService.sendQuotationNotification(customer.getEmail(), customer.getName(), quotationDTO);
                }
            } catch (Exception e) {
                // Log the error but don't disrupt the main flow
                System.err.println("Failed to send quotation email notification: " + e.getMessage());
                e.printStackTrace();
            }
            
            return new QuotationDTO(updatedQuotation);
        } else {
            throw new RuntimeException("Quotation not found with id: " + id);
        }
    }

    /**
     * Accept a quotation (change stage from SENT to ACCEPTED)
     * @param id The ID of the quotation to accept
     * @return The updated quotation DTO
     * @throws IllegalStateException if the quotation is not in SENT stage
     * @throws RuntimeException if the quotation is not found
     */
    public QuotationDTO acceptQuotation(Long id) {
        Optional<Quotation> optionalQuotation = quotationRepository.findById(id);
        if (optionalQuotation.isPresent()) {
            Quotation quotation = optionalQuotation.get();
            
            // Check if quotation is in SENT stage
            if (quotation.getStage() != Quotation.Stage.SENT) {
                throw new IllegalStateException("Quotation must be in SENT stage to be accepted");
            }
            
            // Update the stage to ACCEPTED
            quotation.setStage(Quotation.Stage.ACCEPTED);
            
            // Save the updated quotation
            Quotation updatedQuotation = quotationRepository.save(quotation);
            return new QuotationDTO(updatedQuotation);
        } else {
            throw new RuntimeException("Quotation not found with id: " + id);
        }
    }
    
    /**
     * Reject a quotation (change stage from SENT to REJECTED)
     * @param id The ID of the quotation to reject
     * @return The updated quotation DTO
     * @throws IllegalStateException if the quotation is not in SENT stage
     * @throws RuntimeException if the quotation is not found
     */
    public QuotationDTO rejectQuotation(Long id) {
        Optional<Quotation> optionalQuotation = quotationRepository.findById(id);
        if (optionalQuotation.isPresent()) {
            Quotation quotation = optionalQuotation.get();
            
            // Check if quotation is in SENT stage
            if (quotation.getStage() != Quotation.Stage.SENT) {
                throw new IllegalStateException("Quotation must be in SENT stage to be rejected");
            }
            
            // Update the stage to REJECTED
            quotation.setStage(Quotation.Stage.REJECTED);
            
            // Save the updated quotation
            Quotation updatedQuotation = quotationRepository.save(quotation);
            return new QuotationDTO(updatedQuotation);
        } else {
            throw new RuntimeException("Quotation not found with id: " + id);
        }
    }
}
