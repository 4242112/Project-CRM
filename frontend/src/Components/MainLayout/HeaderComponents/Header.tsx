import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Header.css';
import AuthService from '../../../services/AuthService';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    if (AuthService.isEmployeeLoggedIn()) {
      const employee = AuthService.getCurrentEmployee();
      setCurrentUser({
        name: employee?.name || '',
        email: employee?.email || ''
      });
    } 
    else if (AuthService.isCustomerLoggedIn()) {
      const customer = AuthService.getCurrentCustomer();
      setCurrentUser({
        name: customer?.name || '',
        email: customer?.email || ''
      });
    }
    else {
      const adminData = localStorage.getItem('adminAuth');
      if (adminData) {
        const admin = JSON.parse(adminData);
        setCurrentUser({
          name: admin.adminName || '',
          email: admin.email || ''
        });
      }
    }
    
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    if (AuthService.isEmployeeLoggedIn()) {
      AuthService.logoutEmployee();
    } else {
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('customerAuth');
    }
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <header className="header sticky-top shadow">
      <div className="container-fluid">
        <div className="d-flex align-items-center py-2">
          <div className="me-auto">
            <h1 className="header-title fs-4">
              <i className="bi bi-people-fill me-2"></i>
              CLIENTNEST CRM
            </h1>
          </div>
          <div className="position-relative" ref={dropdownRef}>
            <button 
              className="btn btn-sm profile-button"
              onClick={toggleDropdown}
            >
              <i className="bi bi-person-circle me-1"> {currentUser?.name || 'Profile'}</i>
              
            </button>
            
            {showDropdown && (
              <div className="dropdown-menu dropdown-menu-end show" style={{ position: 'absolute', top: '100%', right: 0, zIndex: 1000 }}>
                {currentUser && (
                  <div className="dropdown-item-text">
                    <div className="fw-bold">{currentUser.name}</div>
                    <div className="small text-muted">{currentUser.email}</div>
                  </div>
                )}
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
