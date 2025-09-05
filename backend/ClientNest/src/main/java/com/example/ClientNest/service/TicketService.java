package com.example.ClientNest.service;

import com.example.ClientNest.dto.TicketDTO;
import java.util.List;

public interface TicketService {
    List<TicketDTO> getAllTickets();
    TicketDTO getTicketById(Long id);
    TicketDTO createTicket(TicketDTO ticketDTO);
    TicketDTO updateTicket(Long id, TicketDTO ticketDTO);
    void deleteTicket(Long id);

    List<TicketDTO> getTicketsByCustomerId(Long customerId);
    List<TicketDTO> getTicketsByCustomerEmail(String email);

    List<TicketDTO> getTicketsByEmployeeId(Long employeeId);
    TicketDTO assignTicketToEmployee(Long ticketId, Long employeeId);
    List<TicketDTO> getTicketsByEmployeeEmail(String email);
    List<TicketDTO> getTicketsByStatus(String status);
    
    TicketDTO approveTicket(Long ticketId);
    TicketDTO denyTicket(Long ticketId);
}