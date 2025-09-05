import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Opportunity } from '../../services/OpportunityService';
import OpportunityService from '../../services/OpportunityService';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import EditOpportunity from './Buttons/Edit';
import ProfileButton from './OpportunityNavigation/OpportunityNavButtons/Profile/ProfileButton';
import NotesButton from './OpportunityNavigation/Notes/Notes';
import OpportunityNavigation from './OpportunityNavigation/OpportunityNavigation';
import CallsButton from './OpportunityNavigation/OpportunityNavButtons/CallLog/CallsLog';
import QuotationPage from './OpportunityNavigation/OpportunityNavButtons/Quotation/QuotationPage';

interface OpportunityViewDetailsProps {
  opportunity?: Opportunity | null;
  EditComponent?: React.ComponentType<{
    show: boolean;
    onClose: () => void;
    onSave: (data: Opportunity) => Promise<void>;
    opportunity: Opportunity | null;
  }>;
}

const OpportunityViewDetails: React.FC<OpportunityViewDetailsProps> = ({ 
  opportunity: propOpportunity, 
  EditComponent = EditOpportunity 
}) => {
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [opportunity, setOpportunity] = useState<Opportunity | null>
  (propOpportunity || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id && !propOpportunity) {
      setLoading(true);
      OpportunityService.getOpportunityById(Number(id))
        .then(data => {
          console.log('Fetched Opportunity:', data);
          setOpportunity(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching Opportunity:', err);
          setError('Failed to load Opportunity details');
          setLoading(false);
        });
    }
  }, [id, propOpportunity]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleBack = () => {
    navigate('/opportunity/manage');
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
            Go Back to Opportunity
          </button>
        </div>
      </div>
    );
  }

  if (!opportunity) return null;

  const handleEditClick = () => {
    setShowEditForm(true);
    setMessage(null);
    setError(null);
  };
  
  const handleCloseEditForm = () => {
    setShowEditForm(false);
  };

  const handleUpdateOpportunity = async (data: Opportunity) => {
    setMessage(null);
    setError(null);
    try {
      const updatedOpportunity = await OpportunityService.updateOpportunity(data.id!, data);
      
      setMessage("Opportunity updated successfully!");
      setShowEditForm(false);
      setOpportunity(updatedOpportunity);
    } catch (err) {
      console.error("Update error:", err);
      setError("Error updating Opportunity. Please try again.");
    }
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <>
            {/* Header with title and buttons in the same line */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0">Opportunity Information</h4>
              <div>
                <button className="btn btn-sm btn-secondary me-2" onClick={handleBack}>
                  <i className="bi bi-arrow-left me-1"></i> Back to Opportunities
                </button>
                <button className="btn btn-sm btn-primary me-2" onClick={handleEditClick}>
                  <i className="bi bi-pencil me-1"></i> Edit
                </button>
              </div>
            </div>
            {message && <div className="alert alert-success mb-3">{message}</div>}
            {error && <div className="alert alert-danger mb-3">{error}</div>}
            <ProfileButton opportunity={opportunity} />
          </>
        );
      case 'notes':
        return <NotesButton opportunity={opportunity} />;
      case 'calls':
        return <CallsButton opportunity={opportunity} />;
      case 'quotation':
        console.log('Rendering QuotationPage with opportunity:', opportunity);
        return <QuotationPage opportunity={opportunity} />;
      default:
        return null;
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-3 mb-4">
        
          {/* Left sidebar with Opportunity profile */}
          <div className="card shadow-sm mb-4">
            <div className="card-body text-center">
              <div className="mb-3">
                <div className="rounded-circle bg-light d-inline-flex justify-content-center align-items-center" style={{ width: '100px', height: '100px' }}>
                  <i className="bi bi-person-fill text-primary" style={{ fontSize: '3rem' }}></i>
                </div>
              </div>
              <h4>{opportunity.lead.name}</h4>
              <div className="text-start">
                <div className="mb-2">
                  <i className="bi bi-telephone me-2 text-primary"></i>
                  {opportunity.lead.phoneNumber}
                </div>
                <div className="mb-2">
                  <i className="bi bi-envelope me-2 text-primary"></i>
                  {opportunity.lead.email}
                </div>
                {opportunity.lead.website && (
                  <div className="mb-2">
                    <i className="bi bi-globe me-2 text-primary"></i>
                    {opportunity.lead.website}
                  </div>
                )}
              </div>
            </div>
          </div>
          <OpportunityNavigation 
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>

        
        <div className="col-md-9">

          {/* Main content area - renders the active tab content here */}
          <div className="Opportunity-content">
            {renderActiveContent()}
          </div>
        </div>
      </div>

      {/* Edit Opportunity Modal - Using the prop component */}
      <EditComponent 
        show={showEditForm}
        onClose={handleCloseEditForm}
        onSave={handleUpdateOpportunity}
        opportunity={opportunity}
      />
    </div>
  );
};

export default OpportunityViewDetails;