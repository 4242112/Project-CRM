import axios from 'axios';

export enum TicketStatus {
  NEW = "NEW",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export interface Ticket {
  id?: number;
  subject: string;
  description: string;
  status?: TicketStatus | string;
  createdAt?: string; 
  updatedAt?: string;
  customerId?: number;
  customerName?: string;
  customerEmail?: string;
  employeeId?: number;
  employeeName?: string;
  employeeEmail?: string;
}

export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  
  if (/^\d{2}\/\d{2}\/\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear() % 100).padStart(2, '0')}`;
  } catch (error) {
    console.error('Date parsing error:', error);
    return 'Invalid date';
  }
};

const API_URL = 'http://localhost:8080/api/tickets';

const TicketService = {
  getAllTickets: async (): Promise<Ticket[]> => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  },

  getTicketsByCustomerId: async (customerId: number): Promise<Ticket[]> => {
    try {
      const response = await axios.get(`${API_URL}/customer/${customerId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tickets for customer ID ${customerId}:`, error);
      throw error;
    }
  },

  getTicketById: async (id: number): Promise<Ticket> => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ticket ${id}:`, error);
      throw error;
    }
  },

  createTicket: async (ticket: Ticket, customerId: number): Promise<Ticket> => {
    try {
      if (!ticket.status) {
        ticket.status = TicketStatus.NEW;
      }
      
      console.log('Creating ticket:', ticket);
      console.log('Customer ID:', customerId);
      const response = await axios.post(`${API_URL}/customer/${customerId}`, ticket);
      return response.data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },

  getTicketsByEmail: async (email: string): Promise<Ticket[]> => {
    try {
      const response = await axios.get(`${API_URL}/customer/email/${email}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tickets for email ${email}:`, error);
      throw error;
    }  
  },

  updateTicket: async (id: number, ticket: Ticket): Promise<Ticket> => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, ticket);
      return response.data;
    } catch (error) {
      console.error(`Error updating ticket ${id}:`, error);
      throw error;
    }
  },

  deleteTicket: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
      console.error(`Error deleting ticket ${id}:`, error);
      throw error;
    }
  },

  assignTicketToEmployee: async (ticketId: number, employeeId: number): Promise<Ticket> => {
    try {
      const response = await axios.put(`${API_URL}/${ticketId}/assign/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error assigning ticket ${ticketId} to employee ${employeeId}:`, error);
      throw error;
    }
  },

  confirmTicketResolution: async (ticketId: number): Promise<Ticket> => {
    try {
      const response = await axios.put(`${API_URL}/${ticketId}/confirm`);
      return response.data;
    } catch (error) {
      console.error(`Error confirming resolution for ticket ${ticketId}:`, error);
      throw error;
    }
  },
  
  denyTicketResolution: async (ticketId: number, feedback?: string): Promise<Ticket> => {
    try {
      const response = await axios.put(`${API_URL}/${ticketId}/deny`, { feedback });
      return response.data;
    } catch (error) {
      console.error(`Error denying resolution for ticket ${ticketId}:`, error);
      throw error;
    }
  },

  getClosedTickets: async (customerId: number): Promise<Ticket[]> => {
    try {
      const response = await axios.get(`${API_URL}/customer/${customerId}/closed`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching closed tickets for customer ${customerId}:`, error);
      throw error;
    }
  }
};

export default TicketService;