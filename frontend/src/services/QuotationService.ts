import axios from 'axios';
import { Product } from './ProductService';

export enum QuotationStage {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface QItem {
  product: Product;
  productId?: number;
  quantity: number;
  discount: number;
}

export interface Quotation {
  id?: number;
  title: string;
  description?: string;
  createdAt?: Date;
  validUntil: Date;
  amount: number;
  isApproved?: boolean;
  items: QItem[];
  opportunityId?: number;
  stage?: QuotationStage;
}

const BASE_URL = 'http://localhost:8080/api/quotations';

const QuotationService = {
  getQuotation: async (id: number): Promise<Quotation> => {
    const response = await axios.get(`${BASE_URL}/opportunity/${id}`);
    console.log('QuotationService response:', response.data);
    
    return response.data;
  },

  saveQuotation: async (opportunityId: number, quotation: Quotation): Promise<Quotation> => {
    const response = await axios.post(`${BASE_URL}/opportunity/${opportunityId}`, quotation);
    return response.data;
  },

  updateQuotation: async (id: number, quotation: Quotation): Promise<Quotation> => {
    const response = await axios.put(`${BASE_URL}/${id}`, quotation);
    return response.data;
  },

  deleteQuotation: async (id: number): Promise<void> => {
    await axios.delete(`${BASE_URL}/${id}`);
  },

  /**
   * @param id 
   * @returns
   */
  sendQuotation: async (id: number): Promise<Quotation> => {
    const response = await axios.post(`${BASE_URL}/${id}/send`);
    return response.data;
  },
  
  /**
   * @param customerId 
   * @returns 
   */
  getCustomerQuotations: async (customerId: number): Promise<Quotation[]> => {
    const response = await axios.get(`${BASE_URL}/customer/${customerId}`);
    return response.data;
  },

  /**
   * @param email 
   * @returns 
   */
  getQuotationsByEmail: async (email: string): Promise<Quotation[]> => {
    const response = await axios.get(`${BASE_URL}/customer/email/${email}`);
    return response.data;
  },

  /**
   * @param name 
   * @returns
   */
  getQuotationsByName: async (name: string): Promise<Quotation[]> => {
    const response = await axios.get(`${BASE_URL}/customer/name/${name}`);
    return response.data;
  },

  /**
   * @param id 
   * @returns 
   */
  acceptQuotation: async (id: number): Promise<Quotation> => {
    const response = await axios.post(`${BASE_URL}/${id}/accept`);
    return response.data;
  },
  
  /**
   * @param id 
   * @returns 
   */
  rejectQuotation: async (id: number): Promise<Quotation> => {
    const response = await axios.post(`${BASE_URL}/${id}/reject`);
    return response.data;
  }
};

export default QuotationService;
