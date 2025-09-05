package com.example.ClientNest.service.impl;

import com.example.ClientNest.dto.DashboardDTO;
import com.example.ClientNest.dto.GrowthDTO;
import com.example.ClientNest.repository.CategoryRepository;
import com.example.ClientNest.repository.EmployeeRepository;
import com.example.ClientNest.service.DashboardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class DashboardServiceImpl implements DashboardService {

    private static final Logger logger = LoggerFactory.getLogger(DashboardServiceImpl.class);

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public DashboardServiceImpl(
            JdbcTemplate jdbcTemplate,
            CategoryRepository categoryRepository,
            EmployeeRepository employeeRepository) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public DashboardDTO getDashboardData() {
        // Create DTO builder
        DashboardDTO.DashboardDTOBuilder builder = DashboardDTO.builder();

        try {
            // Get counts
            long totalLeads = countLeads();
            long totalOpportunities = countOpportunities();
            long totalCustomers = countCustomers();
            BigDecimal totalSales = calculateTotalSales();
            BigDecimal averageOrderValue = calculateAverageOrderValue();
    
            // Get growth percentages
            int customerGrowth = calculateCustomerGrowth();
            int leadGrowth = calculateLeadGrowth();
            int salesGrowth = calculateSalesGrowth();
    
            // Get chart data
            List<DashboardDTO.ChartDataDTO> leadsBySource = getLeadsBySource();
            List<DashboardDTO.ChartDataDTO> productsByCategory = getProductsByCategory();
            List<DashboardDTO.ChartDataDTO> opportunitiesByStage = getOpportunitiesByStage();
    
            // Log results for debugging
            logger.info("Dashboard data retrieved - Leads: {}, Opportunities: {}, Customers: {}, Sales: {}", 
                totalLeads, totalOpportunities, totalCustomers, totalSales);
            
            // Build and return the DTO
            return builder
                    .totalLeads(totalLeads)
                    .totalOpportunities(totalOpportunities)
                    .totalCustomers(totalCustomers)
                    .totalSales(totalSales)
                    .averageOrderValue(averageOrderValue)
                    .customerGrowth(customerGrowth)
                    .leadGrowth(leadGrowth)
                    .salesGrowth(salesGrowth)
                    .leadsBySource(leadsBySource)
                    .productsByCategory(productsByCategory)
                    .opportunitiesByStage(opportunitiesByStage)
                    .build();
        } catch (Exception e) {
            logger.error("Error retrieving dashboard data", e);
            throw e;
        }
    }

    @Override
    public GrowthDTO getGrowthData() {
        return GrowthDTO.builder()
                .customers(calculateCustomerGrowth())
                .leads(calculateLeadGrowth())
                .sales(calculateSalesGrowth())
                .build();
    }

    @Override
    public List<DashboardDTO.ChartDataDTO> getLeadsBySource() {
        try {
            List<DashboardDTO.ChartDataDTO> result = new ArrayList<>();
            
            List<String> tables = listTables();
            logger.debug("Tables in database: {}", tables);
            
            String tableName = "lead";
            if (!tables.contains("lead") && tables.contains("leads")) {
                tableName = "leads";
            }
            
            // Check columns
            List<String> columns = listColumns(tableName);
            logger.debug("Columns in {} table: {}", tableName, columns);
            
            if (!columns.contains("source")) {
                logger.error("Source column not found in {} table", tableName);
                return new ArrayList<>();
            }
            
            String sql = String.format("SELECT source, COUNT(*) as count FROM %s GROUP BY source ORDER BY count DESC LIMIT 5", tableName);
            logger.debug("Executing SQL for leads by source: {}", sql);
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
            
            logger.debug("Leads by source results: {}", rows);

            for (Map<String, Object> row : rows) {
                result.add(DashboardDTO.ChartDataDTO.builder()
                        .source((String) row.get("source"))
                        .value(((Number) row.get("count")).longValue())
                        .build());
            }
            
            return result;
        } catch (Exception e) {
            logger.error("Error getting leads by source", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<DashboardDTO.ChartDataDTO> getProductsByCategory() {
        try {
            List<DashboardDTO.ChartDataDTO> result = new ArrayList<>();
            
            // First check if the tables exist
            List<String> tables = listTables();
            logger.debug("Tables in database for product category check: {}", tables);
            
            if (!tables.contains("product") || !tables.contains("category")) {
                logger.error("Required tables (product, category) not found");
                return new ArrayList<>();
            }
            
            // Check if the columns exist
            List<String> productColumns = listColumns("product");
            List<String> categoryColumns = listColumns("category");
            
            logger.debug("Columns in product table: {}", productColumns);
            logger.debug("Columns in category table: {}", categoryColumns);
            
            if (!productColumns.contains("category_id") || !categoryColumns.contains("name")) {
                logger.error("Required columns not found in product or category tables");
                return new ArrayList<>();
            }
            
            String sql = "SELECT c.name as category, COUNT(p.id) as count " +
                    "FROM product p JOIN category c ON p.category_id = c.id " +
                    "GROUP BY c.name ORDER BY count DESC LIMIT 5";
            
            logger.debug("Executing SQL for products by category: {}", sql);
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
            
            logger.debug("Products by category results: {}", rows);

            for (Map<String, Object> row : rows) {
                result.add(DashboardDTO.ChartDataDTO.builder()
                        .category((String) row.get("category"))
                        .value(((Number) row.get("count")).longValue())
                        .build());
            }

            return result;
        } catch (Exception e) {
            logger.error("Error getting products by category", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<DashboardDTO.ChartDataDTO> getOpportunitiesByStage() {
        try {
            List<DashboardDTO.ChartDataDTO> result = new ArrayList<>();
            
            // Check if the opportunity table exists
            List<String> tables = listTables();
            logger.debug("Tables in database for opportunity stage check: {}", tables);
            
            String tableName = "opportunity";
            if (!tables.contains("opportunity") && tables.contains("opportunities")) {
                tableName = "opportunities";
            }
            
            // Check columns
            List<String> columns = listColumns(tableName);
            logger.debug("Columns in {} table: {}", tableName, columns);
            
            if (!columns.contains("stage")) {
                logger.error("Stage column not found in {} table", tableName);
                return new ArrayList<>();
            }
            
            String sql = String.format("SELECT stage, COUNT(*) as count FROM %s GROUP BY stage ORDER BY count DESC", tableName);
            logger.debug("Executing SQL for opportunities by stage: {}", sql);
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
            
            logger.debug("Opportunities by stage results: {}", rows);

            for (Map<String, Object> row : rows) {
                result.add(DashboardDTO.ChartDataDTO.builder()
                        .stage((String) row.get("stage"))
                        .value(((Number) row.get("count")).longValue())
                        .build());
            }

            return result;
        } catch (Exception e) {
            logger.error("Error getting opportunities by stage", e);
            return new ArrayList<>();
        }
    }

    // Helper methods to fetch data from repositories

    private long countLeads() {
        try {
            String sql = "SELECT COUNT(*) FROM leads WHERE status = 'ACTIVE'";
            logger.debug("Executing SQL: {}", sql);
            Long count = jdbcTemplate.queryForObject(sql, Long.class);
            logger.debug("Lead count result: {}", count);
            return count != null ? count : 0;
        } catch (DataAccessException e) {
            logger.error("Error counting leads", e);
            
            // Try alternative table name
            try {
                String sql = "SELECT COUNT(*) FROM lead";
                logger.debug("Trying alternative SQL: {}", sql);
                Long count = jdbcTemplate.queryForObject(sql, Long.class);
                logger.debug("Lead count result with alternative query: {}", count);
                return count != null ? count : 0;
            } catch (DataAccessException ex) {
                logger.error("Error counting leads with alternative query", ex);
                return 0;
            }
        }
    }

    private long countOpportunities() {
        try {
            String sql = "SELECT COUNT(*) FROM opportunities";
            logger.debug("Executing SQL: {}", sql);
            Long count = jdbcTemplate.queryForObject(sql, Long.class);
            logger.debug("Opportunities count result: {}", count);
            return count != null ? count : 0;
        } catch (DataAccessException e) {
            logger.error("Error counting opportunities", e);
            
            // Try alternative table name
            try {
                String sql = "SELECT COUNT(*) FROM opportunity";
                logger.debug("Trying alternative SQL: {}", sql);
                Long count = jdbcTemplate.queryForObject(sql, Long.class);
                logger.debug("Opportunities count result with alternative query: {}", count);
                return count != null ? count : 0;
            } catch (DataAccessException ex) {
                logger.error("Error counting opportunities with alternative query", ex);
                return 0;
            }
        }
    }

    private long countCustomers() {
        try {
            String sql = "SELECT COUNT(*) FROM customers";
            logger.debug("Executing SQL: {}", sql);
            Long count = jdbcTemplate.queryForObject(sql, Long.class);
            logger.debug("Customers count result: {}", count);
            return count != null ? count : 0;
        } catch (DataAccessException e) {
            logger.error("Error counting customers", e);
            
            // Try alternative table name
            try {
                String sql = "SELECT COUNT(*) FROM customer";
                logger.debug("Trying alternative SQL: {}", sql);
                Long count = jdbcTemplate.queryForObject(sql, Long.class);
                logger.debug("Customers count result with alternative query: {}", count);
                return count != null ? count : 0;
            } catch (DataAccessException ex) {
                logger.error("Error counting customers with alternative query", ex);
                return 0;
            }
        }
    }

    private BigDecimal calculateTotalSales() {
        try {
            String sql = "SELECT COALESCE(SUM(total), 0) FROM invoices WHERE status = 'PAID'";
            logger.debug("Executing SQL: {}", sql);
            BigDecimal total = jdbcTemplate.queryForObject(sql, BigDecimal.class);
            logger.debug("Total sales result: {}", total);
            return total != null ? total : BigDecimal.ZERO;
        } catch (DataAccessException e) {
            logger.error("Error calculating total sales", e);
            
            // Try alternative table name
            try {
                String sql = "SELECT COALESCE(SUM(total), 0) FROM invoice WHERE status = 'PAID'";
                logger.debug("Trying alternative SQL: {}", sql);
                BigDecimal total = jdbcTemplate.queryForObject(sql, BigDecimal.class);
                logger.debug("Total sales result with alternative query: {}", total);
                return total != null ? total : BigDecimal.ZERO;
            } catch (DataAccessException ex) {
                logger.error("Error calculating total sales with alternative query", ex);
                return BigDecimal.ZERO;
            }
        }
    }

    private BigDecimal calculateAverageOrderValue() {
        try {
            String sql = "SELECT COALESCE(AVG(total), 0) FROM invoices WHERE status = 'PAID'";
            logger.debug("Executing SQL: {}", sql);
            BigDecimal average = jdbcTemplate.queryForObject(sql, BigDecimal.class);
            logger.debug("Average order value result: {}", average);
            return average != null ? average : BigDecimal.ZERO;
        } catch (DataAccessException e) {
            logger.error("Error calculating average order value", e);
            
            // Try alternative table name
            try {
                String sql = "SELECT COALESCE(AVG(total), 0) FROM invoice WHERE status = 'PAID'";
                logger.debug("Trying alternative SQL: {}", sql);
                BigDecimal average = jdbcTemplate.queryForObject(sql, BigDecimal.class);
                logger.debug("Average order value result with alternative query: {}", average);
                return average != null ? average : BigDecimal.ZERO;
            } catch (DataAccessException ex) {
                logger.error("Error calculating average order value with alternative query", ex);
                return BigDecimal.ZERO;
            }
        }
    }

    private int calculateCustomerGrowth() {
        try {
            // List tables to check column names
            List<String> tables = listTables();
            logger.debug("Tables in database: {}", tables);
            
            // Check if created_at column exists in customer table
            List<String> columns = listColumns("customer");
            logger.debug("Columns in customer table: {}", columns);
            
            String createdAtColumn = "created_at";
            if (columns.contains("creation_date")) {
                createdAtColumn = "creation_date";
            } else if (columns.contains("created_date")) {
                createdAtColumn = "created_date";
            }
            
            // Get customer count this month
            String currentSql = String.format(
                "SELECT COUNT(*) FROM customer WHERE YEAR(%s) = YEAR(CURRENT_DATE) AND MONTH(%s) = MONTH(CURRENT_DATE)",
                createdAtColumn, createdAtColumn
            );
            logger.debug("Executing SQL for current month customers: {}", currentSql);
            Long currentCount = jdbcTemplate.queryForObject(currentSql, Long.class);
            
            // Get customer count last month
            String previousSql = String.format(
                "SELECT COUNT(*) FROM customer WHERE YEAR(%s) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)) AND MONTH(%s) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))",
                createdAtColumn, createdAtColumn
            );
            logger.debug("Executing SQL for previous month customers: {}", previousSql);
            Long previousCount = jdbcTemplate.queryForObject(previousSql, Long.class);

            logger.debug("Current month customer count: {}, Previous month customer count: {}", currentCount, previousCount);
            
            if (currentCount == null || previousCount == null || previousCount == 0) {
                return 0;
            }

            // Calculate growth percentage
            return (int) (((double) (currentCount - previousCount) / previousCount) * 100);
        } catch (Exception e) {
            logger.error("Error calculating customer growth", e);
            return 0;
        }
    }

    private int calculateLeadGrowth() {
        try {
            // Check if created_at column exists in lead table
            List<String> columns = listColumns("lead");
            logger.debug("Columns in lead table: {}", columns);
            
            String createdAtColumn = "created_at";
            if (columns.contains("creation_date")) {
                createdAtColumn = "creation_date";
            } else if (columns.contains("created_date")) {
                createdAtColumn = "created_date";
            }
            
            // Get lead count this month
            String currentSql = String.format(
                "SELECT COUNT(*) FROM lead WHERE YEAR(%s) = YEAR(CURRENT_DATE) AND MONTH(%s) = MONTH(CURRENT_DATE)",
                createdAtColumn, createdAtColumn
            );
            logger.debug("Executing SQL for current month leads: {}", currentSql);
            Long currentCount = jdbcTemplate.queryForObject(currentSql, Long.class);
            
            // Get lead count last month
            String previousSql = String.format(
                "SELECT COUNT(*) FROM lead WHERE YEAR(%s) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)) AND MONTH(%s) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))",
                createdAtColumn, createdAtColumn
            );
            logger.debug("Executing SQL for previous month leads: {}", previousSql);
            Long previousCount = jdbcTemplate.queryForObject(previousSql, Long.class);

            logger.debug("Current month lead count: {}, Previous month lead count: {}", currentCount, previousCount);

            if (currentCount == null || previousCount == null || previousCount == 0) {
                return 0;
            }

            // Calculate growth percentage
            return (int) (((double) (currentCount - previousCount) / previousCount) * 100);
        } catch (Exception e) {
            logger.error("Error calculating lead growth", e);
            return 0;
        }
    }

    private int calculateSalesGrowth() {
        try {
            // Check if invoice_date column exists in invoice table
            List<String> columns = listColumns("invoice");
            logger.debug("Columns in invoice table: {}", columns);
            
            String invoiceDateColumn = "invoice_date";
            if (columns.contains("date")) {
                invoiceDateColumn = "date";
            } else if (columns.contains("created_at")) {
                invoiceDateColumn = "created_at";
            }
            
            // Get sales total this month
            String currentSql = String.format(
                "SELECT COALESCE(SUM(total), 0) FROM invoice WHERE status = 'PAID' AND YEAR(%s) = YEAR(CURRENT_DATE) AND MONTH(%s) = MONTH(CURRENT_DATE)",
                invoiceDateColumn, invoiceDateColumn
            );
            logger.debug("Executing SQL for current month sales: {}", currentSql);
            BigDecimal currentTotal = jdbcTemplate.queryForObject(currentSql, BigDecimal.class);
            
            // Get sales total last month
            String previousSql = String.format(
                "SELECT COALESCE(SUM(total), 0) FROM invoice WHERE status = 'PAID' AND YEAR(%s) = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)) AND MONTH(%s) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))",
                invoiceDateColumn, invoiceDateColumn
            );
            logger.debug("Executing SQL for previous month sales: {}", previousSql);
            BigDecimal previousTotal = jdbcTemplate.queryForObject(previousSql, BigDecimal.class);

            logger.debug("Current month sales: {}, Previous month sales: {}", currentTotal, previousTotal);

            if (currentTotal == null || previousTotal == null || previousTotal.compareTo(BigDecimal.ZERO) == 0) {
                return 0;
            }

            // Calculate growth percentage
            return currentTotal.subtract(previousTotal)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(previousTotal, 0, RoundingMode.HALF_UP)
                    .intValue();
        } catch (Exception e) {
            logger.error("Error calculating sales growth", e);
            return 0;
        }
    }

    // Helper methods to inspect database structure
    private List<String> listTables() {
        try {
            return jdbcTemplate.queryForList("SHOW TABLES", String.class);
        } catch (Exception e) {
            logger.error("Error listing tables", e);
            return new ArrayList<>();
        }
    }
    
    private List<String> listColumns(String tableName) {
        try {
            List<String> columns = new ArrayList<>();
            List<Map<String, Object>> rows = jdbcTemplate.queryForList("DESCRIBE " + tableName);
            for (Map<String, Object> row : rows) {
                columns.add((String) row.get("Field"));
            }
            return columns;
        } catch (Exception e) {
            logger.error("Error listing columns for table: " + tableName, e);
            return new ArrayList<>();
        }
    }
}