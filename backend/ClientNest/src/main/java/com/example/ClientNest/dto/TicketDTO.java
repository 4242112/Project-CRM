package com.example.ClientNest.dto;


import java.time.format.DateTimeFormatter;

import com.example.ClientNest.model.Ticket;

import lombok.Data;

@Data
public class TicketDTO {
    public static enum TicketStatus {
        NEW("New"),
        OPEN("Open"),
        IN_PROGRESS("In Progress"),
        RESOLVED("Resolved"),
        CLOSED("Closed");
        
        private final String value;
        
        TicketStatus(String value) {
            this.value = value;
        }
        
        public String getValue() {
            return value;
        }
        
        public static TicketStatus fromString(String text) {
            for (TicketStatus status : TicketStatus.values()) {
                if (status.value.equalsIgnoreCase(text)) {
                    return status;
                }
            }
            return NEW; // Default value
        }
    }

    private Long id;
    private String subject;
    private String description;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String employeeName;
    private String employeeEmail;
    private String status;
    private String createdAt; 
    private String updatedAt;  
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yy");
    
    public TicketDTO() {
    }
    
    public TicketDTO(Ticket ticket) {
        this.id = ticket.getId();
        this.subject = ticket.getSubject();
        this.description = ticket.getDescription();
        
        if (ticket.getCustomer() != null) {
            this.customerId = ticket.getCustomer().getId();
            this.customerName = ticket.getCustomer().getName();
            this.customerEmail = ticket.getCustomer().getEmail();
        }

        if (ticket.getEmployee() != null) {
            this.employeeName = ticket.getEmployee().getName();
            this.employeeEmail = ticket.getEmployee().getEmail();
        }

        this.status = ticket.getStatus().name();
        
        // Format dates as strings in dd/MM/yy format
        this.createdAt = ticket.getCreatedAt() != null ? ticket.getCreatedAt().format(DATE_FORMATTER) : null;
        this.updatedAt = ticket.getUpdatedAt() != null ? ticket.getUpdatedAt().format(DATE_FORMATTER) : null;
    }

    public void setTitle(String string) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setTitle'");
    }
}