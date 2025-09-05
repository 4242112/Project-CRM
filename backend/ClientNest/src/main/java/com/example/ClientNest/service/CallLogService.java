package com.example.ClientNest.service;

import com.example.ClientNest.dto.CallLogDTO;
import com.example.ClientNest.model.CallLog.CallType;

import java.time.LocalDateTime;
import java.util.List;

public interface CallLogService {
    CallLogDTO createCallLog(CallLogDTO callLogDTO);
    
    CallLogDTO getCallLogById(Long id);
    
    List<CallLogDTO> getAllCallLogs();
    
    List<CallLogDTO> getCallLogsByCustomerId(Long customerId);
    
    List<CallLogDTO> getCallLogsByEmployeeId(Long employeeId);
    
    CallLogDTO updateCallLog(Long id, CallLogDTO callLogDTO);
    
    void deleteCallLog(Long id);
    
    List<CallLogDTO> getCallLogsByType(CallType type);
    
    List<CallLogDTO> getCallLogsByCustomerIdAndType(Long customerId, CallType type);
    
    List<CallLogDTO> getCallLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    List<CallLogDTO> getCallLogsByCustomerIdAndDateRange(
        Long customerId, LocalDateTime startDate, LocalDateTime endDate);
    
    List<CallLogDTO> getCallLogsByCustomerEmail(String email);
    
    List<CallLogDTO> getCallLogsByCustomerEmailAndType(String email, CallType type);
    
    List<CallLogDTO> getCallLogsByCustomerEmailAndDateRange(String email, LocalDateTime startDate, LocalDateTime endDate);
}