import axios from 'axios';
import InvoiceService from './InvoiceService';
import LeadService from './LeadService';

const API_URL = 'http://localhost:8080/api/employees';

export interface Employee {
    id?: number;
    name: string;
    email: string;
    phoneNumber: string;
}

export interface EmployeeSalesPerformance {
    name: string;
    salesAmount: number;
    leadsConverted: number;
    conversionRate: number;
}

const EmployeeService = {
    getAllEmployeeNames: async (): Promise<string[]> => {
        const response = await axios.get(`${API_URL}/names`);
        return response.data;
    },
    
    getAllEmployees: async (): Promise<Employee[]> => {
        const response = await axios.get(API_URL);
        return response.data;
    },
    

    getEmployeeSalesPerformance: async (): Promise<EmployeeSalesPerformance[]> => {
        try {

            const [employees, leads, invoices] = await Promise.all([
                EmployeeService.getAllEmployees(),
                LeadService.getAllLeads(),
                InvoiceService.getAllInvoices()
            ]);
            

            const employeeSalesMap: Record<string, EmployeeSalesPerformance> = {};
            

            employees.forEach(employee => {
                employeeSalesMap[employee.name] = {
                    name: employee.name,
                    salesAmount: 0,
                    leadsConverted: 0,
                    conversionRate: 0
                };
            });
            

            const leadCountByEmployee: Record<string, number> = {};
            leads.forEach(lead => {
                if (lead.assignedTo) {
                    leadCountByEmployee[lead.assignedTo] = (leadCountByEmployee[lead.assignedTo] || 0) + 1;
                }
            });
            

            invoices.forEach(invoice => {

                const matchedEmployee = employees.find(emp => 
                    invoice.employeeName.includes(emp.name)
                );
                
                if (matchedEmployee) {
                    const performance = employeeSalesMap[matchedEmployee.name];
                    console.log(`Matched employee: ${matchedEmployee.name} for invoice: ${invoice.id}, total: ${invoice.total}`);
                    if (performance) {
                        performance.salesAmount += invoice.total;
                        performance.leadsConverted += 1;
                    }
                }
            });
  
            Object.keys(employeeSalesMap).forEach(employeeName => {
                const leadsAssigned = leadCountByEmployee[employeeName] || 0;
                const leadsConverted = employeeSalesMap[employeeName].leadsConverted;
                
                if (leadsAssigned > 0) {
                    employeeSalesMap[employeeName].conversionRate = (leadsConverted / leadsAssigned) * 100;
                }
            });
            

            return Object.values(employeeSalesMap)
                .sort((a, b) => b.salesAmount - a.salesAmount);
            
        } catch (error) {
            console.error('Error fetching employee sales performance:', error);
            return [];
        }
    }
};

export default EmployeeService;