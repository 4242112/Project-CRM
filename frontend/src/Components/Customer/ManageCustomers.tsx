/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import EditCustomer from "./Buttons/Edit";
import DeleteCustomer from "./Buttons/Delete";
import CustomerForm from "./CustomerForm";
import CustomerService, { Customer } from "../../services/CustomerService";
import CustomerCard from "./CustomerCard";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Pagination from "../common/Pagination";

const ManageCustomers: React.FC = () => {
  const navigate = useNavigate();
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [Customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const exportToExcel = () => {
    setExportLoading(true);
    try {
      const exportData = filteredCustomers.map(customer => ({
        'ID': customer.id || '',
        'Name': customer.name || '',
        'Email': customer.email || '',
        'Phone Number': customer.phoneNumber || '',
        'Address': customer.address || '',
        'City': customer.city || '',
        'State': customer.state || '',
        'Country': customer.country || '',
        'Type': customer.type || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      const columnWidths = [
        { wch: 5 },  
        { wch: 25 }, 
        { wch: 30 },
        { wch: 15 }, 
        { wch: 20 },
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 15 },
        { wch: 18 },
        { wch: 18 }, 
        { wch: 18 }  
      ];
      worksheet['!cols'] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const currentDate = new Date().toISOString().split('T')[0];
      saveAs(data, `Customers_Export_${currentDate}.xlsx`);
      
      setMessage('Customers exported to Excel successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      setError('Failed to export customers to Excel.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setExportLoading(false);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await CustomerService.getAllCustomers();
      setCustomers(data);
      
      applyFilter(activeFilter, data);
    } catch (err: unknown) {
      setError(`Error fetching Customers: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilter = (filter: string, customers: Customer[] = Customers) => {
    if (filter === "ALL") {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer => customer.type === filter);
      setFilteredCustomers(filtered);
    }
  };
  
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    applyFilter(filter);
    setDropdownOpen(false);
  };

  useEffect(() => {
    fetchCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleCloseCustomerForm = () => setShowCustomerForm(false);
  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setSelectedCustomer(null);
  };
  const handleCloseDeleteForm = () => {
    setShowDeleteForm(false);
    setSelectedCustomer(null);
  };

  const handleSaveCustomer = async (data: Customer) => {
    setMessage(null);
    setError(null);
    try {
      await CustomerService.createCustomer(data);
      setMessage("Customer saved successfully!");
      setShowCustomerForm(false);
      await fetchCustomers();
    } catch (err) {
      setError("Error saving Customer. Please try again.");
    }
  };
  
  const handleEditCustomer= (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowEditForm(true);
    setMessage(null);
    setError(null);
  };
  
  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDeleteForm(true);
    setMessage(null);
    setError(null);
  };
  
  const handleUpdateCustomer = async (data: Customer) => {
    setMessage(null);
    setError(null);
    try {
      if (data.id) {
        await CustomerService.updateCustomer(data.id, data);
        setMessage("Customer updated successfully!");
        setShowEditForm(false);
        setSelectedCustomer(null);
        await fetchCustomers();
      }
    } catch (err) {
      setError("Error updating Customer. Please try again.");
    }
  };
  
  const handleConfirmDelete = async () => {
    if (!selectedCustomer || !selectedCustomer.id) return;
    
    setMessage(null);
    setError(null);
    try {
      console.log('Deleting customer with ID:', selectedCustomer.id);
      
      await CustomerService.deleteCustomer(selectedCustomer.id);
      
      console.log('Delete API call completed successfully');
      
      setCustomers(prevCustomers => 
        prevCustomers.filter(customer => customer.id !== selectedCustomer.id)
      );
      
      setFilteredCustomers(prevFiltered => 
        prevFiltered.filter(customer => customer.id !== selectedCustomer.id)
      );
      
      setMessage("Customer moved to recycle bin successfully!");
      setShowDeleteForm(false);
      setSelectedCustomer(null);
      
      await fetchCustomers();
    } catch (err) {
      console.error("Error in handleConfirmDelete:", err);
      setError("Error moving Customer to recycle bin. Please try again.");
    }
  };

  const handleViewDetails = (customer: Customer) => {
    if (customer.id) {
      navigate(`/customer/${customer.id}`);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      applyFilter(activeFilter);
    } else {
      const lowercasedQuery = query.toLowerCase();
      const filtered = Customers.filter(customer => 
        customer.name?.toLowerCase().includes(lowercasedQuery) ||
        customer.email?.toLowerCase().includes(lowercasedQuery) ||
        customer.phoneNumber?.toLowerCase().includes(lowercasedQuery) ||
        customer.address?.toLowerCase().includes(lowercasedQuery) ||
        customer.city?.toLowerCase().includes(lowercasedQuery) ||
        customer.country?.toLowerCase().includes(lowercasedQuery) ||
        customer.type?.toLowerCase().includes(lowercasedQuery)
      );

      setFilteredCustomers(
        activeFilter === "ALL" ? filtered : filtered.filter(customer => customer.type === activeFilter)
      );
    }
  };

  // Get current customers for the active page
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);

  // Change page handler
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded" style={{
        backgroundColor: '#1a2236',
        color: 'white',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <h2 className="m-0">Manage Customers</h2>
        <div className="d-flex gap-2 align-items-center">
          {/* Custom Filter Dropdown */}
          <div className="position-relative" ref={dropdownRef}>
            <button 
              className="btn btn-outline-light d-flex align-items-center" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <i className="bi bi-funnel me-1"></i>
              <span>
                {activeFilter === "ALL" 
                  ? "All Customers" 
                  : activeFilter === "NEW" 
                    ? "New Customers" 
                    : "Existing Customers"
                }
              </span>
              {activeFilter !== "ALL" && (
                <span className="badge bg-light text-dark ms-2">
                  {filteredCustomers.length}
                </span>
              )}
              <i className={`bi bi-chevron-${dropdownOpen ? 'up' : 'down'} ms-2`}></i>
            </button>
            
            {dropdownOpen && (
              <div className="dropdown-menu show position-absolute" style={{ width: '100%' }}>
                <button 
                  className={`dropdown-item ${activeFilter === "ALL" ? "active" : ""}`} 
                  onClick={() => handleFilterChange("ALL")}
                >
                  <i className="bi bi-people me-2"></i>All Customers
                </button>
                <button 
                  className={`dropdown-item ${activeFilter === "NEW" ? "active" : ""}`} 
                  onClick={() => handleFilterChange("NEW")}
                >
                  <i className="bi bi-star me-2"></i>New Customers
                </button>
                <button 
                  className={`dropdown-item ${activeFilter === "EXISTING" ? "active" : ""}`} 
                  onClick={() => handleFilterChange("EXISTING")}
                >
                  <i className="bi bi-person-check me-2"></i>Existing Customers
                </button>
              </div>
            )}
          </div>
          
          <button 
            className="btn btn-success me-2" 
            onClick={exportToExcel}
            disabled={exportLoading || loading || filteredCustomers.length === 0}
          >
            {exportLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Exporting...
              </>
            ) : (
              <>
                <i className="bi bi-file-earmark-excel me-2"></i> Export to Excel
              </>
            )}
          </button>
          
        </div>
      </div>
      
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="mb-4">
        <input 
          type="text" 
          className="form-control"
          placeholder="Search customers by name, email, phone, address..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ 
            backgroundColor: '#f8f9fa', 
            borderColor: '#ced4da',
            borderRadius: '0.375rem',
            padding: '0.375rem 0.75rem'
          }}
        />
      </div>
      
      {loading ? (
        <div>Loading Customers...</div>
      ) : (
        filteredCustomers.length === 0 ? (
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            No {activeFilter !== "ALL" ? activeFilter.toLowerCase() : ""} customers found.
          </div>
        ) : (
          currentCustomers.map((Customer) => (
            <CustomerCard
              key={Customer.id}
              customer={Customer}
              onViewDetails={() => handleViewDetails(Customer)}
              onEdit={() => handleEditCustomer(Customer)}
              onConvert={() => {}}
              onDelete={() => handleDeleteCustomer(Customer)}
            />
          ))
        )
      )}
      
      {/* Pagination Component */}
      <Pagination
        itemsPerPage={customersPerPage}
        totalItems={filteredCustomers.length}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
      
      <CustomerForm
        show={showCustomerForm}
        onClose={handleCloseCustomerForm}
        onSave={handleSaveCustomer}
      />
      <EditCustomer
        show={showEditForm}
        onClose={handleCloseEditForm}
        onSave={handleUpdateCustomer}
        customer={selectedCustomer}
      />
      <DeleteCustomer
        show={showDeleteForm}
        onClose={handleCloseDeleteForm}
        onConfirm={handleConfirmDelete}
        Customer={selectedCustomer}
      />
    </div>
  );
};

export default ManageCustomers;