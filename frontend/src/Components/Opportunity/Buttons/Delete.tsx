import React from "react";
import { Opportunity } from "../OpportunityCard";

interface DeleteOpportunityProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  Opportunity: Opportunity | null;
}

const DeleteOpportunity: React.FC<DeleteOpportunityProps> = ({
  show,
  onClose,
  onConfirm,
  Opportunity
}) => {
  if (!Opportunity) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm();
  };

  return (
    <div className={`modal fade${show ? ' show d-block' : ''}`} tabIndex={-1} style={{ background: show ? 'rgba(0,0,0,0.5)' : undefined }} aria-modal="true" role="dialog">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Move Opportunity to Recycle Bin</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <p>Are you sure you want to move this Opportunity to the recycle bin?</p>
            <p><strong>Name:</strong> {Opportunity.lead.name}</p>
            <p className="text-muted small">You can restore this Opportunity from the Recycle Bin later.</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="button" className="btn btn-danger" onClick={handleSubmit}>Move to Recycle Bin</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteOpportunity;