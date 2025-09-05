package com.example.ClientNest.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.ClientNest.model.Customer;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmail(String email);
    Optional<Customer> findByName(String name);

    @Query("SELECT c.name FROM Customer c WHERE c.type != 'DELETED'")
    List<String> findAllNames();

    List<Customer> findByType(Customer.CustomerType type);

    @Query("SELECT c FROM Customer c WHERE c.status = 'ACTIVE'")
    List<Customer> findAllActiveCustomers();

    @Query("SELECT c FROM Customer c WHERE c.status = 'DELETED'")
    List<Customer> findDeletedCustomers();
}