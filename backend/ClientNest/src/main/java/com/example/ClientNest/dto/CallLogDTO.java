package com.example.ClientNest.dto;

import com.example.ClientNest.model.CallLog;
import com.example.ClientNest.model.CallLog.CallType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class CallLogDTO {
    private Long id;
    private String title;
    private String description;
    private CallType type;
    private LocalDateTime dateTime;
    private Integer minutes;
    private Integer seconds;
    private String customerName;
    private String employeeName;
    private String customerEmail;
    private String employeeEmail;
    
    public CallLogDTO(Long id, String title, String description, CallType type, LocalDateTime dateTime, Integer minutes, Integer seconds, 
            String customerName, String employeeName) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.type = type;
        this.dateTime = dateTime;
        this.minutes = minutes;
        this.seconds = seconds;
        this.customerName = customerName;
        this.employeeName = employeeName;
    }
    
    // Constructor with email fields
    public CallLogDTO(Long id, String title, String description, CallType type, LocalDateTime dateTime, Integer minutes, Integer seconds, 
            String customerName, String employeeName, String customerEmail, String employeeEmail) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.type = type;
        this.dateTime = dateTime;
        this.minutes = minutes;
        this.seconds = seconds;
        this.customerName = customerName;
        this.employeeName = employeeName;
        this.customerEmail = customerEmail;
        this.employeeEmail = employeeEmail;
    }

    public CallLogDTO(CallLogDTO callLog) {
        this.id = callLog.getId();
        this.title = callLog.getTitle();
        this.description = callLog.getDescription();
        this.type = callLog.getType();
        this.dateTime = callLog.getDateTime();
        this.minutes = callLog.getMinutes();
        this.seconds = callLog.getSeconds();
        this.customerName = callLog.getCustomerName();
        this.employeeName = callLog.getEmployeeName();
        this.customerEmail = callLog.getCustomerEmail();
        this.employeeEmail = callLog.getEmployeeEmail();
    }

    public CallLogDTO(CallLog callLog) {
        this.id = callLog.getId();
        this.title = callLog.getTitle();
        this.description = callLog.getDescription();
        this.type = callLog.getType();
        this.dateTime = callLog.getDateTime();
        this.minutes = callLog.getMinutes();
        this.seconds = callLog.getSeconds();
        if (callLog.getCustomer() != null) {
            this.customerName = callLog.getCustomer().getName();
            this.customerEmail = callLog.getCustomer().getEmail();
        }
        if (callLog.getEmployee() != null) {
            this.employeeName = callLog.getEmployee().getName();
            this.employeeEmail = callLog.getEmployee().getEmail();
        }
    }
}