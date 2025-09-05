import React, { useState, useEffect } from "react";
import { LeadSource } from "../../../services/LeadService";
import { Lead } from "../../../services/LeadService";
import EmployeeService from "../../../services/EmployeeService";

interface EditLeadsProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: Lead) => Promise<void>;
  lead: Lead | null;
}

const defaultSources = (Object.values(LeadSource) as string[]).map(s => s.toUpperCase());

const EditLeads: React.FC<EditLeadsProps> = ({
  show,
  onClose,
  onSave,
  lead
}) => {
  const [form, setForm] = useState<Lead | null>(null);
  const [employees, setEmployees] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (show) {
      fetchEmployeeNames();
    }
  }, [show]);

  useEffect(() => {
    if (lead && show) {
      setForm({ ...lead });
    } else if (!show) {
      setForm(null);
    }
  }, [lead, show]);

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
    setForm({ ...form, [name]: value });
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
              <h5 className="modal-title">Edit Lead</h5>
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
                      <input type="text" className="form-control" name="name" placeholder="Lead Name" value={form.name} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone *</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                      <input type="text" className="form-control" name="phoneNumber" placeholder="Customer Phone Number" value={form.phoneNumber} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email *</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                      <input type="email" className="form-control" name="email" placeholder="Customer Email" value={form.email} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-geo-alt"></i></span>
                      <input type="text" className="form-control" name="address" placeholder="Address" value={form.address || ""} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">City</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-building"></i></span>
                      <input type="text" className="form-control" name="city" placeholder="City" value={form.city || ""} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">State</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-geo"></i></span>
                      <input type="text" className="form-control" name="state" placeholder="State" value={form.state || ""} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Zip Code</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-123"></i></span>
                      <input type="text" className="form-control" name="zipCode" placeholder="Zip code" value={form.zipCode || ""} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Website</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-globe"></i></span>
                      <input type="text" className="form-control" name="website" placeholder="Website" value={form.website || ""} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Country</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-flag"></i></span>
                      <input type="text" className="form-control" name="country" placeholder="Country" value={form.country || ""} onChange={handleChange} />
                    </div>
                  </div>
                </div>
                
                {/* Lead Details */}
                <div className="col-md-6">
                  <h6 className="mb-3 border-bottom pb-2">Lead Details</h6>
                  <div className="mb-3">
                    <label className="form-label">Requirement</label>
                    <input type="text" className="form-control" name="requirement" placeholder="Interested In" value={form.requirement || ""} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Expected Revenue (₹)</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-currency-rupee"></i></span>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="expectedRevenue" 
                        placeholder="Expected Revenue" 
                        value={form.expectedRevenue || ""} 
                        onChange={handleChange}
                        min="0"
                        step="0.01" 
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Conversion Probability (%)</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-percent"></i></span>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="conversionProbability" 
                        placeholder="Probability of Conversion" 
                        value={form.conversionProbability || ""} 
                        onChange={handleChange}
                        min="0"
                        max="100"
                        step="1" 
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Source *</label>
                    <select className="form-select" name="source" value={form.source || ""} onChange={handleChange} required>
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
                      name="assignedTo" 
                      value={form.assignedTo || ""} 
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
                    <textarea className="form-control" name="comment" placeholder="Comment" value={form.comment || ""} onChange={handleChange} rows={2} />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Update Lead</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditLeads;