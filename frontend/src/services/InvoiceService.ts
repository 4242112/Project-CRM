import axios from 'axios';

export interface ProductDTO {
  id?: number;
  name: string;
  description: string;
  price: number;
  category: string;
  status: string;
}

export interface InvoiceItem {
  id?: number;
  quantity: number;
  discount: number;
  product: ProductDTO;
  description?: string;
  rate?: number;
  amount?: number;
}

export interface Invoice {
  id?: number;
  invoiceNumber: string;
  customerName: string;
  employeeName: string;
  amount: number;
  status: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  items: InvoiceItem[];
  opportunityId?: number;
  customerId?: number;
  quotationId?: number;
}

const API_URL = 'http://localhost:8080/api/invoices';

const InvoiceService = {
  getAllInvoices: async (): Promise<Invoice[]> => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  getInvoicesByCustomerId: async (customerId: number): Promise<Invoice[]> => {
    const response = await axios.get(`${API_URL}/customer/${customerId}`);
    return response.data;
  },

  getInvoiceById: async (id: number): Promise<Invoice> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  createInvoice: async (invoice: Invoice, customerId: number): Promise<Invoice> => {
    const response = await axios.post(`${API_URL}/customer/${customerId}`, invoice);
    return response.data;
  },

  updateInvoice: async (id: number, invoice: Invoice): Promise<Invoice> => {
    const response = await axios.put(`${API_URL}/${id}`, invoice);
    return response.data;
  },

  deleteInvoice: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },

  generateInvoiceNumber: async (): Promise<string> => {
    const response = await axios.get(`${API_URL}/generate-invoice-number`);
    return response.data;
  },

  getInvoicesByEmail: async (email: string): Promise<Invoice[]> => {
    const response = await axios.get(`${API_URL}/customer/email/${email}`);
    return response.data;
  },

  /**
   * @param quotationId 
   * @return 
   */
  generateInvoiceFromQuotation: async (quotationId: number): Promise<Invoice> => {
    const response = await axios.post(`${API_URL}/from-quotation/${quotationId}`);
    return response.data;
  },


  calculateLineItemAmount: (quantity: number, rate: number): number => {
    return quantity * rate;
  },

  calculateInvoiceTotals: (items: InvoiceItem[], discount: number = 0, taxRate: number = 0): { 
    subtotal: number, 
    taxAmount: number, 
    total: number 
  } => {
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxableAmount = subtotal - discount;
    const taxAmount = taxableAmount * (taxRate / 100);
    const total = taxableAmount + taxAmount;

    return {
      subtotal,
      taxAmount,
      total
    };
  }
};

export default InvoiceService;