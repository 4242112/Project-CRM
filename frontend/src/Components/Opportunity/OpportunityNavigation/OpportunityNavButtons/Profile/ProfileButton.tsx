import React from 'react';
import { Opportunity } from '../../../OpportunityCard';

interface ProfileButtonProps {
  opportunity: Opportunity | null;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ opportunity }) => {
  if (!opportunity) return null;
  

  return (
    <div>
      
      
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Customer Details</h5>
        </div>
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <tbody>
              <tr>
                <th style={{width: '200px'}}>Name:</th>
                <td>{opportunity.lead.name}</td>
              </tr>
              <tr>
                <th>Phone:</th>
                <td>{opportunity.lead.phoneNumber}</td>
              </tr>
              <tr>
                <th>Email:</th>
                <td>{opportunity.lead.email}</td>
              </tr>
              <tr>
                <th>Website:</th>
                <td>{opportunity.lead.website || '-'}</td>
              </tr>
              
              <tr>
                <th>City:</th>
                <td>{opportunity.lead.city || '-'}</td>
              </tr>
              <tr>
                <th>State:</th>
                <td>{opportunity.lead.state || '-'}</td>
              </tr>
              <tr>
                <th>Zip Code:</th>
                <td>{opportunity.lead.zipCode || '-'}</td>
              </tr>
              <tr>
                <th>Country:</th>
                <td>{opportunity.lead.country || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Opportunity Details Section */}
      <div className="card shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Opportunity Details</h5>

        </div>
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <tbody>
              <tr>
                <th style={{width: '200px'}}>Interested In:</th>
                <td>{opportunity.lead.requirement || '-'}</td>
              </tr>
              <tr>
                <th>Source:</th>
                <td>{opportunity.lead.source || '-'}</td>
              </tr>
              <tr>
                <th>Assigned To:</th>
                <td>{opportunity.lead.assignedTo || 'Super Admin'}</td>
              </tr>
              <tr>
                <th>Expected Revenue:</th>
                <td>

                    
                    {opportunity.expectedRevenue ? `₹${opportunity.expectedRevenue}` : '-'}
         
                </td>
              </tr>
              <tr>
                <th>Probability:</th>
                <td>
      
                    {opportunity.conversionProbability ? `${opportunity.conversionProbability}%` : '-'}
      
                </td>
              </tr>
              <tr>
                <th>Comment:</th>
                <td>{opportunity.lead.comment || '-'}</td>
              </tr>
              {opportunity.lead.createdBy && (
                <tr>
                  <th>Created By:</th>
                  <td>{opportunity.lead.createdBy}</td>
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