package com.example.ClientNest.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ClientNest.dto.LeadDTO;
import com.example.ClientNest.model.Lead;
import com.example.ClientNest.service.LeadService;

@RestController
@RequestMapping("/api/leads")
@CrossOrigin(origins = "http://localhost:5173")
public class LeadController {
    
    @Autowired
    private LeadService leadService;

    @GetMapping
    public List<LeadDTO> getAllLeadDetails() {
        return leadService.getAllLeadDetails();
    }
    
    @GetMapping("/{id}")
    public LeadDTO getLeadDetailsById(@PathVariable Long id) {
        return leadService.getLeadDetailsById(id);
    }

    @GetMapping("/recycle-bin")
    public List<LeadDTO> getDeletedLeadDetails() {
        return leadService.getDeletedLeadDetails();
    }

    @GetMapping("/employee/{employeeId}")
public ResponseEntity<List<Lead>> getLeadsByEmployeeId(@PathVariable Long employeeId) {
    List<Lead> leads = leadService.findByEmployeeId(employeeId);
    return ResponseEntity.ok(leads);
}

    @PostMapping
    public LeadDTO enterLeadDetails(@RequestBody LeadDTO leadDetails) {
        return leadService.enterLeadDetails(leadDetails);
    }

    @PutMapping("/{id}")
    public LeadDTO updateLeadDetails(@PathVariable Long id, @RequestBody LeadDTO leadDetails) {
        return leadService.updateLeadDetails(id, leadDetails);
    }

    @PutMapping("/restore/{id}")
    public LeadDTO restoreLeadDetails(@PathVariable Long id) {
        return leadService.restoreLeadDetails(id);
    }

    @DeleteMapping("/{id}")
    public void deleteLeadDetails(@PathVariable Long id) {
        leadService.deleteLeadDetails(id);
    }

    @DeleteMapping("/delete-permanent/{id}")
    public void permanentDeleteLeadDetails(@PathVariable Long id) {
        leadService.permanentDeleteLeadDetails(id);
    }
}