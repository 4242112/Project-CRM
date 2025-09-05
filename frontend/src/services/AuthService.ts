import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    isAuthenticated: boolean;
    userId?: number;
    name?: string;
    email?: string;
    role?: string;
}

const AuthService = {
    loginEmployee: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await axios.post(`${API_URL}/login/employee`, credentials);
        
        if (response.data && response.data.isAuthenticated) {
            localStorage.setItem('employeeAuth', JSON.stringify(response.data));
        }
        
        return response.data;
    },
    
    loginCustomer: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await axios.post(`${API_URL}/login/customer`, credentials);
        
        if (response.data && response.data.isAuthenticated) {
            localStorage.setItem('customerAuth', JSON.stringify(response.data));
        }
        
        return response.data;
    },
    
    isEmployeeLoggedIn: (): boolean => {
        const authData = localStorage.getItem('employeeAuth');
        return !!authData && JSON.parse(authData).isAuthenticated;
    },
    
    isCustomerLoggedIn: (): boolean => {
        const authData = localStorage.getItem('customerAuth');
        return !!authData && JSON.parse(authData).isAuthenticated;
    },
    
    getCurrentEmployee: (): LoginResponse | null => {
        const authData = localStorage.getItem('employeeAuth');
        return authData ? JSON.parse(authData) : null;
    },
    
    getCurrentCustomer: (): LoginResponse | null => {
        const authData = localStorage.getItem('customerAuth');
        return authData ? JSON.parse(authData) : null;
    },
    
    logoutEmployee: (): void => {
        localStorage.removeItem('employeeAuth');
    },
    
    logoutCustomer: (): void => {
        localStorage.removeItem('customerAuth');
    }
};

export default AuthService;