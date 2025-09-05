import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Login.css';
import backgroundImage from '../../assets/pexels-tirachard-kumtanom-112571-733857.jpg';
import ForgotPassword from './ForgotPassword';
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

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'customer' | 'employee' | 'admin'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const ADMIN_EMAIL = 'admin@gmail.com';
  const ADMIN_PASSWORD = 'Admin@123';

  const handleTabChange = (tab: 'customer' | 'employee' | 'admin') => {
    setActiveTab(tab);
    setError(null);
    setPasswordError(null);
    setPasswordTouched(false);
    setEmail('');
    setPassword('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    if (passwordTouched) {
      const validation = validatePassword(newPassword);
      setPasswordError(validation.isValid ? null : validation.message);
    }
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    const validation = validatePassword(password);
    setPasswordError(validation.isValid ? null : validation.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.message);
      setPasswordTouched(true);
      return;
    }
    
    setLoading(true);

    try {
      if (activeTab === 'employee') {
        try {
          const response = await AuthService.loginEmployee({
            email: email,
            password: password
          });
          
          if (response.isAuthenticated) {
            setLoading(false);
            navigate('/');
          } else {
            setError('Invalid credentials. Please try again.');
            setLoading(false);
          }
        } catch (err) {
          console.error('Employee login error:', err);
          setError('Login failed. Only employees created by admin can login.');
          setLoading(false);
        }
      } else if (activeTab === 'admin') {
        try {
          if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            console.log('Admin logged in successfully');
            
            const adminAuthData = {
              isAuthenticated: true,
              adminId: 1,
              adminName: 'Admin',
              email: email,
              role: 'Administrator'
            };
            
            localStorage.setItem('adminAuth', JSON.stringify(adminAuthData));
            
            setTimeout(() => {
              navigate('/');
              setLoading(false);
            }, 1000);
          } else {
            setError('Invalid admin credentials. Please try again.');
            setLoading(false);
          }
        } catch (err) {
          console.error('Admin login error:', err);
          setError('Login failed. Please try again.');
          setLoading(false);
        }
      } else {
        try {
          const response = await AuthService.loginCustomer({
            email: email,
            password: password
          });
          
          if (response.isAuthenticated) {
            console.log('Customer login successful:', response);
            setTimeout(() => {
              navigate('/customer-portal');
              setLoading(false);
            }, 1000);
          } else {
            setError('Invalid credentials. Please try again.');
            setLoading(false);
          }
        } catch (err: unknown) {
          console.error('Customer login error:', err);
          if (axios.isAxiosError(err)) {
            const axiosError = err as AxiosError;
            if (axiosError.response?.status === 404) {
              setError('Customer account not found. Please check your email.');
            } else if (axiosError.response?.status === 401) {
              setError('Invalid password. Please try again.');
            } else if (axiosError.response?.status === 403) {
              setError('This customer does not have a password set. Please register first.');
            } else {
              setError('Login failed. Please try again later.');
            }
          } else {
            setError('Login failed. Please try again later.');
          }
          setLoading(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials and try again.');
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className="login-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="login-overlay">
        <div className="login-box">
          <div className="login-logo">
            <h1>ClientNest</h1>
            <p>CRM Solution</p>
          </div>
          
          <div className="login-tabs">
            <button 
              className={`login-tab ${activeTab === 'customer' ? 'active' : ''}`}
              onClick={() => handleTabChange('customer')}
            >
              Customer
            </button>
            <button 
              className={`login-tab ${activeTab === 'employee' ? 'active' : ''}`}
              onClick={() => handleTabChange('employee')}
            >
              Employee
            </button>
            <button 
              className={`login-tab ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => handleTabChange('admin')}
            >
              Admin
            </button>
          </div>
          
          <div className="login-form">
            {activeTab === 'customer' && <h2>Customer Login</h2>}
            {activeTab === 'employee' && <h2>Employee Login</h2>}
            {activeTab === 'admin' && <h2>Admin Login</h2>}
            
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              {activeTab === 'customer' && (
                <>
                  <div className="mb-4">
                    <label htmlFor="customerEmail" className="form-label">Email</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        id="customerEmail"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="customerPassword" className="form-label">Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="customerPassword"
                        placeholder="Enter your password"
                        value={password}
                        onChange={handlePasswordChange}
                        onBlur={handlePasswordBlur}
                        required
                      />
                    </div>
                    {passwordError && <div className="text-danger">{passwordError}</div>}
                    <small className="form-text text-muted">
                      Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.
                    </small>
                  </div>
                </>
              )}

              {activeTab === 'employee' && (
                <>
                  <div className="mb-4">
                    <label htmlFor="employeeEmail" className="form-label">Email</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        id="employeeEmail"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="employeePassword" className="form-label">Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="employeePassword"
                        placeholder="Enter your password"
                        value={password}
                        onChange={handlePasswordChange}
                        onBlur={handlePasswordBlur}
                        required
                      />
                    </div>
                    {passwordError && <div className="text-danger">{passwordError}</div>}
                    <small className="form-text text-muted">
                      Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.
                    </small>
                  </div>
                </>
              )}

              {activeTab === 'admin' && (
                <>
                  <div className="mb-4">
                    <label htmlFor="adminEmail" className="form-label">Email</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        id="adminEmail"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="adminPassword" className="form-label">Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="adminPassword"
                        placeholder="Enter your password"
                        value={password}
                        onChange={handlePasswordChange}
                        onBlur={handlePasswordBlur}
                        required
                      />
                    </div>
                    {passwordError && <div className="text-danger">{passwordError}</div>}
                    <small className="form-text text-muted">
                      Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.
                    </small>
                  </div>
                </>
              )}

              <button type="submit" className="btn w-100 mb-3" style={{ backgroundColor: "#0f1627", color: "white" }} disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span className="ms-2">Processing...</span>
                  </>
                ) : (
                  'Login'
                )}
              </button>
              
              <div className="d-flex justify-content-between mt-3">
                <a 
                  href="#" 
                  className="text-decoration-none" 
                  onClick={(e) => {
                    e.preventDefault();
                    setShowForgotPassword(true);
                  }}
                >
                  Forgot Password?
                </a>
                
                {activeTab === 'customer' && (
                  <a 
                    href="#" 
                    className="text-decoration-none"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/register');
                    }}
                  >
                    Register Now
                  </a>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;