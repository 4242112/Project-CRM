package com.example.ClientNest.service.impl;

import com.example.ClientNest.dto.CallLogDTO;
import com.example.ClientNest.model.CallLog;
import com.example.ClientNest.model.CallLog.CallType;
import com.example.ClientNest.model.Customer;
import com.example.ClientNest.model.Employee;
import com.example.ClientNest.repository.CallLogRepository;
import com.example.ClientNest.repository.CustomerRepository;
import com.example.ClientNest.repository.EmployeeRepository;
import com.example.ClientNest.service.CallLogService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
public class CallLogServiceImpl implements CallLogService {

    @Autowired
    private CallLogRepository callLogRepository;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    // Helper method to convert CallLog entity to DTO
    private CallLogDTO convertToDTO(CallLog callLog) {
        CallLogDTO dto = new CallLogDTO();
        dto.setId(callLog.getId());
        dto.setTitle(callLog.getTitle());
        dto.setDescription(callLog.getDescription());
        dto.setType(callLog.getType());
        dto.setDateTime(callLog.getDateTime());
        dto.setMinutes(callLog.getMinutes());
        dto.setSeconds(callLog.getSeconds());
        
        if (callLog.getCustomer() != null) {
            dto.setCustomerName(callLog.getCustomer().getName());
            dto.setCustomerEmail(callLog.getCustomer().getEmail());
        }
        
        if (callLog.getEmployee() != null) {
            dto.setEmployeeName(callLog.getEmployee().getName());
            dto.setEmployeeEmail(callLog.getEmployee().getEmail());
        }
        
        return dto;
    }
    

    private CallLog convertToEntity(CallLogDTO dto) {
        CallLog callLog = new CallLog();
        callLog.setId(dto.getId());
        callLog.setTitle(dto.getTitle());
        callLog.setDescription(dto.getDescription());
        callLog.setType(dto.getType());
        callLog.setDateTime(dto.getDateTime());
        callLog.setMinutes(dto.getMinutes());
        callLog.setSeconds(dto.getSeconds());
        

        if (dto.getCustomerEmail() != null && !dto.getCustomerEmail().isEmpty()) {
            Customer customer = customerRepository.findByEmail(dto.getCustomerEmail())
                .orElseThrow(() -> new RuntimeException("Customer not found with Email: " + dto.getCustomerEmail()));
            callLog.setCustomer(customer);
        } else if (dto.getCustomerName() != null) {
            Customer customer = customerRepository.findByName(dto.getCustomerName())
                .orElseThrow(() -> new RuntimeException("Customer not found with Name: " + dto.getCustomerName()));
            callLog.setCustomer(customer);
        }
        
 
        if (dto.getEmployeeEmail() != null && !dto.getEmployeeEmail().isEmpty()) {
            Employee employee = employeeRepository.findByEmail(dto.getEmployeeEmail())
                .orElseThrow(() -> new RuntimeException("Employee not found with Email: " + dto.getEmployeeEmail()));
            callLog.setEmployee(employee);
        } else if (dto.getEmployeeName() != null) {
            Employee employee = employeeRepository.findByName(dto.getEmployeeName())
                .orElseThrow(() -> new RuntimeException("Employee not found with Name: " + dto.getEmployeeName()));
            callLog.setEmployee(employee);
        }
        
        return callLog;
    }

    @Override
    public CallLogDTO createCallLog(CallLogDTO callLogDTO) {
        CallLog callLog = convertToEntity(callLogDTO);
        CallLog savedCallLog = callLogRepository.save(callLog);
        return convertToDTO(savedCallLog);
    }

    @Override
    @Transactional(readOnly = true)
    public CallLogDTO getCallLogById(Long id) {
        Optional<CallLog> callLogOptional = callLogRepository.findById(id);
        return callLogOptional.map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Call Log not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CallLogDTO> getAllCallLogs() {
        List<CallLog> callLogs = callLogRepository.findAll();
        return callLogs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CallLogDTO> getCallLogsByCustomerId(Long customerId) {
        List<CallLog> callLogs = callLogRepository.findByCustomerId(customerId);
        return callLogs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CallLogDTO> getCallLogsByEmployeeId(Long employeeId) {
        List<CallLog> callLogs = callLogRepository.findByEmployeeId(employeeId);
        return callLogs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CallLogDTO updateCallLog(Long id, CallLogDTO callLogDTO) {
        CallLog existingCallLog = callLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Call Log not found with ID: " + id));
        
        existingCallLog.setTitle(callLogDTO.getTitle());
        existingCallLog.setDescription(callLogDTO.getDescription());
        existingCallLog.setType(callLogDTO.getType());
        existingCallLog.setDateTime(callLogDTO.getDateTime());
        existingCallLog.setMinutes(callLogDTO.getMinutes());
        existingCallLog.setSeconds(callLogDTO.getSeconds());
        
        if (callLogDTO.getCustomerEmail() != null && !callLogDTO.getCustomerEmail().isEmpty()) {
            Customer customer = customerRepository.findByEmail(callLogDTO.getCustomerEmail())
                .orElseThrow(() -> new RuntimeException("Customer not found with Email: " + callLogDTO.getCustomerEmail()));
            existingCallLog.setCustomer(customer);
        } else if (callLogDTO.getCustomerName() != null) {
            Customer customer = customerRepository.findByName(callLogDTO.getCustomerName())
                .orElseThrow(() -> new RuntimeException("Customer not found with Name: " + callLogDTO.getCustomerName()));
            existingCallLog.setCustomer(customer);
        }
        
        if (callLogDTO.getEmployeeEmail() != null && !callLogDTO.getEmployeeEmail().isEmpty()) {
            Employee employee = employeeRepository.findByEmail(callLogDTO.getEmployeeEmail())
                .orElseThrow(() -> new RuntimeException("Employee not found with Email: " + callLogDTO.getEmployeeEmail()));
            existingCallLog.setEmployee(employee);
        } else if (callLogDTO.getEmployeeName() != null) {
            Employee employee = employeeRepository.findByName(callLogDTO.getEmployeeName())
                .orElseThrow(() -> new RuntimeException("Employee not found with Name: " + callLogDTO.getEmployeeName()));
            existingCallLog.setEmployee(employee);
        }
        
        CallLog updatedCallLog = callLogRepository.save(existingCallLog);
        return convertToDTO(updatedCallLog);
    }

    @Override
    @Transactional
    public void deleteCallLog(Long id) {
        if (!callLogRepository.existsById(id)) {
            throw new RuntimeException("Call Log not found with ID: " + id);
        }
        callLogRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CallLogDTO> getCallLogsByType(CallType type) {
        List<CallLog> callLogs = callLogRepository.findByType(type);
        return callLogs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CallLogDTO> getCallLogsByCustomerIdAndType(Long customerId, CallType type) {
        List<CallLog> callLogs = callLogRepository.findByCustomerIdAndType(customerId, type);
        return callLogs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CallLogDTO> getCallLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        List<CallLog> callLogs = callLogRepository.findByDateTimeBetween(startDate, endDate);
        return callLogs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CallLogDTO> getCallLogsByCustomerIdAndDateRange(Long customerId, LocalDateTime startDate, LocalDateTime endDate) {
        List<CallLog> callLogs = callLogRepository.findByCustomerIdAndDateTimeBetween(customerId, startDate, endDate);
        return callLogs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CallLogDTO> getCallLogsByCustomerEmail(String email) {
        List<CallLog> callLogs = callLogRepository.findByCustomerEmail(email);
        return callLogs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CallLogDTO> getCallLogsByCustomerEmailAndType(String email, CallType type) {
        List<CallLog> callLogs = callLogRepository.findByCustomerEmailAndType(email, type);
        return callLogs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CallLogDTO> getCallLogsByCustomerEmailAndDateRange(String email, LocalDateTime startDate, LocalDateTime endDate) {
        List<CallLog> callLogs = callLogRepository.findByCustomerEmailAndDateTimeBetween(email, startDate, endDate);
        return callLogs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}