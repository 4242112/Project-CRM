import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import EditCustomer from './Buttons/Edit';
import ProfileButton from './CustomerNavigation/CustomerNavButtons/Profile/ProfileButton';
import NotesButton from './CustomerNavigation/CustomerNavButtons/Notes/Notes';
import CustomerNavigation from './CustomerNavigation/CustomerNavigation';
import CustomerService, { Customer } from '../../services/CustomerService';

import Invoices from './CustomerNavigation/CustomerNavButtons/Invoice/Invoices';

interface CustomerViewDetailsProps {
  customer?: Customer | null;
  EditComponent?: React.ComponentType<{
    show: boolean;
    onClose: () => void;
    onSave: (data: Customer) => Promise<void>;
    customer: Customer | null;
  }>;
}

const CustomerViewDetails: React.FC<CustomerViewDetailsProps> = ({ 
  customer: propCustomer, 
  EditComponent = EditCustomer 
}) => {
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [customer, setCustomer] = useState<Customer | null>
  (propCustomer || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id && !propCustomer) {
      setLoading(true);
      CustomerService.getCustomerById(Number(id))
        .then(data => {
          console.log('Fetched Customer:', data);
          setCustomer(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching Customer:', err);
          setError('Failed to load Customer details');
          setLoading(false);
        });
    }
  }, [id, propCustomer]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleBack = () => {
    navigate('/customer/manage');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <div className="d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <div>
            <h5>Error</h5>
            <p className="mb-0">{error}</p>
          </div>
        </div>
        <div className="mt-3">
          <button 
            className="btn btn-outline-primary"
            onClick={handleBack}
          >
            Go Back to Customer
          </button>
        </div>
      </div>
    );
  }

  if (!customer) return null;

  const handleEditClick = () => {
    setShowEditForm(true);
    setMessage(null);
    setError(null);
  };
  
  const handleCloseEditForm = () => {
    setShowEditForm(false);
  };

  const handleUpdateCustomer = async (data: Customer) => {
    setMessage(null);
    setError(null);
    try {
      if (data.id) {
        await CustomerService.updateCustomer(data.id, data);
        setMessage("Customer updated successfully!");
        setShowEditForm(false);
        setCustomer(data);
      }
    } catch (err) {
      console.error("Update error:", err);
      setError("Error updating Customer. Please try again.");
    }
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <>
            {/* Header with title and buttons in the same line */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0">Customer Information</h4>
              <div>
                <button className="btn btn-sm btn-secondary me-2" onClick={handleBack}>
                  <i className="bi bi-arrow-left me-1"></i> Back to Customers
                </button>
                <button className="btn btn-sm btn-primary me-2" onClick={handleEditClick}>
                  <i className="bi bi-pencil me-1"></i> Edit
                </button>
              </div>
            </div>
            {message && <div className="alert alert-success mb-3">{message}</div>}
            {error && <div className="alert alert-danger mb-3">{error}</div>}
            <ProfileButton customer={customer} />
          </>
        );
      case 'notes':
        return <NotesButton customer={customer} />;
      case 'invoice':
        return <Invoices customer={customer} />;

      default:
        return null;
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-3 mb-4">
        
          {/* Left sidebar with Customer profile */}
          <div className="card shadow-sm mb-4">
            <div className="card-body text-center">
              <div className="mb-3">
                <div className="rounded-circle bg-light d-inline-flex justify-content-center align-items-center" style={{ width: '100px', height: '100px' }}>
                  <i className="bi bi-person-fill text-primary" style={{ fontSize: '3rem' }}></i>
                </div>
              </div>
              <h4>{customer.name}</h4>
              
              <div className="text-start">
                <div className="mb-2">
                  <i className="bi bi-telephone me-2 text-primary"></i>
                  {customer.phoneNumber}
                </div>
                <div className="mb-2">
                  <i className="bi bi-envelope me-2 text-primary"></i>
                  {customer.email}
                </div>
                {customer.website && (
                  <div className="mb-2">
                    <i className="bi bi-globe me-2 text-primary"></i>
                    {customer.website}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <CustomerNavigation 
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>

        
        <div className="col-md-9">

          <div className="Customer-content">
            {renderActiveContent()}
          </div>
        </div>
      </div>

      <EditComponent 
        show={showEditForm}
        onClose={handleCloseEditForm}
        onSave={handleUpdateCustomer}
        customer={customer}
      />
    </div>
  );
};

export default CustomerViewDetails;