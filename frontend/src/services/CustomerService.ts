import axios from 'axios';

const API_URL = 'http://localhost:8080/api/customers';

export interface Customer {
  id?: number;
  name?: string;
  email: string;
  phoneNumber: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  website?: string;
  type: CustomerType;
  hasPassword: boolean;
}

export enum CustomerType {
  NEW = "NEW",
  EXISTING = "EXISTING"
}

export interface PasswordUpdateDTO {
  password: string;
}

export interface CustomerRegistrationDTO {
  name: string;
  phoneNumber: string;
  address?: string;
  city?: string;
  state?: string;
  password: string;
}

const CustomerService = {
  /**
   * @returns 
   */
  getAllCustomers: async (): Promise<Customer[]> => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error getting all customers:', error);
      throw error;
    }
  },

  /**
   * @param id
   * @returns 
   */
  getCustomerById: async (id: number): Promise<Customer> => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting customer with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * @param email
   * @returns
   */
  getCustomerByEmail: async (email: string): Promise<Customer> => {
    try {
      const response = await axios.get(`${API_URL}/email/${email}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting customer with email ${email}:`, error);
      throw error;
    }
  },

  /**
   * @param customer
   * @returns
   */
  createCustomer: async (customer: Customer): Promise<Customer> => {
    try {
      const response = await axios.post(API_URL, customer);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  /**
   * @param id 
   * @param customer 
   * @returns 
   */
  updateCustomer: async (id: number, customer: Customer): Promise<Customer> => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, customer);
      return response.data;
    } catch (error) {
      console.error(`Error updating customer with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * @param id 
   * @returns
   */
  deleteCustomer: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
      console.error(`Error deleting customer with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * @param id 
   * @returns 
   */
  restoreCustomer: async (id: number): Promise<Customer> => {
    try {
      const response = await axios.put(`${API_URL}/restore/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error restoring customer with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * @param type
   * @returns 
   */
  getCustomersByType: async (type: string): Promise<Customer[]> => {
    try {
      const response = await axios.get(`${API_URL}/type/${type}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting customers with type ${type}:`, error);
      throw error;
    }
  },

  /**
   * @returns 
   */
  getDeletedCustomers: async (): Promise<Customer[]> => {
    try {
      const response = await axios.get(`${API_URL}/recycle-bin`);
      return response.data;
    } catch (error) {
      console.error('Error getting deleted customers:', error);
      throw error;
    }
  },

  /**
   * @param id 
   * @returns
   */
  permanentlyDeleteCustomer: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/delete-permanent/${id}`);
    } catch (error) {
      console.error(`Error permanently deleting customer with ID ${id}:`, error);
      throw error;
    }
  },

  /**

   * @param id 
   * @param passwordData 
   * @returns
   */
  setCustomerPassword: async (id: number, passwordData: PasswordUpdateDTO): Promise<Customer> => {
    try {
      const response = await axios.post(`${API_URL}/${id}/set-password`, passwordData);
      return response.data;
    } catch (error) {
      console.error(`Error setting password for customer with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * @param id 
   * @param registrationData
   * @returns 
   */
  registerCustomer: async (id: number, registrationData: CustomerRegistrationDTO): Promise<Customer> => {
    try {
      const response = await axios.post(`${API_URL}/${id}/register`, registrationData);
      return response.data;
    } catch (error) {
      console.error(`Error registering customer with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * @param name
   * @returns 
   */
  searchCustomersByName: async (name: string): Promise<Customer[]> => {
    try {
      const response = await axios.get(`${API_URL}/search/name?q=${encodeURIComponent(name)}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching customers by name ${name}:`, error);
      throw error;
    }
  }
};

export default CustomerService;