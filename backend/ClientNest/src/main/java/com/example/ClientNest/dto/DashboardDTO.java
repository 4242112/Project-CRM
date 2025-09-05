package com.example.ClientNest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private long totalLeads;
    private long totalOpportunities;
    private long totalCustomers;
    private BigDecimal totalSales;
    private BigDecimal averageOrderValue;
    private List<ChartDataDTO> leadsBySource;
    private List<ChartDataDTO> productsByCategory;
    private List<ChartDataDTO> opportunitiesByStage;
    private int customerGrowth;
    private int leadGrowth;
    private int salesGrowth;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChartDataDTO {
        private String source;
        private String category;
        private String stage;
        private long value;
    }
}