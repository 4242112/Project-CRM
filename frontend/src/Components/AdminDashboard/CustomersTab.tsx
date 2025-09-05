/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Button, Alert, Spinner, Table, FormControl, InputGroup } from 'react-bootstrap';
import Pagination from '../common/Pagination';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Customer {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  address?: string;
  city?: string;
  state?: string;
  hasPassword?: boolean;
}

interface CustomersTabProps {
  onError: (message: string) => void;

}

  const CustomersTab: React.FC<CustomersTabProps> = ({ onError }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10);

  
  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const response = await fetch('http://localhost:8080/api/customers');
      if (!response.ok) throw new Error('Failed to fetch customers');
      
      const data = await response.json();
      setCustomers(data);
      onError('');
    } catch (err) {
      console.error('Error fetching customers:', err);
      onError('Failed to fetch customers. Please try again later.');
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);


  const exportToExcel = () => {
    setExportLoading(true);
    try {

      const exportData = customers.map(customer => ({
        'ID': customer.id || '',
        'Name': customer.name || '',
        'Email': customer.email || '',
        'Phone Number': customer.phoneNumber || '',
        'Address': customer.address || '',
        'City': customer.city || '',
        'State': customer.state || '',
      }));


      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
  
      const columnWidths = [
        { wch: 5 },  
        { wch: 25 }, 
        { wch: 30 }, 
        { wch: 15 }, 
        { wch: 30 }, 
        { wch: 15 }, 
        { wch: 15 }, 
      ];
      worksheet['!cols'] = columnWidths;

 
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');


      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Save the excel file
      const currentDate = new Date().toISOString().split('T')[0];
      saveAs(data, `Customers_Export_${currentDate}.xlsx`);
      
      setMessage('Customers exported to Excel successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      onError('Failed to export customers to Excel.');
    } finally {
      setExportLoading(false);
    }
  };

  useEffect(() => {
    // Filter customers based on search query
    if (searchQuery.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = customers.filter(customer => 
        customer.name?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phoneNumber?.toLowerCase().includes(query) ||
        customer.address?.toLowerCase().includes(query) ||
        customer.city?.toLowerCase().includes(query) ||
        customer.state?.toLowerCase().includes(query)
      );
      setFilteredCustomers(filtered);
    }
  }, [searchQuery, customers]);


  const renderLoading = () => (
    <div className="text-center py-5">
      <Spinner animation="border" />
      <p className="mt-2">Loading data...</p>
    </div>
  );

  if (loadingCustomers) {
    return renderLoading();
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-5">
        <Alert variant="info">
          <i className="bi bi-info-circle me-2"></i>
          No customers found.
        </Alert>
        <Button 
          variant="outline-primary" 
          onClick={fetchCustomers} 
          className="mt-3"
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh Customers
        </Button>
      </div>
    );
  }

  // Pagination logic
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded" style={{ 
        backgroundColor: '#1a2236', 
        color: 'white',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <h5 className="m-0">All Customers</h5>
        <div>
          <Button 
            variant="light" 
            size="sm" 
            onClick={fetchCustomers}
            className="me-2"
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </Button>
          <Button 
            variant="success" 
            size="sm" 
            onClick={exportToExcel}
            disabled={exportLoading}
          >
            {exportLoading ? (
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
            ) : (
              <i className="bi bi-file-earmark-excel me-2"></i>
            )}
            Export to Excel
          </Button>
        </div>
      </div>
      
      {message && (
        <Alert variant="success" className="mb-3">
          {message}
        </Alert>
      )}

      <InputGroup className="mb-4">
        <FormControl
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search customers"
        />
        <Button variant="outline-secondary" onClick={() => setSearchQuery('')}>
          <i className="bi bi-x-circle"></i>
        </Button>
      </InputGroup>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Contact Information</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {currentCustomers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.id}</td>
              <td>{customer.name}</td>
              <td>
                <div>{customer.email}</div>
                <div>{customer.phoneNumber}</div>
              </td>
              <td>
                {customer.city && customer.state ? 
                  `${customer.city}, ${customer.state}` : 
                  (customer.address || 'N/A')}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Pagination 
        currentPage={currentPage} 
        totalItems={filteredCustomers.length} 
        itemsPerPage={customersPerPage}
        onPageChange={setCurrentPage} 
      />
    </>
  );
};

export default CustomersTab;