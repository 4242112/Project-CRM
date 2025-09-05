package com.example.ClientNest.controller;

import com.example.ClientNest.dto.CallLogDTO;
import com.example.ClientNest.model.CallLog.CallType;
import com.example.ClientNest.service.CallLogService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/call-logs")
@CrossOrigin(origins = "http://localhost:5173")
public class CallLogController {

    @Autowired
    private CallLogService callLogService;

    // Create a new call log
    @PostMapping
    public ResponseEntity<CallLogDTO> createCallLog(@RequestBody CallLogDTO callLogDTO) {
        CallLogDTO createdCallLog = callLogService.createCallLog(callLogDTO);
        return new ResponseEntity<>(createdCallLog, HttpStatus.CREATED);
    }

    // Get a call log by id
    @GetMapping("/{id}")
    public ResponseEntity<CallLogDTO> getCallLogById(@PathVariable Long id) {
        try {
            CallLogDTO callLog = callLogService.getCallLogById(id);
            return new ResponseEntity<>(callLog, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Get all call logs
    @GetMapping
    public ResponseEntity<List<CallLogDTO>> getAllCallLogs() {
        List<CallLogDTO> callLogs = callLogService.getAllCallLogs();
        return new ResponseEntity<>(callLogs, HttpStatus.OK);
    }

    // Get call logs by customer id
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<CallLogDTO>> getCallLogsByCustomerId(@PathVariable Long customerId) {
        List<CallLogDTO> callLogs = callLogService.getCallLogsByCustomerId(customerId);
        return new ResponseEntity<>(callLogs, HttpStatus.OK);
    }
    
    // Get call logs by customer email
    @GetMapping("/customer/email/{email}")
    public ResponseEntity<List<CallLogDTO>> getCallLogsByCustomerEmail(@PathVariable String email) {
        List<CallLogDTO> callLogs = callLogService.getCallLogsByCustomerEmail(email);
        return new ResponseEntity<>(callLogs, HttpStatus.OK);
    }

    // Get call logs by employee id
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<CallLogDTO>> getCallLogsByEmployeeId(@PathVariable Long employeeId) {
        List<CallLogDTO> callLogs = callLogService.getCallLogsByEmployeeId(employeeId);
        return new ResponseEntity<>(callLogs, HttpStatus.OK);
    }

    // Update a call log
    @PutMapping("/{id}")
    public ResponseEntity<CallLogDTO> updateCallLog(@PathVariable Long id, @RequestBody CallLogDTO callLogDTO) {
        try {
            CallLogDTO updatedCallLog = callLogService.updateCallLog(id, callLogDTO);
            return new ResponseEntity<>(updatedCallLog, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a call log
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCallLog(@PathVariable Long id) {
        try {
            callLogService.deleteCallLog(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Get call logs by type
    @GetMapping("/type/{callType}")
    public ResponseEntity<List<CallLogDTO>> getCallLogsByType(@PathVariable CallType callType) {
        List<CallLogDTO> callLogs = callLogService.getCallLogsByType(callType);
        return new ResponseEntity<>(callLogs, HttpStatus.OK);
    }

    // Get call logs by customer id and type
    @GetMapping("/customer/{customerId}/type/{callType}")
    public ResponseEntity<List<CallLogDTO>> getCallLogsByCustomerIdAndType(
            @PathVariable Long customerId, 
            @PathVariable CallType callType) {
        List<CallLogDTO> callLogs = callLogService.getCallLogsByCustomerIdAndType(customerId, callType);
        return new ResponseEntity<>(callLogs, HttpStatus.OK);
    }
    
    // Get call logs by customer email and type
    @GetMapping("/customer/email/{email}/type/{callType}")
    public ResponseEntity<List<CallLogDTO>> getCallLogsByCustomerEmailAndType(
            @PathVariable String email, 
            @PathVariable CallType callType) {
        List<CallLogDTO> callLogs = callLogService.getCallLogsByCustomerEmailAndType(email, callType);
        return new ResponseEntity<>(callLogs, HttpStatus.OK);
    }

    // Get call logs by date range
    @GetMapping("/date-range")
    public ResponseEntity<List<CallLogDTO>> getCallLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<CallLogDTO> callLogs = callLogService.getCallLogsByDateRange(startDate, endDate);
        return new ResponseEntity<>(callLogs, HttpStatus.OK);
    }

    // Get call logs by customer id and date range
    @GetMapping("/customer/{customerId}/date-range")
    public ResponseEntity<List<CallLogDTO>> getCallLogsByCustomerIdAndDateRange(
            @PathVariable Long customerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<CallLogDTO> callLogs = callLogService.getCallLogsByCustomerIdAndDateRange(customerId, startDate, endDate);
        return new ResponseEntity<>(callLogs, HttpStatus.OK);
    }
    
    // Get call logs by customer email and date range
    @GetMapping("/customer/email/{email}/date-range")
    public ResponseEntity<List<CallLogDTO>> getCallLogsByCustomerEmailAndDateRange(
            @PathVariable String email,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<CallLogDTO> callLogs = callLogService.getCallLogsByCustomerEmailAndDateRange(email, startDate, endDate);
        return new ResponseEntity<>(callLogs, HttpStatus.OK);
    }
}