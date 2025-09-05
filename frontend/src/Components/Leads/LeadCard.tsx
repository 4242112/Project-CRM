import React from "react";
import { Lead } from "../../services/LeadService";

interface LeadCardProps {
  lead: Lead;
  onViewDetails?: () => void;
  onEdit?: () => void;
  onConvert?: () => void;
  onDelete?: () => void;
}


const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onViewDetails,
  onEdit,
  onConvert,
  onDelete,
}) => {

  
  return (
    <div className="card mb-3 shadow-sm border">
      <div className="card-header d-flex justify-content-between align-items-center" style={{ 
        backgroundColor: '#2e4a7a',
        color: 'white' 
      }}>
        <h5 className="mb-0">{lead.name}</h5>
        <div className="d-flex align-items-center">
          {lead.createdDate && (
            <small className="me-2"><strong>Created on: {lead.createdDate}</strong></small>
          )}
        </div>
      </div>
      <div className="card-body" style={{ backgroundColor: '#f0f4fa' }}> 
        <div className="mb-3">
          <div className="mb-1">
            <strong>Phone: </strong>{lead.phoneNumber}
          </div>
          <div className="mb-1">
            <strong>Email: </strong>{lead.email}
          </div>
          <div className="mb-1">
            <strong>Assigned To: </strong>{lead.assignedTo || 'Super Admin'}
          </div>
          {lead.requirement && (
            <div className="mb-1">
              <strong>Interested In: </strong>{lead.requirement}
            </div>
          )}
          {lead.expectedRevenue !== undefined && (
            <div className="mb-1">
              <strong>Expected Revenue: </strong>₹{lead.expectedRevenue.toFixed(2)}
            </div>
          )}
          {lead.conversionProbability !== undefined && (
            <div className="mb-1">
              <strong>Conversion Probability: </strong>{lead.conversionProbability}%
            </div>
          )}
        </div>
        
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-sm" style={{ backgroundColor: "#0275d8", color: "white" }} onClick={onViewDetails}>
            <i className="bi bi-eye me-1"></i> View Details
          </button>
          <button className="btn btn-sm" style={{ backgroundColor: "#6c757d", color: "white" }} onClick={onEdit}>
            <i className="bi bi-pencil me-1"></i> Edit
          </button>
          <button className="btn btn-sm btn-success" onClick={onConvert}>
            <i className="bi bi-arrow-right me-1"></i> Convert To Opportunity
          </button>
          <button className="btn btn-sm" style={{ backgroundColor: "#dc3545", color: "white" }} onClick={onDelete}>
            <i className="bi bi-trash me-1"></i> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadCard;