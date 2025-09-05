import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './LeadNavigation.css';

interface LeadNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const LeadNavigation: React.FC<LeadNavigationProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'calls', label: 'Calls', icon: 'telephone' },
    { id: 'notes', label: 'Notes', icon: 'journal-text' },
  ];

  return (
    <div className="lead-navigation">
      {navItems.map(item => (
        <div 
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`nav-item d-flex align-items-center p-3 ${activeTab === item.id ? 'active' : ''}`}
        >
          <i className={`bi bi-${item.icon} me-2 nav-icon ${activeTab === item.id ? 'active' : ''}`}></i>
          <span className="fw-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default LeadNavigation;