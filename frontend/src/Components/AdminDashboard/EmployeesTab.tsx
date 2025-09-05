/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Button, Alert, Spinner, Table, Modal, Form, InputGroup, FormControl } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Pagination from '../common/Pagination';


interface Employee {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
}

interface EmployeesTabProps {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

const EmployeesTab: React.FC<EmployeesTabProps> = ({ onError, onSuccess }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(10);
  
  const [showEmployeeModal, setShowEmployeeModal] = useState<boolean>(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const results = employees.filter(employee =>
      Object.values(employee).some(value =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setFilteredEmployees(results);
  }, [searchQuery, employees]);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await fetch('http://localhost:8080/api/employees');
      if (!response.ok) throw new Error('Failed to fetch employees');
      
      const data = await response.json();
      setEmployees(data);
      onError(''); 
    } catch (err) {
      console.error('Error fetching employees:', err);
      onError('Failed to fetch employees. Please try again later.');
    } finally {
      setLoadingEmployees(false);
    }
  };


  const handleCreateEmployee = async () => {
    // Validate form inputs
    const errors: {[key: string]: string} = {};
    if (!newEmployee.name) errors.name = 'Name is required';
    if (!newEmployee.email) errors.email = 'Email is required';
    if (!newEmployee.phone) errors.phone = 'Phone number is required';
    if (!newEmployee.password) errors.password = 'Password is required';
    if (newEmployee.password !== newEmployee.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newEmployee.name,
          email: newEmployee.email,
          phone: newEmployee.phone,
          hashedPassword: newEmployee.password
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create employee');
      }

      const newEmployeeData = await response.json();
      setEmployees([...employees, newEmployeeData]);
      onSuccess('Employee created successfully!');
      setShowEmployeeModal(false);
      setNewEmployee({name: '', email: '', phone: '', password: '', confirmPassword: ''});
      setFormErrors({});
    } catch (err) {
      console.error('Error creating employee:', err);
      onError('Failed to create employee. Please try again.');
    }
  };


  const handleDeleteEmployee = async () => {
    if (employeeToDelete === null) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/employees/${employeeToDelete}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }

      setEmployees(employees.filter(employee => employee.id !== employeeToDelete));
      onSuccess('Employee deleted successfully!');
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
    } catch (err) {
      console.error('Error deleting employee:', err);
      onError('Failed to delete employee. Please try again.');
    }
  };


  const exportToExcel = () => {
    setExportLoading(true);
    try {

      const exportData = employees.map(employee => ({
        'ID': employee.id || '',
        'Name': employee.name || '',
        'Email': employee.email || '',
        'Phone Number': employee.phoneNumber || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
 
      const columnWidths = [
        { wch: 5 },  
        { wch: 25 },  
        { wch: 30 }, 
        { wch: 15 }, 
      ];
      worksheet['!cols'] = columnWidths;


      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');


      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      

      const currentDate = new Date().toISOString().split('T')[0];
      saveAs(data, `Employees_Export_${currentDate}.xlsx`);
      
      setMessage('Employees exported to Excel successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      onError('Failed to export employees to Excel.');
    } finally {
      setExportLoading(false);
    }
  };


  const renderLoading = () => (
    <div className="text-center py-5">
      <Spinner animation="border" />
      <p className="mt-2">Loading data...</p>
    </div>
  );

  // Pagination logic
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);

  if (loadingEmployees) {
    return renderLoading();
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded" style={{ 
        backgroundColor: '#1a2236', 
        color: 'white',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <h5 className="m-0">All Employees</h5>
        <div>
          <Button 
            variant="light" 
            size="sm" 
            onClick={() => setShowEmployeeModal(true)}
            className="me-2"
          >
            <i className="bi bi-person-plus me-2"></i>
            Create Employee
          </Button>
          <Button 
            variant="light" 
            size="sm" 
            onClick={fetchEmployees}
            className="me-2"
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </Button>
          <Button 
            variant="success" 
            size="sm" 
            onClick={exportToExcel}
            disabled={exportLoading}
          >
            {exportLoading ? (
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
            ) : (
              <i className="bi bi-file-earmark-excel me-2"></i>
            )}
            Export to Excel
          </Button>
        </div>
      </div>
      
      {message && (
        <Alert variant="success" className="text-center">
          {message}
        </Alert>
      )}

      <div className="mb-4">
        <InputGroup>
          <FormControl
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="outline-secondary" onClick={() => setSearchQuery('')}>
            <i className="bi bi-x-circle"></i>
          </Button>
        </InputGroup>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="text-center py-5">
          <Alert variant="info">
            <i className="bi bi-info-circle me-2"></i>
            No employees found.
          </Alert>
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.id}</td>
                  <td>{employee.name}</td>
                  <td>{employee.email}</td>
                  <td>{employee.phoneNumber}</td>
                  <td>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => {
                        setEmployeeToDelete(employee.id);
                        setShowDeleteModal(true);
                      }}
                    >
                      <i className="bi bi-trash me-1"></i> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination Component */}
          <div className="d-flex justify-content-between align-items-center">
            <div>
              Showing {indexOfFirstEmployee + 1} to {Math.min(indexOfLastEmployee, filteredEmployees.length)} of {filteredEmployees.length} employees
            </div>
            <Pagination 
              currentPage={currentPage} 
              totalItems={filteredEmployees.length} 
              itemsPerPage={employeesPerPage}
              onPageChange={setCurrentPage} 
            />
          </div>
        </>
      )}

      {/* Create Employee Modal */}
      <Modal show={showEmployeeModal} onHide={() => {
        setShowEmployeeModal(false);
        setNewEmployee({name: '', email: '', phone: '', password: '', confirmPassword: ''});
        setFormErrors({});
      }}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter employee name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                isInvalid={!!formErrors.name}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter employee email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                isInvalid={!!formErrors.email}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter phone number"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                isInvalid={!!formErrors.phone}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.phone}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Set password"
                value={newEmployee.password}
                onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                isInvalid={!!formErrors.password}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm password"
                value={newEmployee.confirmPassword}
                onChange={(e) => setNewEmployee({...newEmployee, confirmPassword: e.target.value})}
                isInvalid={!!formErrors.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowEmployeeModal(false);
            setNewEmployee({name: '', email: '', phone: '', password: '', confirmPassword: ''});
            setFormErrors({});
          }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateEmployee}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Employee Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this employee? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteEmployee}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EmployeesTab;