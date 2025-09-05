/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { Lead } from "../../services/LeadService";

const API_URL = "http://localhost:8080/api/leads";

const RecycleBin: React.FC = () => {
  const [deletedLeads, setDeletedLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState<boolean>(false);
  const [showPermanentDeleteConfirm, setShowPermanentDeleteConfirm] = useState<boolean>(false);

  const fetchDeletedLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/recycle-bin`);
      if (!response.ok) {
        throw new Error(`Failed to fetch deleted leads: ${response.status}`);
      }
      const data = await response.json();
      setDeletedLeads(data);
    } catch (err) {
      setError("Error fetching deleted leads. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedLeads();
  }, []);

  const handleRestore = (lead: Lead) => {
    setSelectedLead(lead);
    setShowRestoreConfirm(true);
  };

  const handlePermanentDelete = (lead: Lead) => {
    setSelectedLead(lead);
    setShowPermanentDeleteConfirm(true);
  };

  const confirmRestore = async () => {
    if (!selectedLead) return;

    setMessage(null);
    setError(null);
    try {
      const url = `${API_URL}/restore/${selectedLead.id}`;
      
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to restore lead: ${response.status}`);
      }
      
      setMessage("Lead restored successfully!");
      setShowRestoreConfirm(false);
      setSelectedLead(null);
      await fetchDeletedLeads(); 
    } catch (err) {
      setError("Error restoring lead. Please try again.");
    }
  };

  const confirmPermanentDelete = async () => {
    if (!selectedLead) return;

    setMessage(null);
    setError(null);
    try {
      const url = `${API_URL}/delete-permanent/${selectedLead.id}`;
      
      const response = await fetch(url, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to permanently delete lead: ${response.status}`);
      }
      
      setMessage("Lead permanently deleted successfully!");
      setShowPermanentDeleteConfirm(false);
      setSelectedLead(null);
      await fetchDeletedLeads(); 
    } catch (err) {
      setError("Error permanently deleting lead. Please try again.");
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Leads Recycle Bin</h2>
        <button 
          className="btn btn-outline-secondary"
          onClick={() => window.history.back()}
        >
          <i className="bi bi-arrow-left"></i> Back
        </button>
      </div>

      {message && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage(null)} aria-label="Close"></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : deletedLeads.length === 0 ? (
        <div className="alert alert-info">
          Recycle bin is empty.
        </div>
      ) : (
        <div className="row">
          {deletedLeads.map((lead) => (
            <div key={lead.id} className="col-md-6 col-lg-4 mb-3">
              <div className="card shadow-sm border">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{lead.name}</h5>
                  <span className="badge bg-secondary">Deleted</span>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="mb-1">
                      <strong>Phone: </strong>{lead.phoneNumber}
                    </div>
                    <div className="mb-1">
                      <strong>Email: </strong>{lead.email}
                    </div>
                    <div className="mb-1">
                      <strong>Assigned To: </strong>{lead.assignedTo || 'Not Assigned'}
                    </div>
                    {lead.requirement && (
                      <div className="mb-1">
                        <strong>Interested In: </strong>{lead.requirement}
                      </div>
                    )}
                  </div>
                  
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleRestore(lead)}
                    >
                      <i className="bi bi-arrow-counterclockwise me-1"></i> Restore
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handlePermanentDelete(lead)}
                    >
                      <i className="bi bi-trash me-1"></i> Delete Permanently
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {selectedLead && (
        <div className={`modal fade${showRestoreConfirm ? ' show d-block' : ''}`} tabIndex={-1} style={{ background: showRestoreConfirm ? 'rgba(0,0,0,0.5)' : undefined }} aria-modal="true" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Restore</h5>
                <button type="button" className="btn-close" onClick={() => setShowRestoreConfirm(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to restore this lead?</p>
                <p><strong>Name:</strong> {selectedLead.name}</p>
              </div>
              <div className="modal-footer"></div>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRestoreConfirm(false)}>Cancel</button>
                <button type="button" className="btn btn-success" onClick={confirmRestore}>Restore</button>
              </div>
            </div>
          </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {selectedLead && (
        <div className={`modal fade${showPermanentDeleteConfirm ? ' show d-block' : ''}`} tabIndex={-1} style={{ background: showPermanentDeleteConfirm ? 'rgba(0,0,0,0.5)' : undefined }} aria-modal="true" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Permanent Delete</h5>
                <button type="button" className="btn-close" onClick={() => setShowPermanentDeleteConfirm(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to permanently delete this lead? This action cannot be undone.</p>
                <p><strong>Name:</strong> {selectedLead.name}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPermanentDeleteConfirm(false)}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={confirmPermanentDelete}>Delete Permanently</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecycleBin;