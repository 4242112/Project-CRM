import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './CustomerRegister.css';
import backgroundImage from '../../assets/pexels-tirachard-kumtanom-112571-733857.jpg';
import CustomerService from '../../services/CustomerService';
import AuthService from '../../services/AuthService';
import axios, { AxiosError } from 'axios';


const validatePassword = (password: string): { isValid: boolean, message: string } => {

  const result = { isValid: true, message: '' };
  
 
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  
  return result;
};

const CustomerRegister: React.FC = () => {
  const navigate = useNavigate();
  

  const [activeStep, setActiveStep] = useState<'verify' | 'register'>('verify');
  const [email, setEmail] = useState('');
  const [customer, setCustomer] = useState<{
    id?: number;
    name: string;
    email: string;
    phoneNumber: string;
    address?: string;
    city?: string;
    state?: string;
    password: string;
    confirmPassword: string;
  }>({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{
    password: string | null;
    confirmPassword: string | null;
  }>({
    password: null,
    confirmPassword: null
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
  };


  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setVerifying(true);
    setError(null);
    
    try {
      const customerData = await CustomerService.getCustomerByEmail(email);
      
      if (customerData) {
        setCustomer({
          id: customerData.id,
          name: customerData.name || '',
          email: customerData.email,
          phoneNumber: customerData.phoneNumber || '',
          address: customerData.address || '',
          city: customerData.city || '',
          state: customerData.state || '',
          password: '',
          confirmPassword: ''
        });
        

        if(customerData.hasPassword) {
          setError('This email is already registered. Please use a different email or contact support.');
          setTimeout(() => setError(null), 3000);
        } else {
          setActiveStep('register');
          setSuccess('Email verified! Please complete your registration.');
          setTimeout(() => setSuccess(null), 3000);

        }
      } else {
        setError('No account found with this email address.');
      }
    } catch (err) {
      console.error('Error verifying email:', err);
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError;
        if (axiosError.response?.status === 404) {
          setError('No account found with this email address. Please contact your account manager.');
        } else {
          setError('An error occurred while verifying your email. Please try again.');
        }
      } else {
        setError('An error occurred while verifying your email. Please try again.');
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer({ ...customer, [name]: value });

    setError(null);
    
    if (name === 'password') {
      const validation = validatePassword(value);
      setPasswordErrors({
        ...passwordErrors,
        password: validation.isValid ? null : validation.message
      });
    } else if (name === 'confirmPassword') {
      setPasswordErrors({
        ...passwordErrors,
        confirmPassword: value === customer.password ? null : 'Passwords do not match'
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const passwordValidation = validatePassword(customer.password);
    if (!passwordValidation.isValid) {
      setPasswordErrors({
        ...passwordErrors,
        password: passwordValidation.message
      });
      return;
    }
    
    if (customer.password !== customer.confirmPassword) {
      setPasswordErrors({
        ...passwordErrors,
        confirmPassword: 'Passwords do not match'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(
        `http://localhost:8080/api/customers/${customer.id}/register`, 
        {
          name: customer.name,
          phoneNumber: customer.phoneNumber,
          address: customer.address,
          city: customer.city,
          state: customer.state,
          password: customer.password
        }
      );
      
      if (response.status === 200) {
        setSuccess('Registration successful! You will now be redirected to login.');
        
        try {
          const loginResponse = await AuthService.loginCustomer({
            email: customer.email,
            password: customer.password
          });
          
          if (loginResponse.isAuthenticated) {
            setTimeout(() => {
              navigate('/customer-portal');
            }, 2000);
          } else {
            setTimeout(() => {
              navigate('/login');
            }, 2000);
          }
        } catch (loginErr) {
          console.error('Auto-login failed after registration:', loginErr);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to complete registration. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    setActiveStep('verify');
    setError(null);
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="register-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="register-overlay">
        <div className="register-box">
          <div className="register-logo">
            <h1>ClientNest</h1>
            <p>CRM Solution</p>
          </div>
          
          {activeStep === 'verify' ? (
            <div className="register-form">
              <h2>Customer Registration</h2>
              <p className="text-muted mb-4">
                Please enter your email to verify your account. Your email should already be in our system, added by an employee.
              </p>
              
              {error && <div className="alert alert-danger">{error}</div>}
              
              <form onSubmit={handleVerifyEmail}>
                <div className="mb-4">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={handleEmailChange}
                      required
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="btn w-100 mb-3" 
                  disabled={verifying}
                  style={{ backgroundColor: "#0f1627", color: "white" }}
                >
                  {verifying ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span className="ms-2">Verifying...</span>
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </button>
                
                <div className="d-flex justify-content-center mt-3">
                  <button 
                    type="button"
                    className="btn btn-link"
                    onClick={handleGoToLogin}
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="register-form">
              <h2>Complete Your Registration</h2>
              
              {success && <div className="alert alert-success">{success}</div>}
              {error && <div className="alert alert-danger">{error}</div>}
              
              <form onSubmit={handleRegister}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      placeholder="Enter your full name"
                      value={customer.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="Your email address"
                      value={customer.email}
                      readOnly
                      disabled
                    />
                  </div>
                  <small className="text-muted">Email cannot be changed</small>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-telephone"></i>
                    </span>
                    <input
                      type="tel"
                      className="form-control"
                      id="phoneNumber"
                      name="phoneNumber"
                      placeholder="Enter your phone number"
                      value={customer.phoneNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="address" className="form-label">Address</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-house"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      id="address"
                      name="address"
                      placeholder="Enter your address"
                      value={customer.address}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col">
                    <label htmlFor="city" className="form-label">City</label>
                    <input
                      type="text"
                      className="form-control"
                      id="city"
                      name="city"
                      placeholder="City"
                      value={customer.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col">
                    <label htmlFor="state" className="form-label">State</label>
                    <input
                      type="text"
                      className="form-control"
                      id="state"
                      name="state"
                      placeholder="State"
                      value={customer.state}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      placeholder="Create a password"
                      value={customer.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {passwordErrors.password && (
                    <div className="text-danger small mt-1">{passwordErrors.password}</div>
                  )}
                  <small className="form-text text-muted">
                    Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.
                  </small>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock-fill"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={customer.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {passwordErrors.confirmPassword && (
                    <div className="text-danger small mt-1">{passwordErrors.confirmPassword}</div>
                  )}
                </div>
                
                <div className="d-flex gap-2 mt-4">
                  <button 
                    type="button"
                    className="btn btn-outline-secondary flex-grow-1"
                    onClick={handleGoBack}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="btn flex-grow-1"
                    style={{ backgroundColor: "#0f1627", color: "white" }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span className="ms-2">Processing...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle me-2"></i>
                        Complete Registration
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerRegister;