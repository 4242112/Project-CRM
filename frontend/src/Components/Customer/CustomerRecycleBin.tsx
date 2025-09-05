/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import CustomerService, { Customer } from "../../services/CustomerService";

const CustomerRecycleBin: React.FC = () => {
  const [deletedCustomers, setDeletedCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState<boolean>(false);
  const [showPermanentDeleteConfirm, setShowPermanentDeleteConfirm] = useState<boolean>(false);

  const fetchDeletedCustomers = async () => {
    setLoading(true);
    try {
      const data = await CustomerService.getDeletedCustomers();
      setDeletedCustomers(data);
    } catch (err) {
      setError("Error fetching deleted Customers. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedCustomers();
  }, []);

  const handleRestore = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowRestoreConfirm(true);
  };

  const handlePermanentDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowPermanentDeleteConfirm(true);
  };

  const confirmRestore = async () => {
    if (!selectedCustomer || !selectedCustomer.id) return;

    setMessage(null);
    setError(null);
    try {
      await CustomerService.restoreCustomer(selectedCustomer.id);
      
      setMessage("Customer restored successfully!");
      setShowRestoreConfirm(false);
      setSelectedCustomer(null);
      await fetchDeletedCustomers(); 
    } catch (err) {
      setError("Error restoring Customer. Please try again.");
    }
  };

  const confirmPermanentDelete = async () => {
    if (!selectedCustomer || !selectedCustomer.id) return;

    setMessage(null);
    setError(null);
    try {
      await CustomerService.permanentlyDeleteCustomer(selectedCustomer.id);
      
      setMessage("Customer permanently deleted successfully!");
      setShowPermanentDeleteConfirm(false);
      setSelectedCustomer(null);
      await fetchDeletedCustomers(); 
    } catch (err) {
      setError("Error permanently deleting Customer. Please try again.");
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Customers Recycle Bin</h2>
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
      ) : deletedCustomers.length === 0 ? (
        <div className="alert alert-info">
          Recycle bin is empty.
        </div>
      ) : (
        <div className="row">
          {deletedCustomers.map((customer) => (
            <div key={customer.id} className="col-md-6 col-lg-4 mb-3">
              <div className="card shadow-sm border">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{customer.name}</h5>
                  <span className="badge bg-secondary">Deleted</span>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="mb-1">
                      <strong>Phone: </strong>{customer.phoneNumber}
                    </div>
                    <div className="mb-1">
                      <strong>Email: </strong>{customer.email}
                    </div>
                    
                  </div>
                  
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleRestore(customer)}
                    >
                      <i className="bi bi-arrow-counterclockwise me-1"></i> Restore
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handlePermanentDelete(customer)}
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
      {selectedCustomer && (
        <div className={`modal fade${showRestoreConfirm ? ' show d-block' : ''}`} tabIndex={-1} style={{ background: showRestoreConfirm ? 'rgba(0,0,0,0.5)' : undefined }} aria-modal="true" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Restore</h5>
                <button type="button" className="btn-close" onClick={() => setShowRestoreConfirm(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to restore this Customer?</p>
                <p><strong>Name:</strong> {selectedCustomer.name}</p>
              </div>
              <div className="modal-footer"></div>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRestoreConfirm(false)}>Cancel</button>
                <button type="button" className="btn btn-success" onClick={confirmRestore}>Restore</button>
              </div>
            </div>
          </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {selectedCustomer && (
        <div className={`modal fade${showPermanentDeleteConfirm ? ' show d-block' : ''}`} tabIndex={-1} style={{ background: showPermanentDeleteConfirm ? 'rgba(0,0,0,0.5)' : undefined }} aria-modal="true" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Permanent Delete</h5>
                <button type="button" className="btn-close" onClick={() => setShowPermanentDeleteConfirm(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to permanently delete this Customer? This action cannot be undone.</p>
                <p><strong>Name:</strong> {selectedCustomer.name}</p>
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

export default CustomerRecycleBin;