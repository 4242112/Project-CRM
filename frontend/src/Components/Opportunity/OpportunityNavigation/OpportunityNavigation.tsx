import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './OpportunityNavigation.css';

interface OpportunityNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const OpportunityNavigation: React.FC<OpportunityNavigationProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'calls', label: 'Calls', icon: 'telephone' },
    { id: 'notes', label: 'Notes', icon: 'journal-text' },
    { id: 'quotation', label: 'Quotation', icon: 'file-earmark-text' } 
  ];

  return (
    <div className="opportunity-navigation">
      {navItems.map(item => (
        <div 
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`nav-item d-flex align-items-center p-2 ${activeTab === item.id ? 'active' : ''}`}
          style={{ cursor: 'pointer' }}
        >
          <i className={`bi bi-${item.icon} me-2 nav-icon ${activeTab === item.id ? 'active' : ''}`}></i>
          <span className="fw-medium fs-6">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default OpportunityNavigation;