import React, { useState, useEffect } from 'react';
import { Button, Alert, Spinner, Table, InputGroup, FormControl } from 'react-bootstrap';
import Pagination from '../common/Pagination';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Lead {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  source: string;
  assignedTo: string;
  expectedRevenue?: number;
  conversionProbability?: number;
}

interface LeadsTabProps {
  onError: (message: string) => void;
}

const LeadsTab: React.FC<LeadsTabProps> = ({ onError }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage] = useState(10);

  useEffect(() => {
    fetchLeads();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Filter leads based on search query
    if (searchQuery.trim() === '') {
      setFilteredLeads(leads);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = leads.filter(lead => 
        lead.name?.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.phoneNumber?.toLowerCase().includes(query) ||
        lead.source?.toLowerCase().includes(query) ||
        lead.assignedTo?.toLowerCase().includes(query) ||
        (lead.expectedRevenue?.toString() || '').includes(query) ||
        (lead.conversionProbability?.toString() || '').includes(query)
      );
      setFilteredLeads(filtered);
    }
  }, [searchQuery, leads]);

  // Function to fetch leads
  const fetchLeads = async () => {
    setLoadingLeads(true);
    try {
      const response = await fetch('http://localhost:8080/api/leads');
      if (!response.ok) throw new Error('Failed to fetch leads');
      
      const data = await response.json();
      setLeads(data);
      onError(''); 
    } catch (err) {
      console.error('Error fetching leads:', err);
      onError('Failed to fetch leads. Please try again later.');
    } finally {
      setLoadingLeads(false);
    }
  };


  const exportToExcel = () => {
    setExportLoading(true);
    try {

      const exportData = leads.map(lead => ({
        'ID': lead.id || '',
        'Name': lead.name || '',
        'Email': lead.email || '',
        'Source': lead.source || '',
        'Expected Revenue': lead.expectedRevenue?.toFixed(2) || '0.00',
        'Probability': `${lead.conversionProbability || 0}%`,
        'Assigned To': lead.assignedTo || '',
      }));


      const worksheet = XLSX.utils.json_to_sheet(exportData);
      

      const columnWidths = [
        { wch: 5 }, 
        { wch: 25 },  
        { wch: 30 },  
        { wch: 15 }, 
        { wch: 20 },  
        { wch: 15 },  
        { wch: 20 }, 
      ];
      worksheet['!cols'] = columnWidths;

   
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
   
      const currentDate = new Date().toISOString().split('T')[0];
      saveAs(data, `Leads_Export_${currentDate}.xlsx`);
      
      setMessage('Leads exported to Excel successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      onError('Failed to export leads to Excel.');
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

  if (loadingLeads) {
    return renderLoading();
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-5">
        <Alert variant="info">
          <i className="bi bi-info-circle me-2"></i>
          No leads found.
        </Alert>
        <Button 
          variant="outline-primary" 
          onClick={fetchLeads} 
          className="mt-3"
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh Leads
        </Button>
      </div>
    );
  }

  // Pagination logic
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded" style={{ 
        backgroundColor: '#1a2236', 
        color: 'white',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <h5 className="m-0">All Leads</h5>
        <div>
          <Button 
            variant="light" 
            size="sm" 
            onClick={fetchLeads}
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
        <Alert variant="success" className="mb-3">
          {message}
        </Alert>
      )}

      <InputGroup className="mb-4">
        <FormControl
          placeholder="Search leads..."
          aria-label="Search leads"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ 
            backgroundColor: '#f8f9fa', 
            borderColor: '#ced4da' 
          }}
        />
      </InputGroup>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Source</th>
            <th>Expected Revenue</th>
            <th>Probability</th>
            <th>Assigned To</th>
          </tr>
        </thead>
        <tbody>
          {currentLeads.map((lead) => (
            <tr key={lead.id}>
              <td>{lead.id}</td>
              <td>
                <div>{lead.name}</div>
                <small className="text-muted">{lead.email}</small>
              </td>
              <td>{lead.source}</td>
              <td>₹ {lead.expectedRevenue?.toFixed(2) || '0.00'}</td>
              <td>{lead.conversionProbability || 0}%</td>
              <td>{lead.assignedTo}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center">
        <div>
          Showing {indexOfFirstLead + 1} to {Math.min(indexOfLastLead, filteredLeads.length)} of {filteredLeads.length} results
        </div>
        <Pagination 
          currentPage={currentPage} 
          totalItems={filteredLeads.length}
          itemsPerPage={leadsPerPage} 
          onPageChange={setCurrentPage} 
        />
      </div>
    </>
  );
};

export default LeadsTab;