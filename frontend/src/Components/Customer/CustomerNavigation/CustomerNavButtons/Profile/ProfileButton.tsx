import React from 'react';
import { Customer } from '../../../../../services/CustomerService';


interface ProfileButtonProps {
  customer: Customer | null;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ customer }) => {
  if (!customer) return null;
  
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
                <td>{customer.name}</td>
              </tr>
              <tr>
                <th>Phone:</th>
                <td>{customer.phoneNumber}</td>
              </tr>
              <tr>
                <th>Email:</th>
                <td>{customer.email}</td>
              </tr>
              <tr>
                <th>Website:</th>
                <td>{customer.website || '-'}</td>
              </tr>
              <tr>
                <th>City:</th>
                <td>{customer.city || '-'}</td>
              </tr>
              <tr>
                <th>State:</th>
                <td>{customer.state || '-'}</td>
              </tr>
              <tr>
                <th>Zip Code:</th>
                <td>{customer.zipCode || '-'}</td>
              </tr>
              <tr>
                <th>Country:</th>
                <td>{customer.country || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfileButton;