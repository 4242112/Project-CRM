import React, { useState, useEffect } from 'react';
import { Button, Alert, Spinner, Table, InputGroup, FormControl } from 'react-bootstrap';
// Import Excel export libraries
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Opportunity } from '../../services/OpportunityService';
import Pagination from '../common/Pagination';

interface OpportunitiesTabProps {
  onError: (message: string) => void;
}

const OpportunitiesTab: React.FC<OpportunitiesTabProps> = ({ onError }) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [opportunitiesPerPage] = useState(10);

  const fetchOpportunities = async () => {
    setLoadingOpportunities(true);
    try {
      const response = await fetch('http://localhost:8080/api/opportunities');
      if (!response.ok) throw new Error('Failed to fetch opportunities');
      
      const data = await response.json();
      setOpportunities(data);
      onError(''); 
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      onError('Failed to fetch opportunities. Please try again later.');
    } finally {
      setLoadingOpportunities(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFilteredOpportunities(
      opportunities.filter(opportunity =>
        opportunity.lead?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opportunity.lead?.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, opportunities]);

  const exportToExcel = () => {
    setExportLoading(true);
    try {

      const exportData = opportunities.map(opportunity => ({
        'ID': opportunity.id || '',
        'Customer': opportunity.lead?.name || 'N/A',
        'Assigned To': opportunity.lead?.assignedTo || 'Unassigned',
        'Quotation Created': opportunity.quotationId ? 'Yes' : 'No',
        'Created Date': opportunity.createdDate ? new Date(opportunity.createdDate).toLocaleDateString() : ''
      }));


      const worksheet = XLSX.utils.json_to_sheet(exportData);
      

      const columnWidths = [
        { wch: 5 },   
        { wch: 25 },  
        { wch: 20 },  
        { wch: 20 },  
        { wch: 15 },  
      ];
      worksheet['!cols'] = columnWidths;

     
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Opportunities');

    
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
    
      const currentDate = new Date().toISOString().split('T')[0];
      saveAs(data, `Opportunities_Export_${currentDate}.xlsx`);
      
      setMessage('Opportunities exported to Excel successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      onError('Failed to export opportunities to Excel.');
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

  if (loadingOpportunities) {
    return renderLoading();
  }

  if (opportunities.length === 0) {
    return (
      <div className="text-center py-5">
        <Alert variant="info">
          <i className="bi bi-info-circle me-2"></i>
          No opportunities found.
        </Alert>
        <Button 
          variant="outline-primary" 
          onClick={fetchOpportunities} 
          className="mt-3"
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh Opportunities
        </Button>
      </div>
    );
  }

  // Pagination logic
  const indexOfLastOpportunity = currentPage * opportunitiesPerPage;
  const indexOfFirstOpportunity = indexOfLastOpportunity - opportunitiesPerPage;
  const currentOpportunities = filteredOpportunities.slice(indexOfFirstOpportunity, indexOfLastOpportunity);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded" style={{ 
        backgroundColor: '#1a2236', 
        color: 'white',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <h5 className="m-0">All Opportunities</h5>
        <div>
          <Button 
            variant="light" 
            size="sm" 
            onClick={fetchOpportunities}
            className="me-2"
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </Button>
          <Button 
            variant="success  " 
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
        <Alert variant="success" className="mb-3">
          {message}
        </Alert>
      )}

      <InputGroup className="mb-4">
        <FormControl
          placeholder="Search by customer or assigned to"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search opportunities"
        />
      </InputGroup>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Assigned To</th>
            <th>Quotation Created</th>
          </tr>
        </thead>
        <tbody>
          {currentOpportunities.map((opportunity) => (
            <tr key={opportunity.id}>
              <td>{opportunity.id}</td>
              <td>{opportunity.lead?.name || 'N/A'}</td>
              <td>{opportunity.lead?.assignedTo || 'Unassigned'}</td>
              <td>{opportunity.quotationId ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Pagination 
        currentPage={currentPage} 
        totalItems={filteredOpportunities.length} 
        itemsPerPage={opportunitiesPerPage} 
        onPageChange={setCurrentPage} 
      />
    </>
  );
};

export default OpportunitiesTab;