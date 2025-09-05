import React, { useState, useEffect } from "react";
import { Customer } from "../../../services/CustomerService";


interface EditCustomerProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: Customer) => Promise<void>;
  customer: Customer | null;
}

const EditCustomer: React.FC<EditCustomerProps> = ({
  show,
  onClose,
  onSave,
  customer
}) => {
  const [form, setForm] = useState<Customer | null>(null);

  useEffect(() => {
    if (customer && show) {
      setForm(JSON.parse(JSON.stringify(customer)));
    } else if (!show) {
      setForm(null);
    }
  }, [customer, show]);

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

  return (
    <div className={`modal fade${show ? ' show d-block' : ''}`} tabIndex={-1} style={{ background: show ? 'rgba(0,0,0,0.5)' : undefined }} aria-modal="true" role="dialog">
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Edit Customer</h5>
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
                      <input type="text" className="form-control" name="lead.name" placeholder="Customer Name" value={form.name} onChange={handleChange} required />
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
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Update Customer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCustomer;