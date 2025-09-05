package com.example.ClientNest.service.impl;

import com.example.ClientNest.dto.TicketDTO;
import com.example.ClientNest.model.Customer;
import com.example.ClientNest.model.Employee;
import com.example.ClientNest.model.Ticket;
import com.example.ClientNest.model.Ticket.TicketStatus;
import com.example.ClientNest.repository.CustomerRepository;
import com.example.ClientNest.repository.EmployeeRepository;
import com.example.ClientNest.repository.TicketRepository;
import com.example.ClientNest.service.TicketService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final CustomerRepository customerRepository;
    private EmployeeRepository employeeRepository;

    @Autowired
    public TicketServiceImpl(TicketRepository ticketRepository, CustomerRepository customerRepository, EmployeeRepository employeeRepository) {
        this.ticketRepository = ticketRepository;
        this.customerRepository = customerRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    public List<TicketDTO> getAllTickets() {
        return ticketRepository.findAll()
                .stream()
                .map(TicketDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public TicketDTO getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found with id: " + id));
        return new TicketDTO(ticket);
    }

    @Override
    @Transactional
    public TicketDTO createTicket(TicketDTO ticketDTO) {
        Ticket ticket = convertToEntity(ticketDTO);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        ticket.setStatus(Ticket.TicketStatus.NEW);
        ticket.setEmployee(null);

        System.out.println("\n\n" + ticket + "\n\n");
        Ticket savedTicket = ticketRepository.save(ticket);
        return new TicketDTO(savedTicket);
    }

    @Override
    @Transactional
    public TicketDTO updateTicket(Long id, TicketDTO ticketDTO) {
        Ticket existingTicket = ticketRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found with id: " + id));
        
        existingTicket.setSubject(ticketDTO.getSubject());
        existingTicket.setDescription(ticketDTO.getDescription());
        existingTicket.setStatus(Ticket.TicketStatus.valueOf(ticketDTO.getStatus()));
        existingTicket.setUpdatedAt(LocalDateTime.now());
        
        // Update customer if provided
        if (ticketDTO.getCustomerId() != null) {
            Customer customer = customerRepository.findById(ticketDTO.getCustomerId())
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + ticketDTO.getCustomerId()));
            existingTicket.setCustomer(customer);
        } else if (ticketDTO.getCustomerEmail() != null) {
            Customer customer = customerRepository.findByEmail(ticketDTO.getCustomerEmail())
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with email: " + ticketDTO.getCustomerEmail()));
            existingTicket.setCustomer(customer);
        }

        // Update employee if provided
        if (ticketDTO.getEmployeeEmail() != null) {
            Employee employee = employeeRepository.findByEmail(ticketDTO.getEmployeeEmail())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with email: " + ticketDTO.getEmployeeEmail()));
            existingTicket.setEmployee(employee);
        }
        
        Ticket updatedTicket = ticketRepository.save(existingTicket);
        return new TicketDTO(updatedTicket);
    }

    @Override
    @Transactional
    public void deleteTicket(Long id) {
        if (!ticketRepository.existsById(id)) {
            throw new EntityNotFoundException("Ticket not found with id: " + id);
        }
        ticketRepository.deleteById(id);
    }

    @Override
    public List<TicketDTO> getTicketsByCustomerId(Long customerId) {
        List<Ticket> tickets = ticketRepository.findByCustomerId(customerId);
        return tickets.stream()
                .map(TicketDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<TicketDTO> getTicketsByCustomerEmail(String email) {
        List<Ticket> tickets = ticketRepository.findByCustomerEmail(email);
        return tickets.stream()
                .map(TicketDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<TicketDTO> getTicketsByEmployeeId(Long employeeId) {
        List<Ticket> tickets = ticketRepository.findByEmployeeId(employeeId);
        return tickets.stream()
                .map(TicketDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<TicketDTO> getTicketsByEmployeeEmail(String email) {
        List<Ticket> tickets = ticketRepository.findByEmployeeEmail(email);
        return tickets.stream()
                .map(TicketDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TicketDTO assignTicketToEmployee(Long ticketId, Long employeeId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found with id: " + ticketId));
        
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));
        
        // Update the ticket with the employee and change status to IN_PROGRESS
        ticket.setEmployee(employee);
        ticket.setStatus(Ticket.TicketStatus.IN_PROGRESS);
        ticket.setUpdatedAt(LocalDateTime.now());
        
        Ticket updatedTicket = ticketRepository.save(ticket);
        return new TicketDTO(updatedTicket);
    }

    @Override
    public List<TicketDTO> getTicketsByStatus(String status) {
        List<Ticket> tickets = ticketRepository.findByStatus(TicketStatus.valueOf(status));
        return tickets.stream()
                .map(TicketDTO::new)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public TicketDTO approveTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new EntityNotFoundException("Ticket not found with id: " + ticketId));
        
        // Update the ticket status to IN_PROGRESS
        ticket.setStatus(TicketStatus.CLOSED);
        ticket = ticketRepository.save(ticket);
        
        return new TicketDTO(ticket);
    }
    
    @Override
    @Transactional
    public TicketDTO denyTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new EntityNotFoundException("Ticket not found with id: " + ticketId));
        
        System.out.println("denyTicket: " + ticketId);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticket = ticketRepository.save(ticket);
        
        return new TicketDTO(ticket);
    }
    
    // Helper method to convert DTO to Entity
    private Ticket convertToEntity(TicketDTO dto) {
        Ticket ticket = new Ticket();
        
        if (dto.getId() != null) {
            ticket.setId(dto.getId());
        }

        System.out.println("\n\n" + dto + "\n\n");
        
        ticket.setSubject(dto.getSubject());
        ticket.setDescription(dto.getDescription());

        try {
            ticket.setStatus(dto.getStatus() != null ? Ticket.TicketStatus.valueOf(dto.getStatus()) : Ticket.TicketStatus.NEW);
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
        
        // Set customer based on either ID or email
        if (dto.getCustomerId() != null) {
            Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + dto.getCustomerId()));
            ticket.setCustomer(customer);
        } else if (dto.getCustomerEmail() != null) {
            Customer customer = customerRepository.findByEmail(dto.getCustomerEmail())
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with email: " + dto.getCustomerEmail()));
            ticket.setCustomer(customer);
        }
        
        return ticket;
    }
}