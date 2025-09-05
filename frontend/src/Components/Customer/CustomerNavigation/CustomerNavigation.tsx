import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './CustomerNavigation.css';

interface CustomerNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const CustomerNavigation: React.FC<CustomerNavigationProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'notes', label: 'Notes', icon: 'journal-text' },
    { id: 'invoice', label: 'Invoice', icon: 'receipt' },
  ];

  return (
    <div className="customer-navigation">
      {navItems.map(item => (
        <div 
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`nav-item d-flex align-items-center p-3 ${activeTab === item.id ? 'active' : ''}`}
          style={{ cursor: 'pointer' }}
        >
          <i className={`bi bi-${item.icon} me-2 nav-icon ${activeTab === item.id ? 'active' : ''}`}></i>
          <span className="fw-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default CustomerNavigation;
