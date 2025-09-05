package com.example.ClientNest.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.ClientNest.dto.EmployeeDTO;
import com.example.ClientNest.model.Employee;
import com.example.ClientNest.repository.EmployeeRepository;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;
    
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    public List<String> getAllEmployeeNames() {
        return employeeRepository.findAllNames();
    }
    
    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public EmployeeDTO createEmployee(Employee employee) {
        // Hash the password before saving
        if (employee.getHashedPassword() != null) {
            employee.setHashedPassword(passwordEncoder.encode(employee.getHashedPassword()));
        }
        
        Employee savedEmployee = employeeRepository.save(employee);
        return convertToDTO(savedEmployee);
    }
    
    public boolean deleteEmployee(Long id) {
        if (employeeRepository.existsById(id)) {
            employeeRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    public boolean validateCredentials(String email, String password) {
        return employeeRepository.findByEmail(email)
            .map(employee -> passwordEncoder.matches(password, employee.getHashedPassword()))
            .orElse(false);
    }
    
    public EmployeeDTO findByEmail(String email) {
        return employeeRepository.findByEmail(email)
                .map(this::convertToDTO)
                .orElse(null);
    }
    
    // Convert Entity to DTO
    private EmployeeDTO convertToDTO(Employee employee) {
        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(employee.getId());
        dto.setName(employee.getName());
        dto.setEmail(employee.getEmail());
        dto.setPhoneNumber(employee.getPhone());
        return dto;
    }
    
    // Convert DTO to Entity
    @SuppressWarnings("unused")
    private Employee convertToEntity(EmployeeDTO dto) {
        Employee employee = new Employee();
        if (dto.getId() != null) {
            employee.setId(dto.getId());
        }
        employee.setName(dto.getName());
        employee.setEmail(dto.getEmail());
        employee.setPhone(dto.getPhoneNumber());
        return employee;
    }
}