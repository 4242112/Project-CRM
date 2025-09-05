import React from "react";
import { Lead } from "../../../services/LeadService";

interface DeleteLeadProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  lead: Lead | null;
}

const DeleteLead: React.FC<DeleteLeadProps> = ({
  show,
  onClose,
  onConfirm,
  lead
}) => {
  if (!lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm();
  };

  return (
    <div className={`modal fade${show ? ' show d-block' : ''}`} tabIndex={-1} style={{ background: show ? 'rgba(0,0,0,0.5)' : undefined }} aria-modal="true" role="dialog">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Move Lead to Recycle Bin</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <p>Are you sure you want to move this lead to the recycle bin?</p>
            <p><strong>Name:</strong> {lead.name}</p>
            <p className="text-muted small">You can restore this lead from the Recycle Bin later.</p>
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

export default DeleteLead;