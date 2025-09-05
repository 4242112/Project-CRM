import axios from 'axios';
import { Lead } from './LeadService';

const API_URL = 'http://localhost:8080/api/opportunities';

export interface Opportunity {
  lead: Lead;
  quotationId?: number;
  id?: number;
  stage: string;
  expectedRevenue: number;
  conversionProbability: number;
  createdDate?: string;
}

export enum OpportunityStage {
  NEW = "NEW",
  QUALIFICATION = "QUALIFICATION",
  PROPOSAL = "PROPOSAL",
  NEGOTIATION = "NEGOTIATION",
  CLOSED_WON = "CLOSED_WON",
  CLOSED_LOST = "CLOSED_LOST"
}


const OpportunityService = {

  getAllOpportunities: async (): Promise<Opportunity[]> => {
    try {
      const response = await axios.get(`${API_URL}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      throw error;
    }
  },


  getOpportunityById: async (id: number): Promise<Opportunity> => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching opportunity with ID ${id}:`, error);
      throw error;
    }
  },


  updateOpportunity: async (id: number, opportunity: Opportunity): Promise<Opportunity> => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, opportunity);
      return response.data;
    } catch (error) {
      console.error(`Error updating opportunity with ID ${id}:`, error);
      throw error;
    }
  },

  deleteOpportunity: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
      console.error(`Error deleting opportunity with ID ${id}:`, error);
      throw error;
    }
  },

  getRecycleBinOpportunities: async (): Promise<Opportunity[]> => {
    try {
      const response = await axios.get(`${API_URL}/recycle-bin`);
      return response.data;
    } catch (error) {
      console.error('Error fetching opportunities from recycle bin:', error);
      throw error;
    }
  },


  restoreOpportunity: async (id: number): Promise<void> => {
    try {
      await axios.put(`${API_URL}/restore/${id}`);
    } catch (error) {
      console.error(`Error restoring opportunity with ID ${id}:`, error);
      throw error;
    }
  },


  permanentDeleteOpportunity: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/delete-permanent/${id}`);
    } catch (error) {
      console.error(`Error permanently deleting opportunity with ID ${id}:`, error);
      throw error;
    }
  },


  convertLeadToOpportunity: async (leadId: number, opportunity: Partial<Opportunity>): Promise<Opportunity> => {
    try {
      const response = await axios.post(`${API_URL}/from-lead/${leadId}`, opportunity);
      return response.data;
    } catch (error) {
      console.error(`Error converting lead ${leadId} to opportunity:`, error);
      throw error;
    }
  },
  

  updateOpportunityStage: async (id: number, stage: OpportunityStage): Promise<Opportunity> => {
    try {
      const response = await axios.put(`${API_URL}/${id}/stage`, { stage });
      return response.data;
    } catch (error) {
      console.error(`Error updating stage for opportunity ${id}:`, error);
      throw error;
    }
  },
  

  searchOpportunities: async (query: string): Promise<Opportunity[]> => {
    try {
      const response = await axios.get(`${API_URL}/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching opportunities:', error);
      throw error;
    }
  },

  getOpportunitiesByEmployee: async (employeeId: string): Promise<Opportunity[]> => {
    try {
      const response = await axios.get(`${API_URL}/employee/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching opportunities for employee ${employeeId}:`, error);
      throw error;
    }
  },
};

export default OpportunityService;