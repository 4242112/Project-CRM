package com.example.ClientNest.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ClientNest.dto.OpportunityDTO;
import com.example.ClientNest.misc.ActivityStatus;
import com.example.ClientNest.model.Customer;
import com.example.ClientNest.model.Employee;
import com.example.ClientNest.model.Lead;
import com.example.ClientNest.model.Opportunity;
import com.example.ClientNest.model.Quotation;
import com.example.ClientNest.repository.CustomerRepository;
import com.example.ClientNest.repository.EmployeeRepository;
import com.example.ClientNest.repository.InvoiceRepository;
import com.example.ClientNest.repository.LeadRepository;
import com.example.ClientNest.repository.OpportunityRepository;
import com.example.ClientNest.repository.QuotationRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class OpportunityService {
    private static final Logger logger = LoggerFactory.getLogger(OpportunityService.class);

    @Autowired
    private OpportunityRepository opportunityRepository;
    
    @Autowired
    private LeadRepository leadRepository;
    
    @Autowired
    private QuotationRepository quotationRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    /**
     * Get all active opportunities
     * @return List of OpportunityDTOs
     */
    public List<OpportunityDTO> getAllActiveOpportunities() {
        logger.info("Fetching all active opportunities");
        return opportunityRepository.findAllActiveOpportunityDTOs();
    }
    
    /**
     * Get all deleted opportunities
     * @return List of OpportunityDTOs
     */
    public List<OpportunityDTO> getDeletedOpportunities() {
        logger.info("Fetching all deleted opportunities");
        return opportunityRepository.findAllDeletedOpportunityDTOs();
    }
    
    /**
     * Get opportunity by ID
     * @param id Opportunity ID
     * @return OpportunityDTO
     */
    public OpportunityDTO getOpportunityById(Long id) {
        logger.info("Fetching opportunity with ID: {}", id);
        System.out.println("\n\nOpportunity ID: " + id + "\n\n");
        return opportunityRepository.findById(id)
                .map(OpportunityDTO::new)
                .orElseThrow(() -> new RuntimeException("Opportunity not found with ID: " + id));
    }
    
    /**
     * Get opportunities by stage
     * @param stage Opportunity stage
     * @return List of OpportunityDTOs
     */
    public List<OpportunityDTO> getOpportunitiesByStage(Opportunity.Stage stage) {
        logger.info("Fetching opportunities with stage: {}", stage);
        return opportunityRepository.findActiveOpportunityDTOsByStage(stage.name());
    }


    /**
     * Get opportunities by employee ID
     * @param employeeId Employee ID
     * @return List of OpportunityDTOs
     */
    public List<OpportunityDTO> getOpportunitiesByEmployeeId(Long employeeId) {
        logger.info("Fetching opportunities for employee with ID: {}", employeeId);
        return opportunityRepository.findActiveOpportunityDTOsByEmployeeId(employeeId);
    }
    
    /**
     * Create a new opportunity
     * @param opportunityDTO DTO with opportunity data
     * @return Created OpportunityDTO
     */
    @Transactional
    public OpportunityDTO createOpportunity(OpportunityDTO opportunityDTO) {
        logger.info("Creating new opportunity");
        
        Opportunity opportunity = new Opportunity();
        opportunity.setStage(opportunityDTO.getStage() != null ? opportunityDTO.getStage() : Opportunity.Stage.NEW);
        opportunity.setStatus(ActivityStatus.ACTIVE);
        
        // Set lead
        if (opportunityDTO.getLead() != null && opportunityDTO.getLead().getId() != null) {
            Lead lead = leadRepository.findById(opportunityDTO.getLead().getId())
                    .orElseThrow(() -> new RuntimeException("Lead not found with ID: " + opportunityDTO.getLead().getId()));
            opportunity.setLead(lead);
        } else {
            throw new RuntimeException("Lead is required");
        }
        
        // Set quotation
        var quotation = quotationRepository.findById(opportunityDTO.getQuotationId());
        opportunity.setQuotation(quotation.orElse(null));
        
        // Set employee
        if (opportunityDTO.getLead().getAssignedTo() != null) {
            Employee employee = employeeRepository.findByName(opportunityDTO.getLead().getAssignedTo())
                    .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + opportunityDTO.getLead().getName()));
            opportunity.setEmployee(employee);
        } else {
            throw new RuntimeException("Assigned employee is required");
        }
        
        // Set customer
        if (opportunityDTO.getLead().getName() != null) {
            Customer customer = customerRepository.findByName(opportunityDTO.getLead().getName())
                    .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + opportunityDTO.getLead().getName()));
            opportunity.setCustomer(customer);
        } else {
            throw new RuntimeException("Customer is required");
        }
        
        // Save opportunity
        opportunity = opportunityRepository.save(opportunity);
        logger.info("Created opportunity with ID: {}", opportunity.getId());
        
        return new OpportunityDTO(opportunity);
    }

    /**
     * Create an opportunity from a lead
     * @param leadId Lead ID
     * @return Created OpportunityDTO
     */
    @Transactional
    public OpportunityDTO createOpportunityFromLead(Long leadId) {
        logger.info("Creating opportunity from lead with ID: {}", leadId);
        
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new RuntimeException("Lead not found with ID: " + leadId));
        
        Opportunity opportunity = new Opportunity();
        opportunity.setStage(Opportunity.Stage.NEW);
        opportunity.setStatus(ActivityStatus.ACTIVE);
        opportunity.setLead(lead);

        lead.setStatus(ActivityStatus.ARCHIVED);

        opportunity.setQuotation(null);

        opportunity.setEmployee(lead.getEmployee());
        opportunity.setCustomer(lead.getCustomer());
        
        // Save opportunity
        opportunity = opportunityRepository.save(opportunity);
        logger.info("Created opportunity from lead with ID: {}", leadId);
        
        return new OpportunityDTO(opportunity);
    }
    
    /**
     * Update an existing opportunity
     * @param id Opportunity ID
     * @param opportunityDTO DTO with updated data
     * @return Updated OpportunityDTO
     */
    @Transactional
    public OpportunityDTO updateOpportunity(Long id, OpportunityDTO opportunityDTO) {
        logger.info("Updating opportunity with ID: {}", id);
        
        Opportunity opportunity = opportunityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Opportunity not found with ID: " + id));
        
        // Update stage if provided
        if (opportunityDTO.getStage() != null) {
            opportunity.setStage(opportunityDTO.getStage());
        }
        
        // Update lead if provided
        if (opportunityDTO.getLead() != null && opportunityDTO.getLead().getId() != null) {
            Lead lead = leadRepository.findById(opportunityDTO.getLead().getId())
                    .orElseThrow(() -> new RuntimeException("Lead not found with ID: " + opportunityDTO.getLead().getId()));
            opportunity.setLead(lead);
        }
        
        // Set quotation
        var quotation = quotationRepository.findById(opportunityDTO.getQuotationId());
        opportunity.setQuotation(quotation.orElse(null));
        
        // Set employee
        if (opportunityDTO.getLead().getAssignedTo() != null) {
            Employee employee = employeeRepository.findByName(opportunityDTO.getLead().getAssignedTo())
                    .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + opportunityDTO.getLead().getName()));
            opportunity.setEmployee(employee);
        } else {
            throw new RuntimeException("Assigned employee is required");
        }
        
        // Set customer
        if (opportunityDTO.getLead().getName() != null) {
            Customer customer = customerRepository.findByName(opportunityDTO.getLead().getName())
                    .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + opportunityDTO.getLead().getName()));
            opportunity.setCustomer(customer);
        } else {
            throw new RuntimeException("Customer is required");
        }
        
        // Save updated opportunity
        opportunity = opportunityRepository.save(opportunity);
        logger.info("Updated opportunity with ID: {}", opportunity.getId());
        
        return new OpportunityDTO(opportunity);
    }
    
    /**
     * Delete an opportunity (soft delete)
     * @param id Opportunity ID
     */
    @Transactional
    public void deleteOpportunity(Long id) {
        logger.info("Soft deleting opportunity with ID: {}", id);
        
        Opportunity opportunity = opportunityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Opportunity not found with ID: " + id));
        
        opportunity.setStatus(ActivityStatus.DELETED);
        opportunityRepository.save(opportunity);
        
        logger.info("Soft deleted opportunity with ID: {}", id);
    }
    
    /**
     * Restore a deleted opportunity
     * @param id Opportunity ID
     */
    @Transactional
    public OpportunityDTO restoreOpportunity(Long id) {
        logger.info("Restoring deleted opportunity with ID: {}", id);
        
        Opportunity opportunity = opportunityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Opportunity not found with ID: " + id));
        
        opportunity.setStatus(ActivityStatus.ACTIVE);
        opportunityRepository.save(opportunity);
        
        logger.info("Restored opportunity with ID: {}", id);
        return new OpportunityDTO(opportunity);
    }
    
    /**
     * Permanently delete an opportunity
     * @param id Opportunity ID
     */
    @Transactional
    public void permanentlyDeleteOpportunity(Long id) {
        logger.info("Permanently deleting opportunity with ID: {}", id);
        
        Opportunity opportunity = opportunityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Opportunity not found with ID: " + id));

        Quotation quotation = opportunity.getQuotation();
        if (quotation != null) {

            var invoice = invoiceRepository.findByOpportunity(opportunity);
            if(invoice.isPresent()) {
                invoiceRepository.delete(invoice.get());
            }

            quotationRepository.delete(quotation);
        }
        
        opportunityRepository.delete(opportunity);
        
        logger.info("Permanently deleted opportunity with ID: {}", id);
    }
    
    /**
     * Update opportunity stage
     * @param id Opportunity ID
     * @param stage New stage
     * @return Updated OpportunityDTO
     */
    @Transactional
    public OpportunityDTO updateOpportunityStage(Long id, Opportunity.Stage stage) {
        logger.info("Updating opportunity stage to {} for opportunity ID: {}", stage, id);
        
        Opportunity opportunity = opportunityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Opportunity not found with ID: " + id));
        
        opportunity.setStage(stage);
        opportunity = opportunityRepository.save(opportunity);
        
        logger.info("Updated opportunity stage to {} for opportunity ID: {}", stage, id);
        
        return new OpportunityDTO(opportunity);
    }
}
