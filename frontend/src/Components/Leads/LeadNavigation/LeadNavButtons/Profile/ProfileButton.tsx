import React from 'react';
import { Lead } from "../../../../../services/LeadService";

interface ProfileButtonProps {
  lead: Lead | null;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ lead }) => {
  if (!lead) return null;
  

  return (
    <div>
      {/* Customer Details Section */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Customer Details</h5>
        </div>
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <tbody>
              <tr>
                <th style={{width: '200px'}}>Name:</th>
                <td>{lead.name}</td>
              </tr>
              <tr>
                <th>Phone:</th>
                <td>{lead.phoneNumber}</td>
              </tr>
              <tr>
                <th>Email:</th>
                <td>{lead.email}</td>
              </tr>
              <tr>
                <th>Address:</th>
                <td>{lead.address || '-'}</td>
              </tr>
              <tr>
                <th>Website:</th>
                <td>{lead.website || '-'}</td>
              </tr>
              
              <tr>
                <th>City:</th>
                <td>{lead.city || '-'}</td>
              </tr>
              <tr>
                <th>State:</th>
                <td>{lead.state || '-'}</td>
              </tr>
              <tr>
                <th>Zip Code:</th>
                <td>{lead.zipCode || '-'}</td>
              </tr>
              <tr>
                <th>Country:</th>
                <td>{lead.country || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Lead Details Section */}
      <div className="card shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Lead Details</h5>
        </div>
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <tbody>
              <tr>
                <th style={{width: '200px'}}>Interested In:</th>
                <td>{lead.requirement || '-'}</td>
              </tr>
              <tr>
                <th>Source:</th>
                <td>{lead.source || '-'}</td>
              </tr>
              <tr>
                <th>Assigned To:</th>
                <td>{lead.assignedTo || 'Super Admin'}</td>
              </tr>
              <tr>
                <th>Comment:</th>
                <td>{lead.comment || '-'}</td>
              </tr>
              {lead.createdBy && (
                <tr>
                  <th>Created By:</th>
                  <td>{lead.createdBy}</td>
                </tr>
              )}
              
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfileButton;