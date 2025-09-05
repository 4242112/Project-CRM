package com.example.ClientNest.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.ClientNest.dto.OpportunityDTO;
import com.example.ClientNest.service.OpportunityService;

@RestController
@RequestMapping("/api/opportunities")
@CrossOrigin(origins = "http://localhost:5173")
public class OpportunityController {
    @Autowired
    private OpportunityService opportunityService;
    
    /**
     * Get all active opportunities
     */
    @GetMapping
    public List<OpportunityDTO> getAllActiveOpportunities() {
        return opportunityService.getAllActiveOpportunities();
    }


    /**
     * Get all deleted opportunities
     */
    @GetMapping("/recycle-bin")
    public List<OpportunityDTO> getAllDeletedOpportunities() {
        return opportunityService.getDeletedOpportunities();
    }


    /**
     * Get opportunity by ID
     */
    @GetMapping("/{id}")
    public OpportunityDTO getOpportunityById(@PathVariable Long id) {
        return opportunityService.getOpportunityById(id);
    }
    
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<OpportunityDTO>> getOpportunitiesByEmployeeId(@PathVariable Long employeeId) {
        var opportunities = opportunityService.getOpportunitiesByEmployeeId(employeeId);
        return ResponseEntity.ok(opportunities);
    }

    @PostMapping("/from-lead/{leadId}")
    public OpportunityDTO createOpportunityFromLead(
            @PathVariable Long leadId) {
        return opportunityService.createOpportunityFromLead(leadId);
    }
    
    /**
     * Update an existing opportunity
     */
    @PutMapping("/{id}")
    public OpportunityDTO updateOpportunity(@PathVariable Long id, @RequestBody OpportunityDTO opportunityDTO) {
        return opportunityService.updateOpportunity(id, opportunityDTO);
    }
    
    /**
     * Restore a deleted opportunity
     */
    @PutMapping("/restore/{id}")
    public OpportunityDTO restoreOpportunity(@PathVariable Long id) {
        return opportunityService.restoreOpportunity(id);
    }
    
     /**
     * Delete an opportunity (soft delete)
     */
    @DeleteMapping("/{id}")
    public void deleteOpportunity(@PathVariable Long id) {
        opportunityService.deleteOpportunity(id);
    }
    

    /**
     * Permanently delete an opportunity
     */
    @DeleteMapping("/delete-permanent/{id}")
    public void permanentDeleteOpportunity(@PathVariable Long id) {
        opportunityService.permanentlyDeleteOpportunity(id);
    }
}