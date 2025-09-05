package com.example.ClientNest.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.ClientNest.dto.CustomerDTO;
import com.example.ClientNest.dto.CustomerRegistrationDTO;
import com.example.ClientNest.dto.PasswordUpdateDTO;
import com.example.ClientNest.misc.ActivityStatus;
import com.example.ClientNest.model.Customer;
import com.example.ClientNest.repository.CustomerRepository;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private EmailService emailService;
    
    // Create password encoder
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    public List<CustomerDTO> getAllCustomers() {
        return customerRepository.findAllActiveCustomers()
                .stream()
                .map(CustomerDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public CustomerDTO getCustomerById(Long id) {
        return customerRepository.findById(id)
                .map(CustomerDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
    }
    
    public List<CustomerDTO> getCustomersByType(String type) {
        Customer.CustomerType customerType = Customer.CustomerType.valueOf(type);
        return customerRepository.findByType(customerType)
                .stream()
                .map(CustomerDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public CustomerDTO createCustomer(CustomerDTO customerDTO) {
        Customer customer = new Customer();
        updateCustomerFromDTO(customer, customerDTO);
        customer = customerRepository.save(customer);
        return CustomerDTO.fromEntity(customer);
    }
    
    public CustomerDTO updateCustomer(Long id, CustomerDTO customerDTO) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        
        updateCustomerFromDTO(customer, customerDTO);
        customer = customerRepository.save(customer);
        return CustomerDTO.fromEntity(customer);
    }
    
    public CustomerDTO setCustomerPassword(Long id, PasswordUpdateDTO passwordDTO) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        
        // Check if this is an update or a new password
        boolean isUpdate = customer.getHasPassword() != null && customer.getHasPassword();
        
        // Hash the password before storing it
        String hashedPassword = passwordEncoder.encode(passwordDTO.getPassword());
        customer.setPasswordHash(hashedPassword);
        customer.setHasPassword(true);
        
        customer = customerRepository.save(customer);
        
        if (passwordDTO.isSendEmail() && customer.getEmail() != null) {
            try {
                emailService.sendPasswordNotification(customer.getEmail(), customer.getName(), isUpdate);
            } catch (Exception e) {
                System.err.println("Failed to send password notification email: " + e.getMessage());
            }
        }
        
        return CustomerDTO.fromEntity(customer);
    }
    
    public CustomerDTO getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email)
                .map(CustomerDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException("Customer not found with email: " + email));
    }
    
    public CustomerDTO registerCustomer(Long id, CustomerRegistrationDTO registrationDTO) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        
        if (registrationDTO.getName() != null) {
            customer.setName(registrationDTO.getName());
        }
        if (registrationDTO.getPhoneNumber() != null) {
            customer.setPhoneNumber(registrationDTO.getPhoneNumber());
        }
        if (registrationDTO.getAddress() != null) {
            customer.setAddress(registrationDTO.getAddress());
        }
        if (registrationDTO.getCity() != null) {
            customer.setCity(registrationDTO.getCity());
        }
        if (registrationDTO.getState() != null) {
            customer.setState(registrationDTO.getState());
        }
        
        String hashedPassword = passwordEncoder.encode(registrationDTO.getPassword());
        customer.setPasswordHash(hashedPassword);
        customer.setHasPassword(true);
        
        customer = customerRepository.save(customer);
        
        // Send welcome email
        try {
            emailService.sendRegistrationConfirmation(customer.getEmail(), customer.getName());
        } catch (Exception e) {
            System.err.println("Failed to send registration confirmation email: " + e.getMessage());
        }
        
        return CustomerDTO.fromEntity(customer);
    }
    
    private void updateCustomerFromDTO(Customer customer, CustomerDTO dto) {
        if (dto.getName() != null) {
            customer.setName(dto.getName());
        }
        if (dto.getPhoneNumber() != null) {
            customer.setPhoneNumber(dto.getPhoneNumber());
        }
        if (dto.getEmail() != null) {
            customer.setEmail(dto.getEmail());
        }
        if (dto.getAddress() != null) {
            customer.setAddress(dto.getAddress());
        }
        if (dto.getCity() != null) {
            customer.setCity(dto.getCity());
        }
        if (dto.getState() != null) {
            customer.setState(dto.getState());
        }
        if (dto.getZipCode() != null) {
            customer.setZipCode(dto.getZipCode());
        }
        if (dto.getCountry() != null) {
            customer.setCountry(dto.getCountry());
        }
        if (dto.getWebsite() != null) {
            customer.setWebsite(dto.getWebsite());
        }
        if (dto.getType() != null) {
            customer.setType(dto.getType());
        }
    }

    public List<CustomerDTO> getDeletedCustomers() {
        return customerRepository.findDeletedCustomers()
                .stream()
                .map(CustomerDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public CustomerDTO restoreCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        
        customer.setStatus(ActivityStatus.ACTIVE);
        customer = customerRepository.save(customer);
        return CustomerDTO.fromEntity(customer);
    }

    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        
        System.out.println("Deleting customer with id: " + id);
        customer.setStatus(ActivityStatus.DELETED);
        customerRepository.save(customer);
    }

    public void permanentlyDeleteCustomer(Long id) {
        customerRepository.deleteById(id);
    }
}