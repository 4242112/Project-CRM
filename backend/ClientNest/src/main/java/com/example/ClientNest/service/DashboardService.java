package com.example.ClientNest.service;

import com.example.ClientNest.dto.DashboardDTO;
import com.example.ClientNest.dto.GrowthDTO;

import java.util.List;

public interface DashboardService {
    DashboardDTO getDashboardData();
    GrowthDTO getGrowthData();
    List<DashboardDTO.ChartDataDTO> getLeadsBySource();
    List<DashboardDTO.ChartDataDTO> getProductsByCategory();
    List<DashboardDTO.ChartDataDTO> getOpportunitiesByStage();
}