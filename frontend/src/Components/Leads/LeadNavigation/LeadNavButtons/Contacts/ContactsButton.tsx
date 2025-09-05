import React from 'react';
import { Lead } from '../../../../../services/LeadService';


interface ContactsButtonProps {
  lead: Lead | null;
}

const ContactsButton: React.FC<ContactsButtonProps> = ({ lead }) => {
  if (!lead) return null;
  
  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Contacts</h5>
        <button className="btn btn-sm btn-primary">
          <i className="bi bi-plus-lg me-1"></i> Add Contact
        </button>
      </div>
      <div className="card-body">
        <p className="text-muted">No contacts found for this lead.</p>
      </div>
    </div>
  );
};

export default ContactsButton;