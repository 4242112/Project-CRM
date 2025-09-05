/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import EditOpportunity from "./Buttons/Edit";
import DeleteOpportunity from "./Buttons/Delete";
import OpportunityCard, { Opportunity } from "./OpportunityCard";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import OpportunityForm from "./OpportunityForm";
import Pagination from "../common/Pagination";

const API_URL = "http://localhost:8080/api/opportunities";

const ManageOpportunity: React.FC = () => {
  const navigate = useNavigate();
  const [showOpportunityForm, setShowOpportunityForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [Opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      const exportData = filteredOpportunities.map(opportunity => ({
        'ID': opportunity.id || '',
        'Stage': opportunity.stage || '',
        'Expected Revenue': opportunity.expectedRevenue || '',
        'Probability': opportunity.conversionProbability ? `${opportunity.conversionProbability}%` : '',
        'Lead Name': opportunity.lead?.name || '',
        'Lead Email': opportunity.lead?.email || '',
        'Lead Phone': opportunity.lead?.phoneNumber || '',
        'Quotation Status': opportunity.quotationId ? 'Created' : 'Not Created',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const columnWidths = [
        { wch: 5 },
        { wch: 25 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 25 },
        { wch: 30 },
        { wch: 15 },
        { wch: 18 },
        { wch: 18 },
        { wch: 20 }
      ];
      worksheet['!cols'] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Opportunities');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const currentDate = new Date().toISOString().split('T')[0];
      saveAs(data, `Opportunities_Export_${currentDate}.xlsx`);

      setMessage('Opportunities exported to Excel successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      setError('Failed to export opportunities to Excel.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setExportLoading(false);
    }
  };

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch Opportunities: ${res.status} - ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        throw new Error("API returned unexpected data format");
      }
      data.reverse();
      setOpportunities(data);
      applyFilter(activeFilter, data);
    } catch (err: unknown) {
      setError(`Error fetching Opportunities: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (filter: string, opportunities: Opportunity[] = Opportunities) => {
    if (filter === "ALL") {
      setFilteredOpportunities(opportunities);
    } else if (filter === "WITH_QUOTATION") {
      const filtered = opportunities.filter(opportunity => opportunity.quotationId);
      setFilteredOpportunities(filtered);
    } else if (filter === "WITHOUT_QUOTATION") {
      const filtered = opportunities.filter(opportunity => !opportunity.quotationId);
      setFilteredOpportunities(filtered);
    }
  };
  
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    applyFilter(filter);
    setDropdownOpen(false);
  };

  useEffect(() => {
    fetchOpportunities();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleCloseOpportunityForm = () => setShowOpportunityForm(false);
  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setSelectedOpportunity(null);
  };
  const handleCloseDeleteForm = () => {
    setShowDeleteForm(false);
    setSelectedOpportunity(null);
  };

  const handleSaveOpportunity = async (data: Opportunity) => {
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save Opportunity");
      setMessage("Opportunity saved successfully!");
      setShowOpportunityForm(false);
      await fetchOpportunities();
    } catch {
      setError("Error saving Opportunity. Please try again.");
    }
  };
  
  const handleEditOpportunity= (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowEditForm(true);
    setMessage(null);
    setError(null);
  };
  
  const handleDeleteOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowDeleteForm(true);
    setMessage(null);
    setError(null);
  };
  
  const handleUpdateOpportunity = async (data: Opportunity) => {
    setMessage(null);
    setError(null);
    try {
      const url = `${API_URL}/${data.id}`;
      
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update Opportunity: ${response.status}`);
      }
      
      setMessage("Opportunity updated successfully!");
      setShowEditForm(false);
      setSelectedOpportunity(null);
      await fetchOpportunities();
    } catch (err) {
      setError("Error updating Opportunity. Please try again.");
    }
  };
  
  const handleConfirmDelete = async () => {
    if (!selectedOpportunity) return;
    
    setMessage(null);
    setError(null);
    try {
      const url = `${API_URL}/${selectedOpportunity.id}`;
      
      const response = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to move Opportunity to recycle bin: ${response.status}`);
      }
      
      setMessage("Opportunity moved to recycle bin successfully!");
      setShowDeleteForm(false);
      setSelectedOpportunity(null);
      await fetchOpportunities();
    } catch (err) {
      setError("Error moving Opportunity to recycle bin. Please try again.");
    }
  };

  const handleViewDetails = (opportunity: Opportunity) => {
    if (opportunity.id) {
      navigate(`/opportunity/${opportunity.id}`);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredOpportunities(Opportunities);
    } else {
      const lowercasedQuery = query.toLowerCase();
      const filtered = Opportunities.filter(opportunity => 
        opportunity.lead?.name?.toLowerCase().includes(lowercasedQuery) ||
        opportunity.lead?.email?.toLowerCase().includes(lowercasedQuery) ||
        opportunity.lead?.phoneNumber?.toLowerCase().includes(lowercasedQuery) ||
        opportunity.stage?.toLowerCase().includes(lowercasedQuery) ||
        opportunity.expectedRevenue?.toString().toLowerCase().includes(lowercasedQuery) ||
        opportunity.conversionProbability?.toString().toLowerCase().includes(lowercasedQuery)
      );
      setFilteredOpportunities(filtered);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOpportunities.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOpportunities.length / itemsPerPage);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded" style={{
        backgroundColor: '#1a2236',
        color: 'white',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <h2 className="m-0">Manage Opportunities</h2>
        <div className="d-flex gap-2 align-items-center">
          <div className="position-relative" ref={dropdownRef}>
            <button 
              className="btn btn-outline-light d-flex align-items-center" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <i className="bi bi-funnel me-1"></i>
              <span>
                {activeFilter === "ALL" 
                  ? "All Opportunities" 
                  : activeFilter === "WITH_QUOTATION" 
                    ? "With Quotation" 
                    : "Without Quotation"
                }
              </span>
              {activeFilter !== "ALL" && (
                <span className="badge bg-light text-dark ms-2">
                  {filteredOpportunities.length}
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
                  <i className="bi bi-grid me-2"></i>All Opportunities
                </button>
                <button 
                  className={`dropdown-item ${activeFilter === "WITH_QUOTATION" ? "active" : ""}`} 
                  onClick={() => handleFilterChange("WITH_QUOTATION")}
                >
                  <i className="bi bi-file-earmark-check me-2"></i>With Quotation
                </button>
                <button 
                  className={`dropdown-item ${activeFilter === "WITHOUT_QUOTATION" ? "active" : ""}`} 
                  onClick={() => handleFilterChange("WITHOUT_QUOTATION")}
                >
                  <i className="bi bi-file-earmark-x me-2"></i>Without Quotation
                </button>
              </div>
            )}
          </div>
          
          <button 
            className="btn btn-success me-2" 
            onClick={exportToExcel}
            disabled={exportLoading || loading || filteredOpportunities.length === 0}
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
          placeholder="Search opportunities by name, email, stage, revenue..."
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
        <div>Loading Opportunities...</div>
      ) : (
        currentItems.length === 0 ? (
          <div className="text-muted">No Opportunities found.</div>
        ) : (
          currentItems.map((Opportunity) => (
            <OpportunityCard
              key={Opportunity.id}
              opportunity={Opportunity}
              onViewDetails={() => handleViewDetails(Opportunity)}
              onEdit={() => handleEditOpportunity(Opportunity)}
              
              onDelete={() => handleDeleteOpportunity(Opportunity)}
            />
          ))
        )
      )}
      
      <div className="d-flex justify-content-center mt-4">
        <Pagination 
          currentPage={currentPage} 
          totalItems={filteredOpportunities.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage} 
        />
      </div>
      
      <OpportunityForm
        show={showOpportunityForm}
        onClose={handleCloseOpportunityForm}
        onSave={handleSaveOpportunity}
      />
      <EditOpportunity 
        show={showEditForm}
        onClose={handleCloseEditForm}
        onSave={handleUpdateOpportunity}
        opportunity={selectedOpportunity}
      />
      <DeleteOpportunity
        show={showDeleteForm}
        onClose={handleCloseDeleteForm}
        onConfirm={handleConfirmDelete}
        Opportunity={selectedOpportunity}
      />
    </div>
  );
};

export default ManageOpportunity;