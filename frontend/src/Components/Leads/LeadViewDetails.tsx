import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lead } from "../../services/LeadService";
import LeadNavigation from './LeadNavigation/LeadNavigation';
import ProfileButton from './LeadNavigation/LeadNavButtons/Profile/ProfileButton';
import CallsButton from './LeadNavigation/LeadNavButtons/CallLog/CallsLog';
import NotesButton from './LeadNavigation/LeadNavButtons/Notes/Notes';
import EditLeads from './Buttons/Edit';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_URL = "http://localhost:8080/api/leads";

interface LeadViewDetailsProps {
  lead?: Lead | null;
  EditComponent?: React.ComponentType<{
    show: boolean;
    onClose: () => void;
    onSave: (data: Lead) => Promise<void>;
    lead: Lead | null;
  }>;
}

const LeadViewDetails: React.FC<LeadViewDetailsProps> = ({ 
  lead: propLead, 
  EditComponent = EditLeads 
}) => {
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [lead, setLead] = useState<Lead | null>(propLead || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id && !propLead) {
      setLoading(true);
      fetch(`${API_URL}/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch lead data');
          }
          return response.json();
        })
        .then(data => {
          setLead(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching lead:', err);
          setError('Failed to load lead details');
          setLoading(false);
        });
    }
  }, [id, propLead]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleBack = () => {
    navigate('/leads/manage');
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
            Go Back to Leads
          </button>
        </div>
      </div>
    );
  }

  if (!lead) return null;

  const handleEditClick = () => {
    setShowEditForm(true);
    setMessage(null);
    setError(null);
  };
  
  const handleCloseEditForm = () => {
    setShowEditForm(false);
  };

  const handleUpdateLead = async (data: Lead) => {
    setMessage(null);
    setError(null);
    try {
      const url = `${API_URL}/${data.id}`;
      
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to update lead: ${response.status}`);
      }
      
      setMessage("Lead updated successfully!");
      setShowEditForm(false);
      setLead(data);
    } catch (err) {
      console.error("Update error:", err);
      setError("Error updating lead. Please try again.");
    }
  };

  // Function to render the active tab content
  const renderActiveContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0">Lead Information</h4>
              <div>
                <button className="btn btn-sm btn-secondary me-2" onClick={handleBack}>
                  <i className="bi bi-arrow-left me-1"></i> Back to Leads
                </button>
                <button className="btn btn-sm btn-primary me-2" onClick={handleEditClick}>
                  <i className="bi bi-pencil me-1"></i> Edit
                </button>
              </div>
            </div>
            {message && <div className="alert alert-success mb-3">{message}</div>}
            {error && <div className="alert alert-danger mb-3">{error}</div>}
            <ProfileButton lead={lead} />
          </>
        );
      case 'calls':
        return <CallsButton lead={lead} />; 
      case 'notes':
        return <NotesButton lead={lead} />;
      default:
        return null;
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-3 mb-4">
        
          {/* Left sidebar with lead profile */}
          <div className="card shadow-sm mb-4" style={{ 
            backgroundColor: '#f8f9fa', 
            borderRadius: '16px',
            width: '100%',
            maxWidth: '350px',
            margin: '0 auto',
            border: '1px solid #e9ecef'
          }}>
            <div className="card-body text-center p-4">
              <div className="mb-4">
                <div className="rounded-circle d-inline-flex justify-content-center align-items-center" 
                  style={{ 
                    width: '100px', 
                    height: '100px', 
                    backgroundColor: '#e7f1ff',
                    boxShadow: 'none'
                  }}>
                  <i className="bi bi-person-fill" style={{ fontSize: '2.5rem', color: '#0d6efd' }}></i>
                </div>
              </div>
              <h4 className="mb-4" style={{ fontWeight: '600', color: '#343a40' }}>{lead.name}</h4>
              <div className="text-start">
                <div className="mb-3">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-telephone me-3" style={{ fontSize: '1.2rem', color: '#0d6efd' }}></i>
                    <span style={{ color: '#495057' }}>{lead.phoneNumber}</span>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-envelope me-3" style={{ fontSize: '1.2rem', color: '#0d6efd' }}></i>
                    <span style={{ wordBreak: 'break-word', color: '#495057' }}>{lead.email}</span>
                  </div>
                </div>
                {lead.website && (
                  <div className="mb-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-globe me-3" style={{ fontSize: '1.2rem', color: '#0d6efd' }}></i>
                      <span style={{ wordBreak: 'break-word', color: '#495057' }}>{lead.website}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Navigation component - now only handles tab navigation */}
          <LeadNavigation 
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>

        
        <div className="col-md-9">

          {/* Main content area - renders the active tab content here */}
          <div className="lead-content">
            {renderActiveContent()}
          </div>
        </div>
      </div>

      {/* Edit Lead Modal - Using the prop component */}
      <EditComponent 
        show={showEditForm}
        onClose={handleCloseEditForm}
        onSave={handleUpdateLead}
        lead={lead}
      />
    </div>
  );
};

export default LeadViewDetails;