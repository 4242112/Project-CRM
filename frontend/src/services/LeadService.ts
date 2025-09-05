import axios from 'axios';

const API_URL = 'http://localhost:8080/api/leads';

const LeadService = {
  getAllLeads: async (): Promise<Lead[]> => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching leads:', error);
      return [];
    }
  },

  getLeadById: async (id: number): Promise<Lead> => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching lead with id ${id}:`, error);
      throw error;
    }
  },

  createLead: async (lead: Lead): Promise<Lead> => {
    try {
      const response = await axios.post(API_URL, lead);
      return response.data;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  },

  updateLead: async (id: number, lead: Lead): Promise<Lead> => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, lead);
      return response.data;
    } catch (error) {
      console.error(`Error updating lead with id ${id}:`, error);
      throw error;
    }
  },

  deleteLead: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
      console.error(`Error deleting lead with id ${id}:`, error);
      throw error;
    }
  },


  getLeadsBySource: async (): Promise<{ source: string; value: number }[]> => {
    try {
      const leads = await LeadService.getAllLeads();
      

      const sourceCounts: Record<string, number> = {};
      
      leads.forEach(lead => {
        const source = lead.source || LeadSource.UNKNOWN;
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      });
      

      return Object.entries(sourceCounts)
        .map(([source, value]) => ({ source, value }))
        .sort((a, b) => b.value - a.value); 
    } catch (error) {
      console.error('Error aggregating leads by source:', error);
      return [];
    }
  }
};

export default LeadService;
export interface Lead {
  id?: number;
  name: string;
  phoneNumber: string;
  email: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  country?: string;
  requirement: string;
  conversionProbability?: number;
  expectedRevenue?: number;
  source?: string;
  assignedTo: string;
  comment?: string;
  createdBy?: string;
  stage: string;
  createdDate?: string; 
}export enum LeadSource {
  WEBSITE = "WEBSITE",
  INTERNET = "INTERNET",
  REFERRAL = "REFERRAL",
  BROCHURE = "BROCHURE",
  ADVERTISEMENT = "ADVERTISEMENT",
  EMAIL = "EMAIL",
  PHONE = "PHONE",
  EVENT = "EVENT",
  OTHER = "OTHER",
  UNKNOWN = "UNKNOWN"
}

