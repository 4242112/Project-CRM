package com.example.ClientNest.service.impl;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ClientNest.dto.InvoiceDTO;
import com.example.ClientNest.model.Customer;
import com.example.ClientNest.model.Employee;
import com.example.ClientNest.model.Invoice;
import com.example.ClientNest.model.Quotation;
import com.example.ClientNest.repository.CustomerRepository;
import com.example.ClientNest.repository.EmployeeRepository;
import com.example.ClientNest.repository.InvoiceRepository;
import com.example.ClientNest.repository.OpportunityRepository;
import com.example.ClientNest.repository.QuotationRepository;
import com.example.ClientNest.service.EmailService;
import com.example.ClientNest.service.InvoiceService;

@Service
public class InvoiceServiceImpl implements InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private QuotationRepository quotationRepository;

    @Autowired
    private OpportunityRepository opportunityRepository;
    
    @Autowired
    private EmailService emailService;

    @Override
    public List<InvoiceDTO> getAllInvoices() {
        System.out.println("\n\nInvoice: ");
        return invoiceRepository.findAllInvoices();
    }
    
    @Override
    public List<InvoiceDTO> getInvoicesByCustomerId(Long customerId) {
        var i = invoiceRepository.findByCustomerId(customerId);
        System.out.println("\n\nInvoice: " + i);
        
        return i;
    }
    
    @Override
    public InvoiceDTO getInvoiceById(Long id) {
        var i = invoiceRepository.findInvoiceById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));

        System.out.println("\n\nInvoice: " + i + "\n\n");
        return i;
    }

    @Override
    @Transactional
    public void deleteInvoice(Long id) {
        invoiceRepository.deleteById(id);
    }

    @Override
    public String generateInvoiceNumber() {
        LocalDate today = LocalDate.now();
        String datePart = today.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomNum;
        String invoiceNumber;
        
        // Keep generating until we find a unique invoice number
        do {
            randomNum = ThreadLocalRandom.current().nextInt(1000, 10000);
            invoiceNumber = "INV-" + datePart + "-" + randomNum;
        } while (invoiceRepository.findByInvoiceNumber(invoiceNumber).isPresent());
        
        return invoiceNumber;
    }
    
    @Override
    @Transactional
    public InvoiceDTO createInvoice(Long customerId, InvoiceDTO invoiceDTO) {
        // Find the customer
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));

        // Find the employee (if needed)
        Optional<Employee> employee = employeeRepository.findByName(invoiceDTO.getEmployeeName());
        
        // Create the invoice entity
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(invoiceDTO.getInvoiceNumber());
        invoice.setCustomer(customer);

        invoice.setEmployee(employee.orElse(null)); // Set employee if present

        invoice.setInvoiceDate(invoiceDTO.getInvoiceDate());
        invoice.setDueDate(invoiceDTO.getDueDate());
        invoice.setTerms(invoiceDTO.getTerms());
        invoice.setSubtotal(invoiceDTO.getSubtotal());
        invoice.setDiscount(invoiceDTO.getDiscount());
        invoice.setTaxRate(invoiceDTO.getTaxRate());
        invoice.setTaxAmount(invoiceDTO.getTaxAmount());
        invoice.setTotal(invoiceDTO.getTotal());
        invoice.setStatus(invoiceDTO.getStatus());
        
        // If there's a quotation ID, link this invoice to that quotation
        if (invoiceDTO.getQuotationId() != null) {
            Quotation quotation = quotationRepository.findById(invoiceDTO.getQuotationId())
                .orElseThrow(() -> new RuntimeException("Quotation not found with id: " + invoiceDTO.getQuotationId()));
            invoice.setQuotation(quotation);

            quotation.setStage(Quotation.Stage.CONVERTED);

            quotationRepository.save(quotation);
        }
        
        // Save the invoice
        Invoice savedInvoice = invoiceRepository.save(invoice);
        
        // Convert back to DTO and return
        return new InvoiceDTO(savedInvoice);
    }

    @Override
    @Transactional
    public InvoiceDTO generateInvoiceFromQuotation(Long quotationId) {
        // Find the quotation
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new RuntimeException("Quotation not found with id: " + quotationId));
        
        // Check if quotation is in ACCEPTED stage
        if (quotation.getStage() != Quotation.Stage.ACCEPTED) {
            throw new IllegalStateException("Cannot generate invoice from a quotation that has not been accepted");
        }
        
        // Get the opportunity and customer
        var opportunity = opportunityRepository.findByQuotation(quotation)
                .orElseThrow(() -> new RuntimeException("No opportunity associated with this quotation"));

        quotation.setStage(Quotation.Stage.CONVERTED);

        Customer customer = opportunity.getCustomer();
        if (customer == null) {
            throw new RuntimeException("No customer associated with this quotation");
        }
        customer.setType(Customer.CustomerType.EXISTING);

        Employee employee = opportunity.getEmployee();

        // Create a new invoice
        Invoice invoice = new Invoice();
        invoice.setTitle(opportunity.getLead().getCustomer().getName()); // Getting the name from the customer object
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setCustomer(customer);
        invoice.setEmployee(employee); // Set employee if present
        invoice.setInvoiceDate(LocalDate.now());
        invoice.setDueDate(LocalDate.now().plus(30, ChronoUnit.DAYS)); // Due in 30 days
        invoice.setTerms("Net 30");
        invoice.setOpportunity(opportunity);
        invoice.setQuotation(quotation);
        
        // Calculate financial details directly from the quotation
        double subtotal = calculateSubtotalFromQuotation(quotation);
        double discount = 0.0; // No additional discount by default
        double taxRate = 8.5; // Default tax rate
        double taxableAmount = subtotal - discount;
        double taxAmount = taxableAmount * (taxRate / 100);
        double total = taxableAmount + taxAmount;
        
        invoice.setSubtotal(subtotal);
        invoice.setDiscount(discount);
        invoice.setTaxRate(taxRate);
        invoice.setTaxAmount(taxAmount);
        invoice.setTotal(total);
        invoice.setStatus("PENDING");

        System.out.println("Invoice: " + invoice.getId());
        
        // Save the invoice - this keeps the relationship to the quotation
        Invoice savedInvoice = invoiceRepository.save(invoice);
        
        // Generate the DTO to return
        InvoiceDTO invoiceDTO = new InvoiceDTO(quotation, savedInvoice);
        
        // Send email notification to the customer
        try {
            if (customer.getEmail() != null) {
                emailService.sendInvoiceNotification(
                    customer.getEmail(),
                    customer.getName(),
                    invoiceDTO
                );
            }
        } catch (Exception e) {
            // Log the error but don't disrupt the main flow
            System.err.println("Failed to send invoice email notification: " + e.getMessage());
            e.printStackTrace();
        }
        
        return invoiceDTO;
    }
    
    /**
     * Calculates the subtotal from a quotation's items
     */
    private double calculateSubtotalFromQuotation(Quotation quotation) {
        if (quotation.getItems() == null || quotation.getItems().isEmpty()) {
            return 0.0;
        }
        
        double subtotal = 0.0;
        for (var item : quotation.getItems()) {
            double itemDiscount = item.getDiscount() != null ? item.getDiscount() / 100.0 : 0.0;
            double itemTotal = item.getQuantity() * item.getProduct().getPrice() * (1 - itemDiscount);
            subtotal += itemTotal;
        }
        
        return subtotal;
    }

    @Override
    public List<InvoiceDTO> getInvoicesByEmail(String email) {
        return invoiceRepository.findByCustomerEmail(email);
    }
}