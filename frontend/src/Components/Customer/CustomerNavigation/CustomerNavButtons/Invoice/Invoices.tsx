import React, { useState, useEffect } from 'react';
import { Button, Card, Spinner, Table } from 'react-bootstrap';
import InvoiceService, { Invoice } from '../../../../../services/InvoiceService';
import InvoiceView from './InvoiceView';
import { Customer } from '../../../../../services/CustomerService';




interface InvoicesProps {
  customer: Customer | null;
}

const Invoices: React.FC<InvoicesProps> = ({ customer }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showInvoiceView, setShowInvoiceView] = useState<boolean>(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    fetchInvoices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer]);

  const fetchInvoices = async () => {
    if (!customer?.id) return;
    setLoading(true);
    try {
      const data = await InvoiceService.getInvoicesByCustomerId(customer.id);
      setInvoices(data);
      setError(null);
      console.log('Invoices fetched successfully:', data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Failed to load invoices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setShowInvoiceView(true);
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Invoices</h5>
        <Button 
          variant="outline-primary" 
          size="sm" 
          onClick={fetchInvoices}
          className="d-flex align-items-center"
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </Button>
      </Card.Header>
      <Card.Body>
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {invoices.length === 0 ? (
          <div className="text-center p-4">
            <i className="bi bi-receipt display-4 text-muted"></i>
            <p className="lead mt-3">No invoices available</p>
            <p className="text-muted">Create a new invoice for this customer.</p>
            
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <a 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          handleViewInvoice(invoice);
                        }}
                        className="text-primary text-decoration-none"
                      >
                        {invoice.invoiceNumber}
                      </a>
                    </td>
                    <td>{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                    <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td>₹{invoice.total.toFixed(2)}</td>
                    
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        <i className="bi bi-eye"> </i> 
                         View Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>

      {/* Invoice View Modal */}
      {currentInvoice && (
        <InvoiceView
          show={showInvoiceView}
          onHide={() => setShowInvoiceView(false)}
          invoice={currentInvoice}
          customer={customer}
        />
      )}
    </Card>
  );
};

export default Invoices;