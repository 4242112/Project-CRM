import React, { useState, useEffect } from 'react';
import { Button, Card, Container, Table, Spinner, Badge, Alert, Modal } from 'react-bootstrap';
import QuotationForm from './QuotationForm';
import QuotationService, { Quotation, QuotationStage } from '../../../../../services/QuotationService';
import InvoiceService from '../../../../../services/InvoiceService';
import { Opportunity } from '../../../OpportunityCard';

interface QuotationPageProps {
  opportunity: Opportunity;
}

const QuotationPage: React.FC<QuotationPageProps> = ({ opportunity }) => {
  const [showForm, setShowForm] = useState(false);
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendLoading, setSendLoading] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        if (opportunity.quotationId) {
          const data = await QuotationService.getQuotation(opportunity.id!);
          data.opportunityId = opportunity.id;
          setQuotation(data);
        }
      } catch (err) {
        console.error('Failed to load quotation', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotation();
  }, [opportunity.quotationId, opportunity.id]);

  const handleCreateOrUpdate = async (data: Quotation) => {
    if (formSubmitting) return; 
    setFormSubmitting(true);
    
    try {
      let savedQuotation: Quotation;
      
      if (data.id) {
        savedQuotation = await QuotationService.updateQuotation(data.id, data);
        setMessage('Quotation updated successfully');
      } else {
        savedQuotation = await QuotationService.saveQuotation(opportunity.id!, data);
        setMessage('Quotation created successfully');
      }
      
      setQuotation(savedQuotation);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save quotation', err);
      setError('Failed to save quotation. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleSendQuotation = async () => {
    if (!quotation?.id) return;
    
    setMessage(null);
    setError(null);
    setSendLoading(true);
    
    try {
      const updatedQuotation = await QuotationService.sendQuotation(quotation.id);
      setQuotation(updatedQuotation);
      setMessage('Quotation sent successfully to the customer!');
    } catch (err) {
      console.error('Failed to send quotation', err);
      setError('Failed to send quotation. Please try again.');
    } finally {
      setSendLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!quotation?.id) return;
    
    setMessage(null);
    setError(null);
    setInvoiceLoading(true);
    setShowConfirmModal(false);
    
    try {
      const invoice = await InvoiceService.generateInvoiceFromQuotation(quotation.id);
      console.log('Invoice generated:', invoice);
      setMessage('Invoice generated successfully! Invoice #' + invoice.invoiceNumber);
    } catch (err) {
      console.error('Failed to generate invoice', err);
      setError('Failed to generate invoice. Please try again.');
    } finally {
      setInvoiceLoading(false);
    }
  };

  const getStageBadgeVariant = (stage?: QuotationStage) => {
    switch (stage) {
      case QuotationStage.SENT:
        return 'info';
      case QuotationStage.ACCEPTED:
        return 'success';
      case QuotationStage.REJECTED:
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (showForm || !quotation) {
    return <QuotationForm onSubmit={handleCreateOrUpdate} opportunity={opportunity} quotation={quotation} />;
  }

  return (
    <Container className="my-4">
      {message && <Alert variant="success" onClose={() => setMessage(null)} dismissible>{message}</Alert>}
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0 d-inline me-2">Quotation</h5>
            {quotation.stage && (
              <Badge bg={getStageBadgeVariant(quotation.stage)}>
                {quotation.stage}
              </Badge>
            )}
          </div>
          <div>
            {quotation.stage === QuotationStage.DRAFT && (
              <Button 
                variant="success" 
                className="me-2" 
                onClick={handleSendQuotation}
                disabled={sendLoading}
              >
                {sendLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-2">Sending...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-send me-2"></i>
                    Send to Customer
                  </>
                )}
              </Button>
            )}
            {quotation.stage === QuotationStage.ACCEPTED && (
              <Button 
                variant="warning" 
                className="me-2"
                onClick={() => setShowConfirmModal(true)}
                disabled={invoiceLoading}
              >
                {invoiceLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-2">Generating...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-receipt me-2"></i>
                    Generate Invoice
                  </>
                )}
              </Button>
            )}
            <Button onClick={() => setShowForm(true)} disabled={formSubmitting}>
              <i className="bi bi-pencil me-2"></i>
              Edit Quotation
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <h6>{quotation.title}</h6>
          <p>{quotation.description}</p>
          <p><strong>Valid Until:</strong> {new Date(quotation.validUntil).toLocaleDateString()}</p>
          <p><strong>Amount:</strong> ₹{quotation.amount.toFixed(2)}</p>
          <hr />
          <Table bordered>
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Discount %</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items?.map((item, idx) => {
                const productName = item.product?.name || 'Unknown Product';
                const productPrice = item.product?.price || 0;
                const quantity = item.quantity || 1;
                const discount = item.discount || 0;
                const subtotal = quantity * productPrice * (1 - discount / 100);

                return (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{productName}</td>
                    <td>{quantity}</td>
                    <td>₹{productPrice.toFixed(2)}</td>
                    <td>{discount}%</td>
                    <td>₹{subtotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
        <Card.Footer>
          {quotation.stage === QuotationStage.DRAFT && (
            <div className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              This quotation is still in draft mode. Send it to make it visible to the customer.
            </div>
          )}
          {quotation.stage === QuotationStage.SENT && (
            <div className="text-info">
              <i className="bi bi-envelope-check me-1"></i>
              This quotation has been sent to the customer and is awaiting their response.
            </div>
          )}
          {quotation.stage === QuotationStage.ACCEPTED && (
            <div className="text-success">
              <i className="bi bi-check-circle me-1"></i>
              This quotation has been accepted by the customer. You can now generate an invoice.
            </div>
          )}
          {quotation.stage === QuotationStage.REJECTED && (
            <div className="text-danger">
              <i className="bi bi-x-circle me-1"></i>
              This quotation has been rejected by the customer.
            </div>
          )}
        </Card.Footer>
      </Card>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Generate Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to generate an invoice based on this quotation? 
          This will create a billable invoice for the customer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleGenerateInvoice}>
            Generate Invoice
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default QuotationPage;
