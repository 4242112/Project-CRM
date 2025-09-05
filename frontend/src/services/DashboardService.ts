/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

export interface DashboardData {
  totalLeads: number;
  totalOpportunities: number;
  totalCustomers: number;
  totalSales: number;
  averageOrderValue: number;
  leadsBySource: { source: string; value: number }[];
  productsByCategory: { category: string; value: number }[];
  opportunitiesByStage: { stage: string; value: number }[];
  customerGrowth: number;
  leadGrowth: number;
  salesGrowth: number;
}

const API_URL = 'http://localhost:8080/api/dashboard';

// Configure axios with defaults
axios.defaults.timeout = 10000; // 10 seconds timeout

const DashboardService = {
  // Check if the API is available
  checkAPIHealth: async (): Promise<boolean> => {
    try {
      const response = await axios.get(`${API_URL}/health`);
      console.log('API health check response:', response.data);
      return response.status === 200;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  },

  getDashboardData: async (): Promise<DashboardData> => {
    try {
      console.log('Fetching dashboard data from:', API_URL);
      const response = await axios.get(API_URL);
      console.log('Dashboard data response:', response.data);
      
      // Validate that we received the expected properties
      if (!response.data || typeof response.data !== 'object') {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response format');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Try one more time with a slight delay
      try {
        console.log('Retrying dashboard data fetch...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const retryResponse = await axios.get(API_URL);
        console.log('Retry dashboard data response:', retryResponse.data);
        return retryResponse.data;
      } catch (retryError) {
        console.error('Retry failed:', retryError);
        
        // Return fallback data if API call fails
        return {
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
        };
      }
    }
  },
  
  // Individual data fetching methods
  getLeadsCount: async (): Promise<number> => {
    try {
      const response = await axios.get('http://localhost:8080/api/leads/count');
      console.log('Leads count response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching leads count:', error);
      return 0;
    }
  },
  
  getOpportunitiesCount: async (): Promise<number> => {
    try {
      const response = await axios.get('http://localhost:8080/api/opportunities/count');
      console.log('Opportunities count response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching opportunities count:', error);
      return 0;
    }
  },
  
  getCustomersCount: async (): Promise<number> => {
    try {
      const response = await axios.get('http://localhost:8080/api/customers/count');
      console.log('Customers count response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching customers count:', error);
      return 0;
    }
  },
  
  getTotalSales: async (): Promise<number> => {
    try {
      const response = await axios.get('http://localhost:8080/api/invoices/total');
      console.log('Total sales response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching total sales:', error);
      return 0;
    }
  },
  
  getAverageOrderValue: async (): Promise<number> => {
    try {
      const response = await axios.get('http://localhost:8080/api/invoices/average');
      console.log('Average order value response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching average order value:', error);
      return 0;
    }
  },
  
  getLeadsBySource: async (): Promise<{ source: string; value: number }[]> => {
    try {
      const response = await axios.get(`${API_URL}/leads-by-source`);
      console.log('Leads by source response:', response.data);
      return response.data.map((item: any) => ({
        source: item.source,
        value: item.value
      }));
    } catch (error) {
      console.error('Error fetching leads by source:', error);
      return [];
    }
  },
  
  getProductsByCategory: async (): Promise<{ category: string; value: number }[]> => {
    try {
      const response = await axios.get(`${API_URL}/products-by-category`);
      console.log('Products by category response:', response.data);
      return response.data.map((item: any) => ({
        category: item.category,
        value: item.value
      }));
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  },
  
  getOpportunitiesByStage: async (): Promise<{ stage: string; value: number }[]> => {
    try {
      const response = await axios.get(`${API_URL}/opportunities-by-stage`);
      console.log('Opportunities by stage response:', response.data);
      return response.data.map((item: any) => ({
        stage: item.stage,
        value: item.value
      }));
    } catch (error) {
      console.error('Error fetching opportunities by stage:', error);
      return [];
    }
  },
  
  getGrowthData: async (): Promise<{ customers: number; leads: number; sales: number }> => {
    try {
      const response = await axios.get(`${API_URL}/growth`);
      console.log('Growth data response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching growth data:', error);
      return { customers: 0, leads: 0, sales: 0 };
    }
  }
};

export default DashboardService;