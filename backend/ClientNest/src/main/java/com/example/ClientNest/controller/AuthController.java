package com.example.ClientNest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ClientNest.dto.LoginRequestDTO;
import com.example.ClientNest.dto.LoginResponseDTO;
import com.example.ClientNest.model.Customer;
import com.example.ClientNest.repository.CustomerRepository;
import com.example.ClientNest.service.EmployeeService;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private EmployeeService employeeService;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    @PostMapping("/login/employee")
    public ResponseEntity<LoginResponseDTO> employeeLogin(@RequestBody LoginRequestDTO loginRequest) {
        boolean isAuthenticated = employeeService.validateCredentials(
                loginRequest.getEmail(), 
                loginRequest.getPassword());
        
        if (isAuthenticated) {
            var employee = employeeService.findByEmail(loginRequest.getEmail());
            LoginResponseDTO response = new LoginResponseDTO(
                true,
                employee.getId(),
                employee.getName(),
                employee.getEmail(),
                "EMPLOYEE"
            );
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body(new LoginResponseDTO(false, null, null, null, null));
        }
    }
    
    @PostMapping("/login/customer")
    public ResponseEntity<LoginResponseDTO> customerLogin(@RequestBody LoginRequestDTO loginRequest) {
        // Find customer by email
        Optional<Customer> customerOpt = customerRepository.findByEmail(loginRequest.getEmail());
        
        if (customerOpt.isEmpty()) {
            // Customer not found
            return ResponseEntity.status(404).body(new LoginResponseDTO(false, null, null, null, null));
        }
        
        Customer customer = customerOpt.get();
        
        // Check if customer has a password set
        if (customer.getPasswordHash() == null || !customer.getHasPassword()) {
            // Password not set for this customer
            return ResponseEntity.status(403).body(new LoginResponseDTO(false, null, null, null, null));
        }
        
        // Validate password
        boolean isAuthenticated = passwordEncoder.matches(loginRequest.getPassword(), customer.getPasswordHash());
        
        if (isAuthenticated) {
            LoginResponseDTO response = new LoginResponseDTO(
                true,
                customer.getId(),
                customer.getName(),
                customer.getEmail(),
                "CUSTOMER"
            );
            response.setCustomerId(customer.getId());
            response.setCustomerName(customer.getName());
            return ResponseEntity.ok(response);
        } else {
            // Invalid password
            return ResponseEntity.status(401).body(new LoginResponseDTO(false, null, null, null, null));
        }
    }
}