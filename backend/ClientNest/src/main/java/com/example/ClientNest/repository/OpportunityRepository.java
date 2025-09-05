package com.example.ClientNest.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.ClientNest.dto.OpportunityDTO;
import com.example.ClientNest.model.Opportunity;
import com.example.ClientNest.model.Quotation;

@Repository
public interface OpportunityRepository extends JpaRepository<Opportunity, Long> {
    
    @Query("""
            SELECT o FROM Opportunity o
            WHERE o.status = 'ACTIVE'
            """)
    List<OpportunityDTO> findAllActiveOpportunityDTOs();

    @Query("""
            SELECT o FROM Opportunity o
            WHERE o.status = 'Deleted'
            """)
    List<OpportunityDTO> findAllDeletedOpportunityDTOs();

    @Query("""
            SELECT o FROM Opportunity o
            WHERE o.stage = :stage
            AND o.status = 'ACTIVE'
            """)
    List<OpportunityDTO> findActiveOpportunityDTOsByStage(String stage);

    Optional<Opportunity> findByQuotation(Quotation quotation);

	@Query("""
			SELECT o FROM Opportunity o
			WHERE o.employee.id = :employeeId
			""")
    List<OpportunityDTO> findActiveOpportunityDTOsByEmployeeId(Long employeeId);
}
