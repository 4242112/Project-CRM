package com.example.ClientNest.controller;

import com.example.ClientNest.dto.TicketDTO;
import com.example.ClientNest.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class TicketController {

    private final TicketService ticketService;

    @Autowired
    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public ResponseEntity<List<TicketDTO>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDTO> getTicketById(@PathVariable Long id) {
        try {
            TicketDTO ticket = ticketService.getTicketById(id);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<TicketDTO> createTicket(@RequestBody TicketDTO ticketDTO) {
        try {
            TicketDTO createdTicket = ticketService.createTicket(ticketDTO);
            return new ResponseEntity<>(createdTicket, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/customer/{customerId}")
    public ResponseEntity<TicketDTO> createTicketForCustomer(
            @PathVariable Long customerId,
            @RequestBody TicketDTO ticketDTO) {
        try {
            ticketDTO.setCustomerId(customerId);
            TicketDTO createdTicket = ticketService.createTicket(ticketDTO);
            return new ResponseEntity<>(createdTicket, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketDTO> updateTicket(@PathVariable Long id, @RequestBody TicketDTO ticketDTO) {
        try {
            TicketDTO updatedTicket = ticketService.updateTicket(id, ticketDTO);
            return ResponseEntity.ok(updatedTicket);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/assign/{employeeId}")
    public ResponseEntity<TicketDTO> assignTicketToEmployee(
            @PathVariable Long id,
            @PathVariable Long employeeId) {
        try {
            TicketDTO updatedTicket = ticketService.assignTicketToEmployee(id, employeeId);
            return ResponseEntity.ok(updatedTicket);
        } catch (Exception e) {
            System.out.println("Error assigning ticket: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        try {
            ticketService.deleteTicket(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<TicketDTO>> getTicketsByCustomerId(@PathVariable Long customerId) {
        List<TicketDTO> tickets = ticketService.getTicketsByCustomerId(customerId);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/customer/email/{email}")
    public ResponseEntity<List<TicketDTO>> getTicketsByCustomerEmail(@PathVariable String email) {
        List<TicketDTO> tickets = ticketService.getTicketsByCustomerEmail(email);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<TicketDTO>> getTicketsByStatus(@PathVariable String status) {
        List<TicketDTO> tickets = ticketService.getTicketsByStatus(status);
        return ResponseEntity.ok(tickets);
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<TicketDTO> approveTicket(@PathVariable Long id) {
        TicketDTO updatedTicket = ticketService.approveTicket(id);
        return ResponseEntity.ok(updatedTicket);
    }

    @PutMapping("/{id}/deny")
    public ResponseEntity<TicketDTO> denyTicket(@PathVariable Long id) {
        TicketDTO updatedTicket = ticketService.denyTicket(id);
        return ResponseEntity.ok(updatedTicket);
    }
}