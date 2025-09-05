import axios from 'axios';

export type DateTime = [number, number, number, number, number];

export interface CallLog {
  id?: number;
  title: string;
  description: string;
  type: 'INCOMING' | 'OUTGOING' | 'MISSED';
  dateTime: DateTime; 
  minutes: number;
  seconds: number;
  customerName: string;
  employeeName: string;
  customerEmail?: string; 
  employeeEmail?: string;
}



/**
 * @param date 
 * @returns
 */
export const dateToDateTime = (date: Date): DateTime => {
  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes()
  ];
};

/**

 * @param dateTime 
 * @returns 
 */
export const dateTimeToDate = (dateTime: DateTime): Date => {
  if (!Array.isArray(dateTime) || dateTime.length < 3) {
    console.error('Invalid DateTime format:', dateTime);
    return new Date();
  }
  

  const [year, month, day, hour = 0, minute = 0] = dateTime;
  return new Date(year, month - 1, day, hour, minute);
};

/**
 * @param dateTime 
 * @returns 
 */
export const formatDateTime = (dateTime: DateTime | string | Date): string => {
  try {
    let date: Date;
    
    if (Array.isArray(dateTime)) {
      date = dateTimeToDate(dateTime);
    } else if (dateTime instanceof Date) {
      date = dateTime;
    } else if (typeof dateTime === 'string') {
      date = new Date(dateTime);
    } else {
      return 'Invalid date format';
    }
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleString();
  } catch (err) {
    console.error('Error formatting date:', err);
    return 'Error formatting date';
  }
};

/**
 * @returns 
 */
export const getCurrentDateTime = (): DateTime => {
  return dateToDateTime(new Date());
};

/**
 * @param dateString 
 * @returns 
 */
export const dateStringToDateTime = (dateString: string): DateTime => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.error('Invalid date string:', dateString);
    return getCurrentDateTime();
  }
  return dateToDateTime(date);
};

const BASE_URL = 'http://localhost:8080/api/call-logs';

const CallLogService = {
  // Get all call logs
  getAllCallLogs: async (): Promise<CallLog[]> => {
    try {
      console.log('Fetching all call logs');
      const response = await axios.get(BASE_URL);
      console.log('Call logs response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching all call logs:', error);
      return [];
    }
  },
  
  getCallLogsByCustomerId: async (customerId: number): Promise<CallLog[]> => {
    if (!customerId) {
      console.error('Customer ID is required');
      return [];
    }
    
    try {
      console.log(`Fetching call logs for customer ID: ${customerId}`);
      const response = await axios.get(`${BASE_URL}/customer/${customerId}`);
      console.log('Customer call logs response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching call logs for customer ID ${customerId}:`, error);
      return [];
    }
  },
  
  getCallLogsByCustomerEmail: async (email: string): Promise<CallLog[]> => {
    if (!email) {
      console.error('Customer email is required');
      return [];
    }
    
    try {
      console.log(`Fetching call logs for customer email: ${email}`);
      const response = await axios.get(`${BASE_URL}/customer/email/${encodeURIComponent(email)}`);
      console.log('Customer call logs by email response:', response.data);
      console.log(await response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching call logs for customer email ${email}:`, error);
      return [];
    }
  },
  
  getCallLogsByCustomerName: async (customerName: string): Promise<CallLog[]> => {
    if (!customerName) {
      console.error('Customer name is required');
      return [];
    }
    
    try {
      console.log('Fetching all call logs to filter by customer name');
      const response = await axios.get(BASE_URL);
      const allLogs = response.data as CallLog[];
      
      const filteredLogs = allLogs.filter(log => 
        log.customerName && 
        log.customerName.toLowerCase() === customerName.toLowerCase()
      );
      
      console.log(`Found ${filteredLogs.length} logs for customer name: ${customerName}`);
      return filteredLogs;
    } catch (error) {
      console.error(`Error fetching call logs for customer name ${customerName}:`, error);
      return [];
    }
  },
  
  createCallLog: async (callLog: CallLog): Promise<CallLog> => {
    try {
      console.log('Creating call log:', callLog);
      
      if (typeof callLog.dateTime === 'string') {
        const date = new Date(callLog.dateTime);
        callLog = {
          ...callLog,
          dateTime: dateToDateTime(date)
        };
      }
      
      const response = await axios.post(BASE_URL, callLog);
      console.log('Created call log response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating call log:', error);
      throw error;
    }
  },
  
  updateCallLog: async (id: number, callLog: CallLog): Promise<CallLog> => {
    try {
      console.log(`Updating call log ID ${id}:`, callLog);
      
      if (typeof callLog.dateTime === 'string') {
        const date = new Date(callLog.dateTime);
        callLog = {
          ...callLog,
          dateTime: dateToDateTime(date)
        };
      }
      
      const response = await axios.put(`${BASE_URL}/${id}`, callLog);
      console.log('Updated call log response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating call log ID ${id}:`, error);
      throw error;
    }
  },
  
  deleteCallLog: async (id: number): Promise<void> => {
    try {
      console.log(`Deleting call log ID: ${id}`);
      await axios.delete(`${BASE_URL}/${id}`);
      console.log(`Call log ID ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting call log ID ${id}:`, error);
      throw error;
    }
  }
};

export default CallLogService;