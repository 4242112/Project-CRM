/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import LeadCard from "./LeadCard";
import { Lead } from "../../services/LeadService";
import LeadForm from "./LeadForm";
import EditLeads from "./Buttons/Edit";
import DeleteLead from "./Buttons/Delete";
import { Modal, Button } from "react-bootstrap";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Pagination from "../common/Pagination";

const API_URL = "http://localhost:8080/api/leads";
const OPPORTUNITY_URL = "http://localhost:8080/api/opportunities";

const ManageLeads: React.FC = () => {
  const navigate = useNavigate();
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [showConvertConfirm, setShowConvertConfirm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [leadsPerPage] = useState<number>(10);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLeads(leads);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = leads.filter(lead => 
        lead.name?.toLowerCase().includes(query) || 
        lead.email?.toLowerCase().includes(query) || 
        lead.phoneNumber?.toLowerCase().includes(query) ||
        lead.requirement?.toLowerCase().includes(query) ||
        lead.source?.toLowerCase().includes(query) ||
        lead.assignedTo?.toLowerCase().includes(query)
      );
      setFilteredLeads(filtered);
    }
  }, [searchQuery, leads]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const exportToExcel = () => {
    setExportLoading(true);
    try {
      const exportData = leads.map(lead => ({
        'ID': lead.id || '',
        'Name': lead.name || '',
        'Email': lead.email || '',
        'Phone Number': lead.phoneNumber || '',
        'Requirement': lead.requirement || '',
        'Expected Revenue': lead.expectedRevenue || '',
        'Conversion Probability': lead.conversionProbability ? `${lead.conversionProbability}%` : '',
        'Source': lead.source || '',
        'Assigned To': lead.assignedTo || '',
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
        { wch: 12 }, 
        { wch: 15 }, 
        { wch: 20 }, 
        { wch: 18 },
        { wch: 18 } 
      ];
      worksheet['!cols'] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const currentDate = new Date().toISOString().split('T')[0];
      saveAs(data, `Leads_Export_${currentDate}.xlsx`);
      
      setMessage('Leads exported to Excel successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      setError('Failed to export leads to Excel.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setExportLoading(false);
    }
  };

  const fetchLeads = async () => {
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
        throw new Error(`Failed to fetch leads: ${res.status} - ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        throw new Error("API returned unexpected data format");
      }
      data.reverse();
      setLeads(data);
    } catch (err: unknown) {
      setError(`Error fetching leads: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleAddLead = () => {
    setShowLeadForm(true);
    setMessage(null);
    setError(null);
  };
  
  const handleCloseLeadForm = () => setShowLeadForm(false);
  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setSelectedLead(null);
  };
  const handleCloseDeleteForm = () => {
    setShowDeleteForm(false);
    setSelectedLead(null);
  };
  const handleCloseConvertConfirm = () => {
    setShowConvertConfirm(false);
    setSelectedLead(null);
  };

  const handleSaveLead = async (data: Lead) => {
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save lead");
      setMessage("Lead saved successfully!");
      setShowLeadForm(false);
      await fetchLeads();
    } catch {
      setError("Error saving lead. Please try again.");
    }
  };
  
  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowEditForm(true);
    setMessage(null);
    setError(null);
  };
  
  const handleDeleteLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowDeleteForm(true);
    setMessage(null);
    setError(null);
  };
  
  const handleConvertLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowConvertConfirm(true);
    setMessage(null);
    setError(null);
  };
  
  const handleConfirmConvert = async () => {
    if (!selectedLead || !selectedLead.id) {
      setError("Cannot convert lead: Lead ID is missing");
      return;
    }
    
    setMessage(null);
    setError(null);
    
    try {
      const conversionData = {
        expectedRevenue: selectedLead.expectedRevenue || 0,
        conversionProbability: selectedLead.conversionProbability || 50
      };
      
      const response = await fetch(`${OPPORTUNITY_URL}/from-lead/${selectedLead.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(conversionData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to convert lead: ${response.status}`);
      }
      
      setMessage("Lead converted to opportunity successfully!");
      setShowConvertConfirm(false);
      setSelectedLead(null);
      await fetchLeads();
    } catch (err) {
      setError("Error converting lead to opportunity. Please try again.");
      console.error(err);
    }
  };
  
  const handleUpdateLead = async (data: Lead) => {
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
        throw new Error(`Failed to update lead: ${response.status}`);
      }
      
      setMessage("Lead updated successfully!");
      setShowEditForm(false);
      setSelectedLead(null);
      await fetchLeads();
    } catch (err) {
      setError("Error updating lead. Please try again.");
    }
  };
  
  const handleConfirmDelete = async () => {
    if (!selectedLead) return;
    
    setMessage(null);
    setError(null);
    try {
      const url = `${API_URL}/${selectedLead.id}`;
      
      const response = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to move lead to recycle bin: ${response.status}`);
      }
      
      setMessage("Lead moved to recycle bin successfully!");
      setShowDeleteForm(false);
      setSelectedLead(null);
      await fetchLeads();
    } catch (err) {
      setError("Error moving lead to recycle bin. Please try again.");
    }
  };

  const handleViewDetails = (lead: Lead) => {
    if (lead.id) {
      navigate(`/leads/${lead.id}`);
    }
  };

  // Pagination logic
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded" style={{
        backgroundColor: '#1a2236',
        color: 'white',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <h2 className="m-0">Manage Leads</h2>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-success me-2" 
            onClick={exportToExcel}
            disabled={exportLoading || loading || leads.length === 0}
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
          <button className="btn btn-light" onClick={handleAddLead}>
            <i className="bi bi-plus-lg me-1"></i> Add Lead
          </button>
        </div>
      </div>
      
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="mb-4">
        <input 
          type="text" 
          className="form-control"
          placeholder="Search leads by name, email, phone, or requirement..."
          value={searchQuery}
          onChange={handleSearch}
          style={{ 
            backgroundColor: '#f8f9fa', 
            borderColor: '#ced4da',
            borderRadius: '0.375rem',
            padding: '0.375rem 0.75rem'
          }}
        />
      </div>
      
      {loading ? (
        <div>Loading leads...</div>
      ) : (
        currentLeads.length === 0 ? (
          <div className="text-muted">No leads found.</div>
        ) : (
          currentLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onViewDetails={() => handleViewDetails(lead)}
              onEdit={() => handleEditLead(lead)}
              onConvert={() => handleConvertLead(lead)}
              onDelete={() => handleDeleteLead(lead)}
            />
          ))
        ))
      }
      
      <LeadForm
        show={showLeadForm}
        onClose={handleCloseLeadForm}
        onSave={handleSaveLead}
      />
      <EditLeads 
        show={showEditForm}
        onClose={handleCloseEditForm}
        onSave={handleUpdateLead}
        lead={selectedLead}
      />
      <DeleteLead
        show={showDeleteForm}
        onClose={handleCloseDeleteForm}
        onConfirm={handleConfirmDelete}
        lead={selectedLead}
      />

      {/* Confirmation Modal for Lead Conversion */}
      <Modal show={showConvertConfirm} onHide={handleCloseConvertConfirm} centered>
        <Modal.Header closeButton>
          <Modal.Title>Convert Lead to Opportunity</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLead && (
            <>
              <p>Are you sure you want to convert this lead to an opportunity?</p>
              <div className="lead-info p-3 bg-light rounded mb-3">
                <p className="mb-1"><strong>Name:</strong> {selectedLead.name}</p>
                <p className="mb-1"><strong>Requirement:</strong> {selectedLead.requirement}</p>
                {selectedLead.expectedRevenue && (
                  <p className="mb-1"><strong>Expected Revenue:</strong> ₹{selectedLead.expectedRevenue}</p>
                )}
                {selectedLead.conversionProbability && (
                  <p className="mb-1"><strong>Conversion Probability:</strong> {selectedLead.conversionProbability}%</p>
                )}
              </div>
              <p className="text-muted">
                <small>
                  <i className="bi bi-info-circle me-1"></i>
                  Once converted, this lead will be archived and a new opportunity will be created.
                </small>
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConvertConfirm}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleConfirmConvert}>
            Convert to Opportunity
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredLeads.length}
        itemsPerPage={leadsPerPage}
        onPageChange={(page: number) => setCurrentPage(page)}
      />
    </div>
  );
};

export default ManageLeads;