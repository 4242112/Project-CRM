package com.example.ClientNest.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.ClientNest.dto.NoteDTO;
import com.example.ClientNest.model.Note;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    
    @Query("""
        SELECT new com.example.ClientNest.dto.NoteDTO(n)
        FROM Note n
        WHERE n.location = com.example.ClientNest.misc.Location.LEAD AND n.locationId = :id
            """)
        List<NoteDTO> findByLeadIdInLead(Long id);
            
            
    @Query("""
        SELECT new com.example.ClientNest.dto.NoteDTO(n)
        FROM Note n
        WHERE n.location = com.example.ClientNest.misc.Location.OPPORTUNITY AND n.locationId = :id
            """)
    List<NoteDTO> findByOpportunityIdInOpportunity(Long id);

    @Query("""
        SELECT new com.example.ClientNest.dto.NoteDTO(n)
        FROM Note n
        WHERE n.location = com.example.ClientNest.misc.Location.CUSTOMER AND n.locationId = :id
            """)
    List<NoteDTO> findByCustomerIdInCustomer(Long id);

    default List<NoteDTO> findByLocationAndId(String location, Long id) {
        switch (location.toUpperCase()) {
            case "LEAD":
                return findByLeadIdInLead(id);
            case "OPPORTUNITY":
                return findByOpportunityIdInOpportunity(id);
            case "CUSTOMER":
                return findByCustomerIdInCustomer(id);
            default:
                throw new IllegalArgumentException("Invalid location: " + location);
        }
    }   
}