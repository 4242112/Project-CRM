/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Button, Spinner } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import "../../assets/compact-layout.css";
import CustomerQuotation from './CustomerQuotation';
import CustomerTickets from './CustomerTickets';
import CustomerInvoices from './CustomerInvoices';
import { Customer, CustomerType } from '../../services/CustomerService';


interface AuthData {
  isAuthenticated: boolean;
  customerId: number;
  customerName: string;
  userId: number;
  email: string;
  memberSince: string;
}

const CustomerDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab') || 'quotations';
  
  const [activeTab, setActiveTab] = useState<string>(tabParam);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [customerData, setCustomerData] = useState<Customer | null>(null);

  useEffect(() => {
    const tab = queryParams.get('tab') || 'quotations';
    setActiveTab(tab);
  }, [location.search]);

  useEffect(() => {
    if (customerId && customerName && customerEmail) {
      setCustomerData({
        id: customerId,
        name: customerName,
        email: customerEmail,
        phoneNumber: '', 
        type: CustomerType.NEW, 
        hasPassword: true 
      });
    }
  }, [customerId, customerName, customerEmail]);

  useEffect(() => {
    const checkAuth = () => {
      const authString = localStorage.getItem('customerAuth');
      
      if (!authString) {
        setError('You are not logged in. Please login to continue.');
        setIsLoading(false);
        return;
      }
      
      try {
        const authData = JSON.parse(authString) as AuthData;
        
        if (!authData.isAuthenticated) {
          setError('Session expired. Please login again.');
          setIsLoading(false);
          return;
        }
        
        setCustomerId(authData.customerId);
        setCustomerName(authData.customerName);
        setCustomerEmail(authData.email);
        
        setIsLoading(false);
      } catch (err) {
        setError('Authentication error. Please login again.');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const renderTabContent = () => {
    if (!customerId) return null;
    
    switch (activeTab) {
      case 'quotations':
        return <CustomerQuotation customerId={customerId} customerEmail={customerEmail} />;
      
      case 'tickets':
        return <CustomerTickets customerId={customerId} customerEmail={customerEmail} />;
        
      case 'invoices':
        return <CustomerInvoices customerId={customerId} customerEmail={customerEmail} customerData={customerData} />;
        
      default:
        return <Alert variant="warning">Unknown tab selected!</Alert>;
    }
  };

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Authentication Error</Alert.Heading>
          <p>{error}</p>

          <div className="d-flex justify-content-end">
            <Button variant="outline-danger" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <div className="content-header mb-4 p-3 rounded" style={{ 
        backgroundColor: '#1a2236', 
        color: 'white',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <h2>Customer Portal - {customerName}</h2>
      </div>
      
      <Row>
        <Col>
          <div className="content-container">
            {renderTabContent()}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CustomerDashboard;