import React from "react";
import { Customer, CustomerType } from "../../services/CustomerService";

interface CustomerCardProps {
  customer: Customer;
  onViewDetails?: () => void;
  onEdit?: () => void;
  onConvert?: () => void;
  onDelete?: () => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onViewDetails,
  onEdit,
  onDelete,
}) => {

  const getBadgeColor = () => {
    switch (customer.type) {
      case CustomerType.NEW:
        return '#28a745'; 
      case CustomerType.EXISTING:
        return '#17a2b8';
      default:
        return '#6c757d'; 
    }
  };
  
  return (
    <div className="card mb-3 shadow-sm border">
      <div className="card-header d-flex justify-content-between align-items-center" style={{ 
        backgroundColor: '#2e4a7a', 
        color: 'white' 
      }}>
        <h5 className="mb-0">{customer.name}</h5>
        <span className="badge" style={{ 
          backgroundColor: getBadgeColor(),
          fontSize: '0.8rem',
          padding: '0.35em 0.65em'
        }}>
          {customer.type.toString() || 'UNKNOWN'}
        </span>
      </div>
      <div className="card-body" style={{ backgroundColor: '#f0f4fa' }}>
        <div className="mb-3">
          <div className="mb-1">
            <strong>Phone: </strong> {customer.phoneNumber}
          </div>
          <div className="mb-1">
            <strong>Email: </strong>{customer.email}
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

export default CustomerCard;