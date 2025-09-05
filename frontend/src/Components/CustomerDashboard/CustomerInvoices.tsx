import React, { useState, useEffect } from 'react';
import { Alert, Spinner } from "react-bootstrap";
import InvoiceService from "../../services/InvoiceService";
import Invoices from '../Customer/CustomerNavigation/CustomerNavButtons/Invoice/Invoices';
import { Customer } from '../../services/CustomerService';

interface CustomerInvoicesProps {
  customerId: number | null;
  customerEmail: string;
  customerData: Customer | null;
}

const CustomerInvoices: React.FC<CustomerInvoicesProps> = ({ customerId, customerEmail, customerData }) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingInvoices, setLoadingInvoices] = useState<boolean>(false);


  useEffect(() => {
    if (customerEmail) {
      fetchInvoices();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, customerEmail]);

  const fetchInvoices = async () => {
    if (!customerEmail) {
      console.log('No customer email available, cannot fetch invoices');
      return;
    }
    
    console.log('Fetching invoices for email:', customerEmail);
    setLoadingInvoices(true);
    try {
      const data = await InvoiceService.getInvoicesByEmail(customerEmail);
      console.log('Invoices fetched successfully:', data);
      setError(null);
      
      if (data.length === 0 && customerId) {
        console.log('No invoices found by email, trying by customer ID');
        try {
          const dataById = await InvoiceService.getInvoicesByCustomerId(customerId);
          console.log('Invoices fetched by customer ID:', dataById);
          
          if (dataById.length === 0) {
            setSuccessMessage('No invoices found for your account');
            setTimeout(() => setSuccessMessage(null), 3000);
          }
        } catch (idError) {
          console.error('Error fetching invoices by customer ID:', idError);
        }
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Failed to fetch invoices. Please try again later.');
    } finally {
      setLoadingInvoices(false);
    }
  };

  if (loadingInvoices) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading your invoices...</p>
      </div>
    );
  }
  
  return (
    <>
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Invoices customer={customerData} />
    </>
  );
};

export default CustomerInvoices;