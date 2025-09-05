/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './ForgotPassword.css';
import backgroundImage from '../../assets/pexels-tirachard-kumtanom-112571-733857.jpg';
import axios from 'axios';

interface ForgotPasswordProps {
  onBack: () => void; 
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'CUSTOMER' | 'EMPLOYEE'>('CUSTOMER');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    // Validate email
    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/password-reset/request', {
        email,
        userType
      });
      
      setMessage({ 
        type: 'success', 
        text: 'If there is an account associated with this email, you will receive a password reset link shortly.'
      });
    } catch (err) {

      setMessage({ 
        type: 'success', 
        text: 'If there is an account associated with this email, you will receive a password reset link shortly.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="forgot-password-overlay">
        <div className="forgot-password-box">
          <div className="forgot-password-logo">
            <h1>ClientNest</h1>
            <p>CRM Solution</p>
          </div>
          
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <h2>Forgot Password</h2>
            <p className="text-muted mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            {message && (
              <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
                {message.text}
              </div>
            )}
            
            <div className="form-group mb-3">
              <label className="form-label">Account Type</label>
              <div className="d-flex">
                <div className="form-check me-4">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="userType"
                    id="customerType"
                    checked={userType === 'CUSTOMER'}
                    onChange={() => setUserType('CUSTOMER')}
                  />
                  <label className="form-check-label" htmlFor="customerType">
                    Customer
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="userType"
                    id="employeeType"
                    checked={userType === 'EMPLOYEE'}
                    onChange={() => setUserType('EMPLOYEE')}
                  />
                  <label className="form-check-label" htmlFor="employeeType">
                    Employee
                  </label>
                </div>
              </div>
            </div>
            
            <div className="form-group mb-4">
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            <div className="form-group mb-3">
              <button 
                type="submit" 
                className="btn w-100" 
                style={{ backgroundColor: "#0f1627", color: "#ffffff" }}
                disabled={loading}
              >
                {loading ? (
                  <span>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span className="ms-2">Processing...</span>
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>
            
            <div className="forgot-password-footer text-center">
              <button 
                type="button" 
                className="btn btn-link p-0" 
                onClick={onBack}
                style={{ color: "#0f1627" }}
              >
                <i className="bi bi-arrow-left me-1"></i> Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;