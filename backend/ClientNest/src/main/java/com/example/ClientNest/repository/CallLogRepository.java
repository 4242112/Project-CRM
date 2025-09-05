package com.example.ClientNest.repository;

import com.example.ClientNest.model.CallLog;
import com.example.ClientNest.model.CallLog.CallType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CallLogRepository extends JpaRepository<CallLog, Long> {
    
    List<CallLog> findByCustomerId(Long customerId);
    
    List<CallLog> findByEmployeeId(Long employeeId);
    
    List<CallLog> findByType(CallType type);
    
    List<CallLog> findByCustomerIdAndType(Long customerId, CallType type);
    
    List<CallLog> findByDateTimeBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    List<CallLog> findByCustomerIdAndDateTimeBetween(
        Long customerId, LocalDateTime startDate, LocalDateTime endDate);
        
    // New methods to find call logs by customer email
    @Query("SELECT c FROM CallLog c WHERE c.customer.email = :email")
    List<CallLog> findByCustomerEmail(@Param("email") String email);
    
    @Query("SELECT c FROM CallLog c WHERE c.customer.email = :email AND c.type = :type")
    List<CallLog> findByCustomerEmailAndType(@Param("email") String email, @Param("type") CallType type);
    
    @Query("SELECT c FROM CallLog c WHERE c.customer.email = :email AND c.dateTime BETWEEN :startDate AND :endDate")
    List<CallLog> findByCustomerEmailAndDateTimeBetween(
        @Param("email") String email, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}