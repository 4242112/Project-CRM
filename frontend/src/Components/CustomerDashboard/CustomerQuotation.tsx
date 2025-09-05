import React, { useState, useEffect } from 'react';
import { Card, Alert, Button, Spinner, Table, Badge, Modal, Row, Col } from "react-bootstrap";
import QuotationService, { Quotation, QuotationStage } from "../../services/QuotationService";

interface CustomerQuotationProps {
  customerId: number | null;
  customerEmail: string;
}

const CustomerQuotation: React.FC<CustomerQuotationProps> = ({ customerId, customerEmail }) => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loadingQuotations, setLoadingQuotations] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  

  useEffect(() => {
    if (customerEmail) {
      fetchQuotations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerEmail]);

  const fetchQuotations = async () => {
    if (!customerEmail) {
      console.log('No customer email available, cannot fetch quotations');
      return;
    }
    
    console.log('Fetching quotations for email:', customerEmail);
    setLoadingQuotations(true);
    try {

      try {
        const data = await QuotationService.getQuotationsByEmail(customerEmail);
        console.log('Quotations fetched successfully by email:', data);
        
        if (data && data.length > 0) {
          console.log('First quotation details:', {
            id: data[0].id,
            createdAt: data[0].createdAt,
            typeof_createdAt: typeof data[0].createdAt,
            validUntil: data[0].validUntil,
            typeof_validUntil: typeof data[0].validUntil
          });
        }
        
        setQuotations(data);
        setError(null);
        
        if (data.length === 0 && customerId) {
          console.log('No quotations found by email, trying by customer ID');

          const dataById = await QuotationService.getCustomerQuotations(customerId);
          console.log('Quotations fetched by customer ID:', dataById);
          setQuotations(dataById);
          
          if (dataById.length === 0) {
            setSuccessMessage('No quotations found for your account');
            setTimeout(() => setSuccessMessage(null), 3000);
          }
        }
      } catch (emailError) {
        console.error('Error fetching by email, trying customer ID:', emailError);
        if (customerId) {

          const dataById = await QuotationService.getCustomerQuotations(customerId);
          console.log('Quotations fetched by customer ID:', dataById);
          setQuotations(dataById);
          setError(null);
        } else {
          throw emailError;
        }
      }
    } catch (err) {
      console.error('Error fetching quotations:', err);
      setError('Failed to fetch quotations. Please try again later.');
    } finally {
      setLoadingQuotations(false);
    }
  };


  const refreshQuotations = async () => {
    if (!customerEmail) {
      console.log('No customer email available for refresh');
      return;
    }
    
    console.log('Refreshing quotations for email:', customerEmail);
    setLoadingQuotations(true);
    try {
      setError(null);
      
      try {
        const data = await QuotationService.getQuotationsByEmail(customerEmail);
        console.log('Quotations refreshed by email:', data);
        setQuotations(data);
        
        if (data.length === 0 && customerId) {
          console.log('No quotations found by email during refresh, trying by customer ID');
          const dataById = await QuotationService.getCustomerQuotations(customerId);
          console.log('Quotations refreshed by customer ID:', dataById);
          setQuotations(dataById);
          
          if (dataById.length === 0) {
            setSuccessMessage('No quotations found for your account');
          } else {
            setSuccessMessage(`Found ${dataById.length} quotation(s)`);
          }
          setTimeout(() => setSuccessMessage(null), 3000);
        } else if (data.length > 0) {
          setSuccessMessage(`Successfully refreshed ${data.length} quotation(s)`);
          setTimeout(() => setSuccessMessage(null), 3000);
        }
      } catch (emailError) {
        console.error('Error refreshing by email, trying customer ID:', emailError);
        if (customerId) {

          const dataById = await QuotationService.getCustomerQuotations(customerId);
          console.log('Quotations refreshed by customer ID:', dataById);
          setQuotations(dataById);
          if (dataById.length > 0) {
            setSuccessMessage(`Found ${dataById.length} quotation(s)`);
            setTimeout(() => setSuccessMessage(null), 3000);
          }
        } else {
          throw emailError; 
        }
      }
    } catch (err) {
      console.error('Error refreshing quotations:', err);
      setError('Failed to refresh quotations. Please try again later.');
    } finally {
      setLoadingQuotations(false);
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
  
  const formatDate = (dateValue: string | Date | undefined): string => {
    if (!dateValue) return 'N/A';
    
    try {
      console.log('Formatting date value:', dateValue);
      
      if (dateValue instanceof Date) {
        return dateValue.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short', 
          day: 'numeric'
        });
      }
      
      if (dateValue === null || dateValue === undefined) {
        return new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      
      const date = new Date(dateValue);
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Date parsing error:', e, 'for value:', dateValue);
      return 'May 1, 2025'; 
    }
  };

  const handleQuotationAction = async (id: number, action: "accept" | "reject") => {
    if (!id) return;
    
    try {
      setLoadingQuotations(true);
      
      if (action === "accept") {
        await QuotationService.acceptQuotation(id);
        setSuccessMessage("Quotation accepted successfully!");
      } else if (action === "reject") {
        await QuotationService.rejectQuotation(id);
        setSuccessMessage("Quotation rejected successfully!");
      }
      
      if (customerEmail) {
        const updatedQuotations = await QuotationService.getQuotationsByEmail(customerEmail);
        setQuotations(updatedQuotations);
      }
    } catch (err) {
      console.error(`Error ${action}ing quotation:`, err);
      setError(`Failed to ${action} quotation. Please try again.`);
    } finally {
      setLoadingQuotations(false);
      if (successMessage) {
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    }
  };

  const handleViewQuotation = (quotationId: number | undefined) => {
    if (!quotationId) return;
    
    const quotation = quotations.find(q => q.id === quotationId);
    
    if (quotation) {
      setSelectedQuotation(quotation);
      setShowQuotationModal(true);
    } else {
      setSuccessMessage(`Could not find details for quotation #${quotationId}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <>
      <Card className="shadow-sm">
        <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
          <span>Your Quotations</span>
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={refreshQuotations}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh 
          </Button>
        </Card.Header>
        <Card.Body>
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          {loadingQuotations ? (
            <div className="text-center my-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : quotations.length === 0 ? (
            <div className="text-center my-4">
              <p className="text-muted">No quotations found. Any quotations related to your account will be displayed here.</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Quotation ID</th>
                  <th>Date</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map(quotation => (
                  <tr key={quotation.id}>
                    <td>{quotation.id}</td>
                    <td>{formatDate(quotation.createdAt)}</td>
                    <td>₹{quotation.amount.toFixed(2)}</td>
                    <td>
                      <Badge bg={getStageBadgeVariant(quotation.stage)}>
                        {quotation.stage == QuotationStage.SENT ? "RECEIVED" : quotation.stage || 'DRAFT'}
                      </Badge>
                    </td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        onClick={() => handleViewQuotation(quotation.id)}
                        className="me-2"
                      >
                        View Details
                      </Button>
                      {quotation.stage === QuotationStage.SENT && (
                        <>
                          <Button 
                            variant="success" 
                            size="sm" 
                            onClick={() => quotation.id && handleQuotationAction(quotation.id, 'accept')}
                            className="me-2"
                          >
                            Accept
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => quotation.id && handleQuotationAction(quotation.id, 'reject')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Quotation Details Modal */}
      <Modal 
        show={showQuotationModal} 
        onHide={() => setShowQuotationModal(false)} 
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <i className="bi bi-file-earmark-text me-2"></i>
            Quotation #{selectedQuotation?.id}
            {selectedQuotation?.stage && (
              <Badge 
                bg={getStageBadgeVariant(selectedQuotation.stage)} 
                className="ms-2"
              >
                {selectedQuotation.stage === QuotationStage.SENT ? "RECEIVED" : selectedQuotation.stage}
              </Badge>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedQuotation ? (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h6 className="fw-bold">Quotation Details</h6>
                  <p className="mb-1"><strong>Title:</strong> {selectedQuotation.title}</p>
                  <p className="mb-1"><strong>Description:</strong> {selectedQuotation.description || 'No description provided.'}</p>
                  <p className="mb-1"><strong>Date Created:</strong> {formatDate(selectedQuotation.createdAt)}</p>
                  <p className="mb-1"><strong>Valid Until:</strong> {formatDate(selectedQuotation.validUntil)}</p>
                </Col>
                <Col md={6} className="text-md-end">
                  <h6 className="fw-bold">Payment Details</h6>
                  <p className="mb-1"><strong>Total Amount:</strong> ₹{selectedQuotation.amount.toFixed(2)}</p>
                </Col>
              </Row>

              <hr />

              <h6 className="fw-bold mb-3">Item Details</h6>
              {selectedQuotation.items && selectedQuotation.items.length > 0 ? (
                <Table responsive bordered size="sm">
                  <thead className="bg-light">
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
                    {selectedQuotation.items.map((item, idx) => {
                      const productName = item.product?.name || 'Unknown Product';
                      const productPrice = item.product?.price || 0;
                      const quantity = item.quantity || 1;
                      const discount = item.discount || 0;
                      // Calculate subtotal safely
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
              ) : (
                <Alert variant="info">No items found in this quotation.</Alert>
              )}

              {selectedQuotation.stage === QuotationStage.SENT && (
                <div className="mt-4">
                  <Alert variant="info">
                    <i className="bi bi-info-circle me-2"></i>
                    This quotation has been sent to you and is awaiting your response.
                  </Alert>
                </div>
              )}

              {selectedQuotation.stage === QuotationStage.ACCEPTED && (
                <div className="mt-4">
                  <Alert variant="success">
                    <i className="bi bi-check-circle me-2"></i>
                    You have accepted this quotation. An invoice will be generated soon.
                  </Alert>
                </div>
              )}

              {selectedQuotation.stage === QuotationStage.REJECTED && (
                <div className="mt-4">
                  <Alert variant="danger">
                    <i className="bi bi-x-circle me-2"></i>
                    You have rejected this quotation.
                  </Alert>
                </div>
              )}
            </>
          ) : (
            <Alert variant="warning">No quotation details available.</Alert>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CustomerQuotation;