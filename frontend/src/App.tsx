import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './Components/MainLayout/MainLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Import Login component
import Login from './Components/Auth/Login';
import CustomerRegister from './Components/Auth/CustomerRegister';
import ResetPassword from './Components/Auth/ResetPassword';
import CustomerDashboard from './Components/CustomerDashboard/CustomerDashboard';

// Import actual components for leads, opportunity and customers
import ManageLeads from './Components/Leads/ManageLeads';
import LeadsRecycleBin from './Components/Leads/LeadRecycleBin';
import LeadViewDetails from './Components/Leads/LeadViewDetails';
import ManageOpportunity from './Components/Opportunity/ManageOpportunity';
import OpportunityRecycleBin from './Components/Opportunity/OpportunityRecycleBin';
import OpportunityViewDetails from './Components/Opportunity/OpportunityViewDetails';

// Import Catalog components
import Category from './Components/Catalog/Category';
import Products from './Components/Catalog/Products';

// Import Dashboard component
import Dashboard from './Components/Dashboard/Dashboard';
import ManageCustomers from './Components/Customer/ManageCustomers';
import CustomerRecycleBin from './Components/Customer/CustomerRecycleBin';
import CustomersViewDetails from './Components/Customer/CustomerViewDetails';

// Import Tickets component
import Tickets from './Components/Tickets/Tickets';
import OpenTickets from './Components/Tickets/OpenTickets';
import MyTickets from './Components/Tickets/MyTickets';
import InProgressTickets from './Components/Tickets/InProgressTickets';
import ClosedTickets from './Components/Tickets/ClosedTickets';
import AdminDashboard from './Components/AdminDashboard/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Login Route - outside MainLayout */}
        <Route path="/login" element={<Login />} />
        
        {/* Legacy Admin Dashboard Route - redirecting to new path */}
        <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        
        {/* Customer Register Route - outside MainLayout */}
        <Route path="/register" element={<CustomerRegister />} />
        
        {/* Reset Password Route - outside MainLayout */}
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Protected Routes - inside MainLayout */}
        <Route path="/" element={<MainLayout />}>
          {/* Dashboard */}
          <Route index element={<Dashboard />} />
          
          {/* Customer Portal Route - moved inside MainLayout */}
          <Route path="customer-portal" element={<CustomerDashboard />} />
          
          {/* Leads Routes */}
          <Route path="leads/manage" element={<ManageLeads />} />
          <Route path="leads/recycle-bin" element={<LeadsRecycleBin />} />
          <Route path="leads/:id" element={<LeadViewDetails />} />
          
          {/* Opportunity Routes */}
          <Route path="opportunity/manage" element={<ManageOpportunity />} />
          <Route path="opportunity/recycle-bin" element={<OpportunityRecycleBin />} />
          <Route path="opportunity/:id" element={<OpportunityViewDetails />} />
          
          {/* Customers Routes */}
          <Route path="customer/manage" element={<ManageCustomers />} />
          <Route path="customer/recycle-bin" element={<CustomerRecycleBin />} />
          <Route path="customer/:id" element={<CustomersViewDetails />} />
          
          {/* Catalog Routes */}
          <Route path="catalog" element={<Dashboard />} />
          <Route path="catalog/products" element={<Products />} />
          <Route path="catalog/category" element={<Category />} />
          
          {/* Tickets Route */}
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets/open" element={<OpenTickets />} />
          <Route path="tickets/my-tickets" element={<MyTickets />} />
          <Route path="tickets/in-progress-tickets" element={<InProgressTickets />} />
          <Route path="tickets/closed" element={<ClosedTickets />} />
          
          {/* Admin Routes */}
          <Route path="admin" element={<Dashboard />} />
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          
          {/* Catch all - redirect to dashboard */}
          <Route path="/*" element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
