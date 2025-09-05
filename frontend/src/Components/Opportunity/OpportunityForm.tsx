import React, { useState, useEffect } from "react";
import { Opportunity, OpportunitySource } from "./OpportunityCard";
import EmployeeService from "../../services/EmployeeService";

interface OpportunityFormProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: Opportunity) => Promise<void>;
  sourceOptions?: string[];
  employeeOptions?: string[];
}

const defaultSources = (Object.values(OpportunitySource) as string[]).map(s => s.toUpperCase());

const initialForm: Opportunity = {
  stage: "NEW",
  lead: {
    id: undefined,
    name: "",
    phoneNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    website: "",
    country: "",
    requirement: "",
    assignedTo: "",
    stage: ""
  },
  expectedRevenue: 0,
  conversionProbability: 0
};

const OpportunityForm: React.FC<OpportunityFormProps> = ({
  show,
  onClose,
  onSave,
  sourceOptions = defaultSources,
  employeeOptions = [],
}) => {
  const [form, setForm] = useState<Opportunity>(initialForm);
  const [employees, setEmployees] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (show) {
      fetchEmployeeNames();
    }
    
    if (!show) {
      setForm(initialForm);
    }
  }, [show]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  const availableEmployees = employees.length > 0 ? employees : employeeOptions;

  return (
    <div className={`modal fade${show ? ' show d-block' : ''}`} tabIndex={-1} style={{ background: show ? 'rgba(0,0,0,0.5)' : undefined }} aria-modal="true" role="dialog">
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Add/Edit Opportunity</h5>
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
                      <input type="text" className="form-control" name="name" placeholder="Opportunity Name" value={form.lead.name} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone *</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                      <input type="text" className="form-control" name="phoneNumber" placeholder="Customer Phone Number" value={form.lead.phoneNumber} onChange={handleChange} required pattern="^(\\+?\\d{2})?[0-9]{10}$"/>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email *</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                      <input type="email" className="form-control" name="email" placeholder="Customer Email" value={form.lead.email} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-bank"></i></span>
                      <input type="text" className="form-control" name="address" placeholder="address" value={form.lead.city} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">City</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-bank"></i></span>
                      <input type="text" className="form-control" name="city" placeholder="City" value={form.lead.city} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">State</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-building"></i></span>
                      <input type="text" className="form-control" name="state" placeholder="State" value={form.lead.state} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Zip Code</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-123"></i></span>
                      <input type="text" className="form-control" name="zipCode" placeholder="Zip code" value={form.lead.zipCode} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Website</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-globe"></i></span>
                      <input type="text" className="form-control" name="website" placeholder="Website" value={form.lead.website} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Country</label>
                    <input type="text" className="form-control" name="country" placeholder="Country" value={form.lead.country} onChange={handleChange} />
                  </div>
                </div>
                {/* Opportunity Details */}
                <div className="col-md-6">
                  <h6 className="mb-3 border-bottom pb-2">Opportunity Details</h6>
                  <div className="mb-3">
                    <label className="form-label">Requirement</label>
                    <input type="text" className="form-control" name="requirement" placeholder="required" value={form.lead.requirement} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Source *</label>
                    <select className="form-select" name="source" value={form.lead.source} onChange={handleChange} required>
                      <option value="">Select a Source</option>
                      {sourceOptions.map((src) => (
                        <option key={src} value={src}>{src}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Assigned To *</label>
                    <select 
                      className="form-select" 
                      name="assignedTo" 
                      value={form.lead.assignedTo} 
                      onChange={handleChange} 
                      required
                      disabled={isLoading}
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
                    <textarea className="form-control" name="comment" placeholder="Comment" value={form.lead.comment} onChange={handleChange} rows={2} />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OpportunityForm;