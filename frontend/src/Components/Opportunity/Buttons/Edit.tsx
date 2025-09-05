import React, { useState, useEffect } from "react";
import { Opportunity, OpportunitySource } from "../OpportunityCard";
import EmployeeService from "../../../services/EmployeeService";

interface EditOpportunityProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: Opportunity) => Promise<void>;
  opportunity: Opportunity | null;
}

const defaultSources = (Object.values(OpportunitySource) as string[]).map(s => s.toUpperCase());

const EditOpportunity: React.FC<EditOpportunityProps> = ({
  show,
  onClose,
  onSave,
  opportunity
}) => {
  const [form, setForm] = useState<Opportunity | null>(null);
  const [employees, setEmployees] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (show) {
      fetchEmployeeNames();
    }
  }, [show]);

  useEffect(() => {
    if (opportunity && show) {
      setForm(JSON.parse(JSON.stringify(opportunity)));
    } else if (!show) {
      setForm(null);
    }
  }, [opportunity, show]);

  const fetchEmployeeNames = async () => {
    setIsLoading(true);
    try {
      const names = await EmployeeService.getAllEmployeeNames();
      setEmployees(names);
    } catch (error) {
      console.error("Error fetching employee names:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!form) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('lead.')) {
      const leadField = name.split('.')[1];
      setForm({
        ...form,
        lead: {
          ...form.lead,
          [leadField]: value
        }
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form) {
      await onSave(form);
    }
  };

  const availableEmployees = employees.length > 0 ? employees : [];

  return (
    <div className={`modal fade${show ? ' show d-block' : ''}`} tabIndex={-1} style={{ background: show ? 'rgba(0,0,0,0.5)' : undefined }} aria-modal="true" role="dialog">
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Edit Opportunity</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="row">
                {/* Customer Details */}
                <div className="col-md-6 border-end">
                  <h6 className="mb-3 border-bottom pb-2">Customer Details</h6>
                  <div className="mb-3">
                    <label className="form-label">Name *</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-briefcase"></i></span>
                      <input type="text" className="form-control" name="lead.name" placeholder="Opportunity Name" value={form.lead.name} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone *</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                      <input type="text" className="form-control" name="lead.phoneNumber" placeholder="Customer Phone Number" value={form.lead.phoneNumber} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email *</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                      <input type="email" className="form-control" name="lead.email" placeholder="Customer Email" value={form.lead.email} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-geo-alt"></i></span>
                      <input type="text" className="form-control" name="lead.address" placeholder="Address" value={form.lead.address || ""} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">City</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-building"></i></span>
                      <input type="text" className="form-control" name="lead.city" placeholder="City" value={form.lead.city || ""} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">State</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-geo"></i></span>
                      <input type="text" className="form-control" name="lead.state" placeholder="State" value={form.lead.state || ""} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Zip Code</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-123"></i></span>
                      <input type="text" className="form-control" name="lead.zipCode" placeholder="Zip code" value={form.lead.zipCode || ""} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Website</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-globe"></i></span>
                      <input type="text" className="form-control" name="lead.website" placeholder="Website" value={form.lead.website || ""} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Country</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-flag"></i></span>
                      <input type="text" className="form-control" name="lead.country" placeholder="Country" value={form.lead.country || ""} onChange={handleChange} />
                    </div>
                  </div>
                </div>
                
                {/* Opportunity Details */}
                <div className="col-md-6">
                  <h6 className="mb-3 border-bottom pb-2">Opportunity Details</h6>
                  <div className="mb-3">
                    <label className="form-label">Requirement</label>
                    <input type="text" className="form-control" name="lead.requirement" placeholder="Interested In" value={form.lead.requirement || ""} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Expected Revenue</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-cash"></i></span>
                      <input type="number" className="form-control" name="expectedRevenue" placeholder="Expected Revenue" value={form.expectedRevenue || ""} onChange={handleChange} />
                    </div>
                  </div>
                 
                  
                  <div className="mb-3">
                    <label className="form-label">Source *</label>
                    <select className="form-select" name="lead.source" value={form.lead.source || ""} onChange={handleChange} required>
                      <option value="">Select a Source</option>
                      {defaultSources.map((src) => (
                        <option key={src} value={src}>{src}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Assigned To *</label>
                    <select 
                      className="form-select" 
                      name="lead.assignedTo" 
                      value={form.lead.assignedTo || ""}
                      onChange={handleChange}
                      disabled={isLoading}
                      required
                    >
                      <option value="">Select a Staff Member</option>
                      {isLoading ? (
                        <option value="" disabled>Loading employees...</option>
                      ) : (
                        availableEmployees.map((emp) => (
                          <option key={emp} value={emp}>{emp}</option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Comment</label>
                    <textarea className="form-control" name="lead.comment" placeholder="Comment" value={form.lead.comment || ""} onChange={handleChange} rows={2} />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Update Opportunity</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditOpportunity;