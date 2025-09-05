/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import OpportunityService, { Opportunity } from "../../services/OpportunityService";

const RecycleBin: React.FC = () => {
  const [deletedOpportunities, setDeletedOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState<boolean>(false);
  const [showPermanentDeleteConfirm, setShowPermanentDeleteConfirm] = useState<boolean>(false);

  const fetchDeletedOpportunities = async () => {
    setLoading(true);
    try {
      const data = await OpportunityService.getRecycleBinOpportunities();
      setDeletedOpportunities(data);
    } catch (err) {
      setError("Error fetching deleted opportunities. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedOpportunities();
  }, []);

  const handleRestore = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowRestoreConfirm(true);
  };

  const handlePermanentDelete = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowPermanentDeleteConfirm(true);
  };

  const confirmRestore = async () => {
    if (!selectedOpportunity) return;

    setMessage(null);
    setError(null);
    try {
      await OpportunityService.restoreOpportunity(selectedOpportunity.id!);
      
      setMessage("Opportunity restored successfully!");
      setShowRestoreConfirm(false);
      setSelectedOpportunity(null);
      await fetchDeletedOpportunities(); 
    } catch (err) {
      setError("Error restoring Opportunity. Please try again.");
    }
  };

  const confirmPermanentDelete = async () => {
    if (!selectedOpportunity) return;

    setMessage(null);
    setError(null);
    try {
      await OpportunityService.permanentDeleteOpportunity(selectedOpportunity.id!);
      
      setMessage("Opportunity permanently deleted successfully!");
      setShowPermanentDeleteConfirm(false);
      setSelectedOpportunity(null);
      await fetchDeletedOpportunities(); 
    } catch (err) {
      setError("Error permanently deleting Opportunity. Please try again.");
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Opportunities Recycle Bin</h2>
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
      ) : deletedOpportunities.length === 0 ? (
        <div className="alert alert-info">
          Recycle bin is empty.
        </div>
      ) : (
        <div className="row">
          {deletedOpportunities.map((opportunity) => (
            <div key={opportunity.id} className="col-md-6 col-lg-4 mb-3">
              <div className="card shadow-sm border">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{opportunity.lead.name}</h5>
                  <span className="badge bg-secondary">Deleted</span>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="mb-1">
                      <strong>Phone: </strong>{opportunity.lead.phoneNumber}
                    </div>
                    <div className="mb-1">
                      <strong>Email: </strong>{opportunity.lead.email}
                    </div>
                    <div className="mb-1">
                      <strong>Assigned To: </strong>{opportunity.lead.assignedTo || 'Not Assigned'}
                    </div>
                    {opportunity.lead.requirement && (
                      <div className="mb-1">
                        <strong>Interested In: </strong>{opportunity.lead.requirement}
                      </div>
                    )}
                  </div>
                  
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleRestore(opportunity)}
                    >
                      <i className="bi bi-arrow-counterclockwise me-1"></i> Restore
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handlePermanentDelete(opportunity)}
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
      {selectedOpportunity && (
        <div className={`modal fade${showRestoreConfirm ? ' show d-block' : ''}`} tabIndex={-1} style={{ background: showRestoreConfirm ? 'rgba(0,0,0,0.5)' : undefined }} aria-modal="true" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Restore</h5>
                <button type="button" className="btn-close" onClick={() => setShowRestoreConfirm(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to restore this Opportunity?</p>
                <p><strong>Name:</strong> {selectedOpportunity.lead.name}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRestoreConfirm(false)}>Cancel</button>
                <button type="button" className="btn btn-success" onClick={confirmRestore}>Restore</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {selectedOpportunity && (
        <div className={`modal fade${showPermanentDeleteConfirm ? ' show d-block' : ''}`} tabIndex={-1} style={{ background: showPermanentDeleteConfirm ? 'rgba(0,0,0,0.5)' : undefined }} aria-modal="true" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Permanent Delete</h5>
                <button type="button" className="btn-close" onClick={() => setShowPermanentDeleteConfirm(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to permanently delete this Opportunity? This action cannot be undone.</p>
                <p><strong>Name:</strong> {selectedOpportunity.lead.name}</p>
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