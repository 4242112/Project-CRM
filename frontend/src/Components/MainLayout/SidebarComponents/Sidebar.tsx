import React, { useState, useEffect } from 'react';
import { Link, useLocation} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Sidebar.css';
import AuthService from '../../../services/AuthService';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isEmployee, setIsEmployee] = useState<boolean>(false);
  const [isCustomer, setIsCustomer] = useState<boolean>(false);
  
  useEffect(() => {
    const customerAuth = localStorage.getItem('customerAuth');
    if (customerAuth) {
      try {
        const customerData = JSON.parse(customerAuth);
        if (customerData.isAuthenticated) {
          setIsCustomer(true);
          setIsAdmin(false);
          setIsEmployee(false);
          console.log('Customer detected via customerAuth');
          return; 
        }
      } catch (e) {
        console.error('Error parsing customer auth data:', e);
      }
    }
    
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      try {
        const adminData = JSON.parse(adminAuth);
        if (adminData.isAuthenticated) {
          setIsAdmin(true);
          setIsEmployee(false);
          setIsCustomer(false);
          console.log('Admin detected via adminAuth');
          return; 
        }
      } catch (e) {
        console.error('Error parsing admin auth data:', e);
      }
    }
    
    // If no admin auth found, check for employee with ADMIN role
    const employeeAuth = AuthService.getCurrentEmployee();
    if (employeeAuth) {
      console.log('Employee data found:', employeeAuth);
      if (employeeAuth.role === 'ADMIN') {
        setIsAdmin(true);
        setIsEmployee(false);
        setIsCustomer(false);
        console.log('Admin detected via employee role');
        return; // Exit early if admin employee is found
      } else {
        // Regular employee
        setIsAdmin(false);
        setIsEmployee(true);
        setIsCustomer(false);
        console.log('Regular employee detected');
      }
    } else if (AuthService.isEmployeeLoggedIn()) {
      setIsAdmin(false);
      setIsEmployee(true);
      setIsCustomer(false);
      console.log('Employee detected via login status');
    } else {
      console.log('No authenticated user found');
    }
  }, []); // Empty dependency array so it only runs once on mount

  // This effect runs after state updates to show the current state for debugging
  useEffect(() => {
    console.log('Current state - Admin:', isAdmin, 'Employee:', isEmployee, 'Customer:', isCustomer);
  }, [isAdmin, isEmployee, isCustomer]);

  const toggleDropdown = (dropdownName: string) => {
    setExpandedDropdown(prev => (prev === dropdownName ? null : dropdownName));
  };

  const isActive = (path: string) => location.pathname === path;

  // Handle customer navigation

  // Render sidebar for Customer
  const renderCustomerSidebar = () => (
    <ul className="nav nav-pills flex-column sidebar-scroll">
      {/* Customer specific links */}
      <li className="sidebar-nav-item">
        <Link 
          to="/customer-portal?tab=quotations"
          className={`nav-link sidebar-link ${location.pathname === '/customer-portal' && (location.search.includes('tab=quotations') || !location.search) ? 'active' : ''}`}
        >
          <i className="bi bi-file-earmark-text me-2"></i>
          Quotations
        </Link>
      </li>

      <li className="sidebar-nav-item">
        <Link
          to="/customer-portal?tab=invoices"
          className={`nav-link sidebar-link ${location.pathname === '/customer-portal' && location.search.includes('tab=invoices') ? 'active' : ''}`}
        >
          <i className="bi bi-receipt me-2"></i>
          Invoices
        </Link>
      </li>

      <li className="sidebar-nav-item">
        <Link
          to="/customer-portal?tab=tickets"
          className={`nav-link sidebar-link ${location.pathname === '/customer-portal' && location.search.includes('tab=tickets') ? 'active' : ''}`}
        >
          <i className="bi bi-ticket-detailed me-2"></i>
          Tickets
        </Link>
      </li>
    </ul>
  );

  // Render sidebar for Admin
  const renderAdminSidebar = () => (
    <ul className="nav nav-pills flex-column sidebar-scroll">
      {/* Dashboard - Common */}
      <li className="sidebar-nav-item">
        <Link to="/" className={`nav-link sidebar-link ${isActive('/') ? 'active' : ''}`}>
          <i className="bi bi-speedometer2 me-2"></i>
          Dashboard
        </Link>
      </li>

      {/* Admin specific simple links */}
      <li className="sidebar-nav-item">
        <Link to="/admin/dashboard?tab=leads" className={`nav-link sidebar-link ${location.pathname === '/admin/dashboard' && location.search.includes('tab=leads') ? 'active' : ''}`}>
          <i className="bi bi-person-lines-fill me-2"></i>
          Leads
        </Link>
      </li>

      <li className="sidebar-nav-item">
        <Link to="/admin/dashboard?tab=opportunities" className={`nav-link sidebar-link ${location.pathname === '/admin/dashboard' && location.search.includes('tab=opportunities') ? 'active' : ''}`}>
          <i className="bi bi-graph-up me-2"></i>
          Opportunities
        </Link>
      </li>

      <li className="sidebar-nav-item">
        <Link to="/admin/dashboard?tab=customers" className={`nav-link sidebar-link ${location.pathname === '/admin/dashboard' && location.search.includes('tab=customers') ? 'active' : ''}`}>
          <i className="bi bi-people-fill me-2"></i>
          Customers
        </Link>
      </li>

      {/* Employee management - Admin only */}
      <li className="sidebar-nav-item">
        <Link to="/admin/dashboard?tab=employees" className={`nav-link sidebar-link ${location.pathname === '/admin/dashboard' && location.search.includes('tab=employees') ? 'active' : ''}`}>
          <i className="bi bi-person-badge me-2"></i>
          Employees
        </Link>
      </li>

      {/* Catalog link */}
      <li className="sidebar-nav-item">
        <button
          className={`nav-link sidebar-dropdown-button ${expandedDropdown === 'catalog' ? 'expanded' : ''}`}
          onClick={() => toggleDropdown('catalog')}
        >
          <span><i className="bi bi-journal-text me-2"></i>Catalog</span>
          <i className={`bi ${expandedDropdown === 'catalog' ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
        </button>
        {expandedDropdown === 'catalog' && (
          <ul className="sidebar-dropdown-menu">
            <li><Link to="/catalog/products" className={`nav-link sidebar-dropdown-link ${isActive('/catalog/products') ? 'active' : ''}`}><i className="bi bi-box-seam me-2"></i>Products</Link></li>
            <li><Link to="/catalog/category" className={`nav-link sidebar-dropdown-link ${isActive('/catalog/category') ? 'active' : ''}`}><i className="bi bi-tags me-2"></i>Category</Link></li>
          </ul>
        )}
      </li>

      {/* Tickets Dropdown - replacing the simple link */}
      <li className="sidebar-nav-item">
        <button
          className={`nav-link sidebar-dropdown-button ${expandedDropdown === 'tickets' ? 'expanded' : ''}`}
          onClick={() => toggleDropdown('tickets')}
        >
          <span><i className="bi bi-ticket-perforated me-2"></i>Tickets</span>
          <i className={`bi ${expandedDropdown === 'tickets' ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
        </button>
        {expandedDropdown === 'tickets' && (
          <ul className="sidebar-dropdown-menu">
            <li><Link to="/tickets/open" className={`nav-link sidebar-dropdown-link ${isActive('/tickets/open') ? 'active' : ''}`}><i className="bi bi-envelope me-2"></i>Open Tickets</Link></li>
            <li><Link to="/tickets/in-progress-tickets" className={`nav-link sidebar-dropdown-link ${isActive('/tickets/in-progress-tickets') ? 'active' : ''}`}><i className="bi bi-person-workspace me-2"></i>In Progress Tickets</Link></li>
            <li><Link to="/tickets/closed" className={`nav-link sidebar-dropdown-link ${isActive('/tickets/closed') ? 'active' : ''}`}><i className="bi bi-archive me-2"></i>Closed Tickets</Link></li>
          </ul>
        )}
      </li>
    </ul>
  );

  // Render sidebar for Employee
  const renderEmployeeSidebar = () => (
    <ul className="nav nav-pills flex-column sidebar-scroll">
      {/* Dashboard */}
      <li className="sidebar-nav-item">
        <Link to="/" className={`nav-link sidebar-link ${isActive('/') ? 'active' : ''}`}>
          <i className="bi bi-speedometer2 me-2"></i>
          Dashboard
        </Link>
      </li>

      {/* Leads Dropdown */}
      <li className="sidebar-nav-item">
        <button
          className={`nav-link sidebar-dropdown-button ${expandedDropdown === 'leads' ? 'expanded' : ''}`}
          onClick={() => toggleDropdown('leads')}
        >
          <span><i className="bi bi-person-lines-fill me-2"></i>Leads</span>
          <i className={`bi ${expandedDropdown === 'leads' ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
        </button>
        {expandedDropdown === 'leads' && (
          <ul className="sidebar-dropdown-menu">
            <li><Link to="/leads/manage" className={`nav-link sidebar-dropdown-link ${isActive('/leads/manage') ? 'active' : ''}`}><i className="bi bi-list-ul me-2"></i>Manage Leads</Link></li>
            <li><Link to="/leads/recycle-bin" className={`nav-link sidebar-dropdown-link ${isActive('/leads/recycle-bin') ? 'active' : ''}`}><i className="bi bi-trash me-2"></i>Recycle Bin</Link></li>
          </ul>
        )}
      </li>

      {/* Opportunity Dropdown */}
      <li className="sidebar-nav-item">
        <button
          className={`nav-link sidebar-dropdown-button ${expandedDropdown === 'opportunity' ? 'expanded' : ''}`}
          onClick={() => toggleDropdown('opportunity')}
        >
          <span><i className="bi bi-graph-up me-2"></i>Opportunity</span>
          <i className={`bi ${expandedDropdown === 'opportunity' ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
        </button>
        {expandedDropdown === 'opportunity' && (
          <ul className="sidebar-dropdown-menu">
            <li><Link to="/opportunity/manage" className={`nav-link sidebar-dropdown-link ${isActive('/opportunity/manage') ? 'active' : ''}`}><i className="bi bi-list-ul me-2"></i>Manage Opportunity</Link></li>
            <li><Link to="/opportunity/recycle-bin" className={`nav-link sidebar-dropdown-link ${isActive('/opportunity/recycle-bin') ? 'active' : ''}`}><i className="bi bi-trash me-2"></i>Recycle Bin</Link></li>
          </ul>
        )}
      </li>

      {/* Customers Dropdown */}
      <li className="sidebar-nav-item">
        <button
          className={`nav-link sidebar-dropdown-button ${expandedDropdown === 'customers' ? 'expanded' : ''}`}
          onClick={() => toggleDropdown('customers')}
        >
          <span><i className="bi bi-people-fill me-2"></i>Customers</span>
          <i className={`bi ${expandedDropdown === 'customers' ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
        </button>
        {expandedDropdown === 'customers' && (
          <ul className="sidebar-dropdown-menu">
            <li><Link to="/customer/manage" className={`nav-link sidebar-dropdown-link ${isActive('/customer/manage') ? 'active' : ''}`}><i className="bi bi-list-ul me-2"></i>Manage Customers</Link></li>
            <li><Link to="/customer/recycle-bin" className={`nav-link sidebar-dropdown-link ${isActive('/customer/recycle-bin') ? 'active' : ''}`}><i className="bi bi-trash me-2"></i>Recycle Bin</Link></li>
          </ul>
        )}
      </li>

      {/* Catalog Dropdown */}
      <li className="sidebar-nav-item">
        <button
          className={`nav-link sidebar-dropdown-button ${expandedDropdown === 'catalog' ? 'expanded' : ''}`}
          onClick={() => toggleDropdown('catalog')}
        >
          <span><i className="bi bi-journal-text me-2"></i>Catalog</span>
          <i className={`bi ${expandedDropdown === 'catalog' ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
        </button>
        {expandedDropdown === 'catalog' && (
          <ul className="sidebar-dropdown-menu">
            <li><Link to="/catalog/products" className={`nav-link sidebar-dropdown-link ${isActive('/catalog/products') ? 'active' : ''}`}><i className="bi bi-box-seam me-2"></i>Products</Link></li>
            <li><Link to="/catalog/category" className={`nav-link sidebar-dropdown-link ${isActive('/catalog/category') ? 'active' : ''}`}><i className="bi bi-tags me-2"></i>Category</Link></li>
          </ul>
        )}
      </li>

      {/* Tickets Dropdown for Employees */}
      <li className="sidebar-nav-item">
        <button
          className={`nav-link sidebar-dropdown-button ${expandedDropdown === 'tickets' ? 'expanded' : ''}`}
          onClick={() => toggleDropdown('tickets')}
        >
          <span><i className="bi bi-ticket-perforated me-2"></i>Tickets</span>
          <i className={`bi ${expandedDropdown === 'tickets' ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
        </button>
        {expandedDropdown === 'tickets' && (
          <ul className="sidebar-dropdown-menu">
            <li><Link to="/tickets/open" className={`nav-link sidebar-dropdown-link ${isActive('/tickets/open') ? 'active' : ''}`}><i className="bi bi-envelope me-2"></i>Open Tickets</Link></li>
            <li><Link to="/tickets/my-tickets" className={`nav-link sidebar-dropdown-link ${isActive('/tickets/my-tickets') ? 'active' : ''}`}><i className="bi bi-person-workspace me-2"></i>My Tickets</Link></li>
            <li><Link to="/tickets/closed" className={`nav-link sidebar-dropdown-link ${isActive('/tickets/closed') ? 'active' : ''}`}><i className="bi bi-archive me-2"></i>Closed Tickets</Link></li>
          </ul>
        )}
      </li>
    </ul>
  );

  return (
    <div className="sidebar">
      {isCustomer ? renderCustomerSidebar() : 
        AuthService.isEmployeeLoggedIn() ? renderEmployeeSidebar() : renderAdminSidebar()}
      
      <div className="sidebar-footer">
        <div className="sidebar-footer-text">
          <i className="bi bi-info-circle me-1"></i>
          ClientNest CRM v1.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
