package com.example.ClientNest.repository;

import com.example.ClientNest.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCustomerId(Long customerId);
    
    List<Ticket> findByStatus(Ticket.TicketStatus status);
    
    @Query("SELECT t FROM Ticket t WHERE t.customer.email = :email")
    List<Ticket> findByCustomerEmail(@Param("email") String email);

    @Query("SELECT t FROM Ticket t WHERE t.employee.id = :employeeId")
    List<Ticket> findByEmployeeId(Long employeeId);

    @Query("SELECT t FROM Ticket t WHERE t.employee.email = :email")
    List<Ticket> findByEmployeeEmail(String email);
}