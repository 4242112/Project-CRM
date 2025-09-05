package com.example.ClientNest.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.ClientNest.dto.LeadDTO;
import com.example.ClientNest.misc.ActivityStatus;
import com.example.ClientNest.model.Customer;
import com.example.ClientNest.model.Lead;
import com.example.ClientNest.repository.CustomerRepository;
import com.example.ClientNest.repository.EmployeeRepository;
import com.example.ClientNest.repository.LeadRepository;

@Service
public class LeadService {

    @Autowired
    private LeadRepository leadRepository;
    @Autowired

    private CustomerRepository customerRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;

    
    public LeadDTO enterLeadDetails(LeadDTO leadDetails) {
        Lead lead = new Lead();
        lead.setRequirement(leadDetails.getRequirement());
        lead.setProbability(leadDetails.getConversionProbability());
        lead.setExpectedRevenue(leadDetails.getExpectedRevenue());
        lead.setSource(Lead.Source.valueOf(leadDetails.getSource()));

        var employeeOption = employeeRepository.findByName(leadDetails.getAssignedTo().trim());
        if (employeeOption.isPresent()) {
            lead.setEmployee(employeeOption.get());
            leadDetails.setAssignedTo(employeeOption.get().getName());
        } else {
            throw new RuntimeException("Employee not found");
        }

        var customerOption = customerRepository.findByName(leadDetails.getName());
        if (customerOption.isPresent()) {
            lead.setCustomer(customerOption.get());
        } else {
            var customer = new Customer();
            customer.setName(leadDetails.getName());
            customer.setEmail(leadDetails.getEmail());
            customer.setPhoneNumber(leadDetails.getPhoneNumber());

            customer.setAddress(leadDetails.getAddress());
            customer.setCity(leadDetails.getCity());
            customer.setState(leadDetails.getState());
            customer.setZipCode(leadDetails.getZipCode());
            customer.setCountry(leadDetails.getCountry());

            customer.setWebsite(leadDetails.getWebsite());

            customer = customerRepository.save(customer);
            lead.setCustomer(customer);
        }
        
        leadRepository.save(lead);
        return leadDetails;
    }

    public List<LeadDTO> getAllLeadDetails() {
        return leadRepository.getAllLeadDetails();
    }

    public LeadDTO getLeadDetailsById(Long id) {
        return leadRepository.getLeadDetailsById(id);
    }

    public List<Lead> findByEmployeeId(Long employeeId) {
        return leadRepository.findByEmployeeId(employeeId);
    }

    public LeadDTO updateLeadDetails(Long id, LeadDTO leadDetails) {
        System.out.println(leadDetails);
        var leadOption = leadRepository.findById(id);

        if (leadOption.isPresent()) {
            var lead = leadOption.get();
            lead.setRequirement(leadDetails.getRequirement());
            lead.setSource(Lead.Source.valueOf(leadDetails.getSource().toUpperCase()));
            lead.setProbability(leadDetails.getConversionProbability());
            lead.setExpectedRevenue(leadDetails.getExpectedRevenue());

            var employeeOption = employeeRepository.findByName(leadDetails.getAssignedTo().trim());
            if (employeeOption.isPresent()) {
                lead.setEmployee(employeeOption.get());
                leadDetails.setAssignedTo(employeeOption.get().getName());
            } else {
                throw new RuntimeException("Employee not found");
            }

            var customer = new Customer();
            var customerOption = customerRepository.findByName(leadDetails.getName());
            if (customerOption.isPresent()) {
                customer = customerOption.get();
            }
            customer.setName(leadDetails.getName());
            customer.setEmail(leadDetails.getEmail());
            customer.setPhoneNumber(leadDetails.getPhoneNumber());

            customer.setAddress(leadDetails.getAddress());
            customer.setCity(leadDetails.getCity());
            customer.setState(leadDetails.getState());
            customer.setZipCode(leadDetails.getZipCode());
            customer.setCountry(leadDetails.getCountry());

            customer.setWebsite(leadDetails.getWebsite());

            customer = customerRepository.save(customer);
            

            lead.setCustomer(customer);
            
            leadRepository.save(lead);
            return leadDetails;
        } else {
            throw new RuntimeException("Lead not found");
        }
    }

    public void deleteLeadDetails(Long id) {
        var leadOption = leadRepository.findById(id);
        if (leadOption.isPresent()) {
            var lead = leadOption.get();
            lead.setStatus(ActivityStatus.DELETED);
            leadRepository.save(lead);
        } else {
            throw new RuntimeException("Lead not found");
        }
    }

    public LeadDTO restoreLeadDetails(Long id) {
        System.out.println("restoring lead with id: " + id);
        var leadOption = leadRepository.findById(id);
        if (leadOption.isPresent()) {
            var lead = leadOption.get();
            lead.setStatus(ActivityStatus.ACTIVE);
            leadRepository.save(lead);
            return getLeadDetailsById(id);
        } else {
            throw new RuntimeException("Lead not found");
        }
    }

    public List<LeadDTO> getDeletedLeadDetails() {
        return leadRepository.getDeletedLeadDetails();
    }

    public void permanentDeleteLeadDetails(Long id) {
        System.out.println("deleting lead with id: " + id);
        var leadOption = leadRepository.findById(id);
        if (leadOption.isPresent()) {
            leadRepository.delete(leadOption.get());
        } else {
            throw new RuntimeException("Lead not found");
        }
    }
}