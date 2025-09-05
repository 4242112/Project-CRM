/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { Lead } from "../../services/LeadService";

export interface Opportunity {
  lead: Lead;
  quotationId?: number;
  id?: number;
  stage: string;
  expectedRevenue: number;
  conversionProbability: number;
  createdDate?: string; 
}

export enum OpportunitySource {
  WEBSITE = "WEBSITE",
  INTERNET = "INTERNET",
  REFERRAL = "REFFERAL",
  BROCHURE = "BROCHURE",
  ADVERTISEMENT = "ADVERTISEMENT",
  EMAIL = "EMAIL",
  PHONE = "PHONE",
  EVENT = "EVENT",
  OTHER = "OTHER",
  UNKNOWN = "UNKNOWN",
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  onViewDetails?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onViewDetails,
  onEdit,
  onDelete,
}) => {

  
  return (
    <div className="card mb-3 shadow-sm border">
      <div className="card-header d-flex justify-content-between align-items-center" style={{ 
        backgroundColor: '#2e4a7a', 
        color: 'white' 
      }}>
        <h5 className="mb-0">{opportunity.lead.name}</h5>
        <div className="d-flex align-items-center">
          {opportunity.createdDate && (
            <small className="me-2"><strong>Created on: {opportunity.createdDate}</strong></small>
          )}
        </div>
      </div>
      <div className="card-body" style={{ backgroundColor: '#f0f4fa' }}>
        <div className="mb-3">
          <div className="mb-1">
            <strong>Phone: </strong> {opportunity.lead.phoneNumber}
          </div>
          <div className="mb-1">
            <strong>Email: </strong>{opportunity.lead.email}
          </div>
          <div className="mb-1">
            <strong>Assigned To: </strong>{opportunity.lead.assignedTo || 'Super Admin'}
          </div>
          {opportunity.lead.requirement && (
            <div className="mb-1">
              <strong>Requirement: </strong>{opportunity.lead.requirement}
            </div>
          )}
          
          {/* Quotation flag */}
          <div className="mb-1">
            <strong>Quotation: </strong>
            {opportunity.quotationId ? (
              <span className="badge bg-success">Created</span>
            ) : (
              <span className="badge bg-warning text-dark">Not Created</span>
            )}
          </div>
        </div>
        
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-sm" style={{ backgroundColor: "#0275d8", color: "white" }} onClick={onViewDetails}>
            <i className="bi bi-eye me-1"></i> View Details
          </button>
          <button className="btn btn-sm" style={{ backgroundColor: "#6c757d", color: "white" }} onClick={onEdit}>
            <i className="bi bi-pencil me-1"></i> Edit
          </button>
          <button className="btn btn-sm" style={{ backgroundColor: "#dc3545", color: "white" }} onClick={onDelete}>
            <i className="bi bi-trash me-1"></i> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;