package com.example.ClientNest.controller;

import com.example.ClientNest.dto.DashboardDTO;
import com.example.ClientNest.dto.GrowthDTO;
import com.example.ClientNest.service.DashboardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class DashboardController {

    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);
    private final DashboardService dashboardService;

    @Autowired
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboardData() {
        logger.info("API call received: Get dashboard data");
        DashboardDTO data = dashboardService.getDashboardData();
        logger.info("Returning dashboard data: {}", data);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/growth")
    public ResponseEntity<GrowthDTO> getGrowthData() {
        logger.info("API call received: Get growth data");
        GrowthDTO data = dashboardService.getGrowthData();
        logger.info("Returning growth data: {}", data);
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/leads-by-source")
    public ResponseEntity<List<DashboardDTO.ChartDataDTO>> getLeadsBySource() {
        logger.info("API call received: Get leads by source");
        List<DashboardDTO.ChartDataDTO> data = dashboardService.getLeadsBySource();
        logger.info("Returning leads by source data: {}", data);
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/products-by-category")
    public ResponseEntity<List<DashboardDTO.ChartDataDTO>> getProductsByCategory() {
        logger.info("API call received: Get products by category");
        List<DashboardDTO.ChartDataDTO> data = dashboardService.getProductsByCategory();
        logger.info("Returning products by category data: {}", data);
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/opportunities-by-stage")
    public ResponseEntity<List<DashboardDTO.ChartDataDTO>> getOpportunitiesByStage() {
        logger.info("API call received: Get opportunities by stage");
        List<DashboardDTO.ChartDataDTO> data = dashboardService.getOpportunitiesByStage();
        logger.info("Returning opportunities by stage data: {}", data);
        return ResponseEntity.ok(data);
    }
 
}