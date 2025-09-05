import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  ScatterController,
  BubbleController
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import DashboardService, { DashboardData } from '../../services/DashboardService';
import InvoiceService from '../../services/InvoiceService';
import LeadService from '../../services/LeadService';
import ProductService from '../../services/ProductService';
import EmployeeService, { EmployeeSalesPerformance } from '../../services/EmployeeService';

// Register Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  ScatterController,
  BubbleController
);

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalLeads: 0,
    totalOpportunities: 0,
    totalCustomers: 0,
    totalSales: 0,
    averageOrderValue: 0,
    leadsBySource: [],
    productsByCategory: [],
    opportunitiesByStage: [],
    customerGrowth: 0,
    leadGrowth: 0,
    salesGrowth: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [employeeSales, setEmployeeSales] = useState<EmployeeSalesPerformance[]>([]);
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        let totalSales = 0;
        let averageOrderValue = 0;
        try {
          const invoices = await InvoiceService.getAllInvoices();
          
          totalSales = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
          
          // Calculate average order value
          if (invoices.length > 0) {
            averageOrderValue = totalSales / invoices.length;
          }
        } catch (err) {
          console.error('Error fetching invoices for calculations:', err);
        }
        
        const data = await DashboardService.getDashboardData();
        
        let leadsBySource: { source: string; value: number }[] = [];
        try {
          leadsBySource = await LeadService.getLeadsBySource();
        } catch (err) {
          console.error('Error fetching leads by source from LeadService:', err);
          
          if (!data.leadsBySource || data.leadsBySource.length === 0) {
            try {
              leadsBySource = await DashboardService.getLeadsBySource();
            } catch (dashboardErr) {
              console.error('Error fetching leads by source from DashboardService:', dashboardErr);
            }
          } else {
            leadsBySource = data.leadsBySource;
          }
        }
        
        let productsByCategory: { category: string; value: number }[] = [];
        try {
          productsByCategory = await ProductService.getProductCategoryCounts();
        } catch (err) {
          console.error('Error fetching products by category from ProductService:', err);
          
          if (!data.productsByCategory || data.productsByCategory.length === 0) {
            try {
              productsByCategory = await DashboardService.getProductsByCategory();
            } catch (dashboardErr) {
              console.error('Error fetching products by category from DashboardService:', dashboardErr);
            }
          } else {
            productsByCategory = data.productsByCategory;
          }
        }  

        try {
          console.log('Fetching employee sales performance data...');
          const employeeSalesData = await EmployeeService.getEmployeeSalesPerformance();
          setEmployeeSales(employeeSalesData);
        } catch (err) {
          console.error('Error fetching employee sales performance data:', err);
        }
        
        setDashboardData({
          ...data,
          totalSales: totalSales || data.totalSales,
          averageOrderValue: averageOrderValue || data.averageOrderValue,
          leadsBySource: leadsBySource.length > 0 ? leadsBySource : data.leadsBySource,
          productsByCategory: productsByCategory.length > 0 ? productsByCategory : data.productsByCategory
        });
        
        setError(null);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const leadsChartData = {
    labels: dashboardData.leadsBySource.map(item => item.source),
    datasets: [
      {
        label: 'Leads by Source',
        data: dashboardData.leadsBySource.map(item => item.value),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(201, 203, 207, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(201, 203, 207, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const productsChartData = {
    labels: dashboardData.productsByCategory.map(item => item.category),
    datasets: [
      {
        label: 'Products by Category',
        data: dashboardData.productsByCategory.map(item => item.value),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(201, 203, 207, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(201, 203, 207, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Loading spinner for the entire dashboard
  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading dashboard data...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded" style={{ 
        backgroundColor: '#1a2236', 
        color: 'white',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <h2 className="m-0">Dashboard</h2>
        <button 
          className="btn btn-light"
          onClick={() => window.location.reload()}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Refresh Data
        </button>
      </div>
      
      {error && (
        <div className="alert alert-warning mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}
      
      {/* Key Metrics */}
      <Row className="mb-3">
        <Col lg={4} md={6} className="mb-3">
          <Card className="shadow-sm border-0" style={{ backgroundColor: '#e9f7fe', borderLeft: '4px solid #149AD5' }}>
            <Card.Body className="d-flex flex-column p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="text-primary mb-0 fw-bold">Total Customers</h6>
                <div className="icon text-white bg-primary p-2 rounded">
                  <i className="bi bi-people-fill"></i>
                </div>
              </div>
              <h3 className="fs-3 mb-2">{dashboardData.totalCustomers}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={6} className="mb-3">
          <Card className="shadow-sm border-0" style={{ backgroundColor: '#fff8e5', borderLeft: '4px solid #FFC107' }}>
            <Card.Body className="d-flex flex-column p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="text-warning mb-0 fw-bold">Total Leads</h6>
                <div className="icon text-white bg-warning p-2 rounded">
                  <i className="bi bi-person-plus-fill"></i>
                </div>
              </div>
              <h3 className="fs-3 mb-2">{dashboardData.totalLeads}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={6} className="mb-3">
          <Card className="shadow-sm border-0" style={{ backgroundColor: '#ebfaf5', borderLeft: '4px solid #28C76F' }}>
            <Card.Body className="d-flex flex-column p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="text-success mb-0 fw-bold">Total Sales</h6>
                <div className="icon text-white bg-success p-2 rounded">
                  <i className="bi bi-currency-dollar"></i>
                </div>
              </div>
              <h3 className="fs-3 mb-2">{formatCurrency(dashboardData.totalSales)}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Secondary Metrics */}
      <Row className="mb-3">
        <Col lg={6} md={6} className="mb-3">
          <Card className="shadow-sm border-0" style={{ backgroundColor: '#feebf1', borderLeft: '4px solid #EA5455' }}>
            <Card.Body className="d-flex flex-column p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="text-danger mb-0 fw-bold">Total Opportunities</h6>
                <div className="icon text-white bg-danger p-2 rounded">
                  <i className="bi bi-graph-up"></i>
                </div>
              </div>
              <h3 className="fs-3">{dashboardData.totalOpportunities}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} md={6} className="mb-3">
          <Card className="shadow-sm border-0" style={{ backgroundColor: '#f0f0f0', borderLeft: '4px solid #6C757D' }}>
            <Card.Body className="d-flex flex-column p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="text-secondary mb-0 fw-bold">Average Order Value</h6>
                <div className="icon text-white bg-secondary p-2 rounded">
                  <i className="bi bi-basket"></i>
                </div>
              </div>
              <h3 className="fs-3">{formatCurrency(dashboardData.averageOrderValue)}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row>
        {dashboardData.leadsBySource.length > 0 ? (
          <Col lg={6} md={12} className="mb-3">
            <Card className="shadow-sm border-0">
              <Card.Body className="p-3">
                <h5 className="card-title mb-3">Leads by Source</h5>
                <div style={{ height: '280px', position: 'relative' }}>
                  <Doughnut data={leadsChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { 
                        legend: { 
                          position: 'bottom' as const,
                          labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: { size: 11 }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          <Col lg={6} md={12} className="mb-3">
            <Card className="shadow-sm border-0">
              <Card.Body className="p-3 text-center">
                <h5 className="card-title mb-3">Leads by Source</h5>
                <p className="text-muted">No lead source data available</p>
              </Card.Body>
            </Card>
          </Col>
        )}

        {dashboardData.productsByCategory.length > 0 ? (
          <Col lg={6} md={12} className="mb-3">
            <Card className="shadow-sm border-0">
              <Card.Body className="p-3">
                <h5 className="card-title mb-3">Products by Category</h5>
                <div style={{ height: '280px', position: 'relative' }}>
                  <Bar data={productsChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { 
                          position: 'top' as const,
                          labels: {
                            usePointStyle: true,
                            font: { size: 11 }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { font: { size: 10 } }
                        },
                        x: {
                          ticks: { font: { size: 10 } }
                        }
                      }
                    }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          <Col lg={6} md={12} className="mb-3">
            <Card className="shadow-sm border-0">
              <Card.Body className="p-3 text-center">
                <h5 className="card-title mb-3">Products by Category</h5>
                <p className="text-muted">No product category data available</p>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      <Row className="mb-4">
        {employeeSales.length > 0 ? (
          <Col lg={6} md={12} className="mb-3">
            <Card className="shadow-sm border-0">
              <Card.Body className="p-3">
                <h5 className="card-title mb-3">Sales by Employee</h5>
                <div style={{ height: '280px', position: 'relative' }}>
                  <Bar 
                    data={{
                      labels: employeeSales.map(emp => emp.name),
                      datasets: [{
                        label: 'Sales Amount',
                        data: employeeSales.map(emp => emp.salesAmount),
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderColor: 'rgb(54, 162, 235)',
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      indexAxis: 'y' as const,
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { 
                          display: false
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              let label = context.dataset.label || '';
                              if (label) {
                                label += ': ';
                              }
                              if (context.parsed.x !== null) {
                                label += formatCurrency(context.parsed.x);
                              }
                              return label;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          ticks: { font: { size: 11 } }
                        },
                        x: {
                          beginAtZero: true,
                          ticks: { 
                            font: { size: 10 },
                            callback: function(value) {
                              return formatCurrency(value as number);
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          <Col lg={6} md={12} className="mb-3">
            <Card className="shadow-sm border-0">
              <Card.Body className="p-3 text-center">
                <h5 className="card-title mb-3">Sales by Employee</h5>
                <p className="text-muted">No employee sales data available</p>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default Dashboard;