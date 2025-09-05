/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect } from 'react';
import { Container, Alert, Button, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../assets/compact-layout.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import LeadsTab from './LeadsTab';
import OpportunitiesTab from './OpportunitiesTab';
import CustomersTab from './CustomersTab';
import EmployeesTab from './EmployeesTab';


interface AdminAuthData {
  isAuthenticated: boolean;
  adminId: number;
  adminName: string;
  email: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  

  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab') || 'leads';
  
  const [activeTab, setActiveTab] = useState<string>(tabParam);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  useEffect(() => {
    const tab = queryParams.get('tab') || 'leads';
    setActiveTab(tab);
 
  }, [location.search]);
  
  useEffect(() => {

    const checkAuth = () => {
      const authString = localStorage.getItem('adminAuth');
      
      if (!authString) {
        setError('You are not logged in. Please login to continue.');
        setIsLoading(false);
        return;
      }
      
      try {
        const authData = JSON.parse(authString) as AdminAuthData;
        

        if (!authData.isAuthenticated || authData.email !== 'admin@gmail.com') {
          setError('Invalid admin credentials. Please login again.');
          localStorage.removeItem('adminAuth'); 
          setIsLoading(false);
          return;
        }

        setIsLoading(false);
      } catch (err) {
        setError('Authentication error. Please login again.');
        setIsLoading(false);
      }
    };


    checkAuth();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'leads':
        return <LeadsTab onError={(msg) => setError(msg)} />;
      case 'opportunities':
        return <OpportunitiesTab onError={(msg) => setError(msg)} />;
      case 'customers':
        return <CustomersTab onError={(msg) => setError(msg)} />;
      case 'employees':
        return <EmployeesTab onError={(msg) => setError(msg)} onSuccess={(msg) => setSuccessMessage(msg)} />;
      case 'catalog':

        return <Alert variant="info">Catalog management will be implemented here.</Alert>;
      default:
        return <Alert variant="warning">Unknown section selected!</Alert>;
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
          <hr />
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

      
      <div className="content-body">
        {successMessage && (
          <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}
        {renderContent()}
      </div>
    </Container>
  );
};

export default AdminDashboard;