import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './ForgotPassword.css';
import backgroundImage from '../../assets/pexels-tirachard-kumtanom-112571-733857.jpg';
import axios from 'axios';


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

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [token, setToken] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isTokenChecking, setIsTokenChecking] = useState<boolean>(true);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('token');
    
    if (!tokenFromUrl) {
      setIsValidToken(false);
      setIsTokenChecking(false);
      return;
    }
    
    setToken(tokenFromUrl);

    const validateToken = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/password-reset/validate?token=${tokenFromUrl}`);
        setIsValidToken(response.data);
      } catch (error) {
        console.error('Token validation error:', error);
        setIsValidToken(false);
      } finally {
        setIsTokenChecking(false);
      }
    };
    
    validateToken();
  }, [location]);
  

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    

    const validation = validatePassword(newPassword);
    setPasswordError(validation.isValid ? null : validation.message);
    

    if (confirmPassword) {
      setConfirmPasswordError(
        newPassword === confirmPassword ? null : 'Passwords do not match'
      );
    }
  };
  
 
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    
    setConfirmPasswordError(
      password === newConfirmPassword ? null : 'Passwords do not match'
    );
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.message);
      return;
    }
    
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }
    
    if (!token) {
      setMessage({
        type: 'error',
        text: 'Invalid token. Please request a new password reset link.'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      setMessage({
        type: 'success',
        text: 'Your password has been reset successfully! You will be redirected to login page shortly.'
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Password reset error:', error);
      setMessage({
        type: 'error',
        text: 'Failed to reset password. The link may have expired. Please request a new reset link.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoToLogin = () => {
    navigate('/login');
  };
  
  if (isTokenChecking) {
    return (
      <div className="forgot-password-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="forgot-password-overlay">
          <div className="forgot-password-box">
            <div className="forgot-password-logo">
              <h1>ClientNest</h1>
              <p>CRM Solution</p>
            </div>
            <div className="forgot-password-form text-center">
              <h2>Reset Password</h2>
              <div className="py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Verifying your reset link...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error if token is invalid
  if (!isValidToken) {
    return (
      <div className="forgot-password-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="forgot-password-overlay">
          <div className="forgot-password-box">
            <div className="forgot-password-logo">
              <h1>ClientNest</h1>
              <p>CRM Solution</p>
            </div>
            <div className="forgot-password-form">
              <div className="text-center py-4">
                <i className="bi bi-exclamation-circle text-danger" style={{ fontSize: '3rem' }}></i>
                <h2 className="mt-3">Invalid or Expired Link</h2>
                <p className="text-muted mb-4">
                  The password reset link is invalid or has expired. Please request a new password reset link.
                </p>
                <button 
                  onClick={handleGoToLogin} 
                  className="btn"
                  style={{ backgroundColor: "#0f1627", color: "white" }}
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show password reset form
  return (
    <div className="forgot-password-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="forgot-password-overlay">
        <div className="forgot-password-box">
          <div className="forgot-password-logo">
            <h1>ClientNest</h1>
            <p>CRM Solution</p>
          </div>
          
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <h2>Reset Password</h2>
            <p className="text-muted mb-4">
              Please enter your new password below.
            </p>
            
            {message && (
              <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
                {message.text}
              </div>
            )}
            
            <div className="mb-3">
              <label htmlFor="password" className="form-label">New Password</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className={`form-control ${passwordError ? 'is-invalid' : ''}`}
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  required
                />
              </div>
              {passwordError && (
                <div className="text-danger small mt-1">{passwordError}</div>
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
                  className={`form-control ${confirmPasswordError ? 'is-invalid' : ''}`}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="Confirm your password"
                  required
                />
              </div>
              {confirmPasswordError && (
                <div className="text-danger small mt-1">{confirmPasswordError}</div>
              )}
            </div>
            
            <div className="mb-3">
              <button 
                type="submit" 
                className="btn w-100" 
                style={{ backgroundColor: "#0f1627", color: "white" }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span className="ms-2">Processing...</span>
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;