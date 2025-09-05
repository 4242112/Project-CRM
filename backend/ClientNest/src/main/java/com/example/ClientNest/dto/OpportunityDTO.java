package com.example.ClientNest.dto;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import com.example.ClientNest.model.Opportunity;
import com.example.ClientNest.model.Opportunity.Stage;
import com.example.ClientNest.misc.ActivityStatus;

import lombok.Data;

@Data
public class OpportunityDTO {
    private Long id;
    private Stage stage;
    private ActivityStatus status;
    private String createdDate;
    private LocalDateTime updatedAt;

    // Lead info
    private LeadDTO lead;

    private Long quotationId;

    public OpportunityDTO() {}

    public OpportunityDTO(Opportunity opportunity) {
        this.id = opportunity.getId();
        this.stage = opportunity.getStage();
        this.status = opportunity.getStatus();
        
        if (opportunity.getCreatedAt() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yy");
            this.createdDate = opportunity.getCreatedAt().format(formatter);
        }
        
        this.updatedAt = opportunity.getUpdatedAt();
        this.quotationId = opportunity.getQuotation() != null ? opportunity.getQuotation().getId() : null;
        this.lead = new LeadDTO(opportunity.getLead());
    }
}