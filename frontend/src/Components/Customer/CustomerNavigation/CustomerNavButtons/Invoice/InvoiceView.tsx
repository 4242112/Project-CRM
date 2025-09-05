import React from 'react';
import { Modal, Button, Row, Col, Table } from 'react-bootstrap';
import { Invoice } from '../../../../../services/InvoiceService';
import './InvoiceView.css';
import { Customer } from '../../../../../services/CustomerService';

interface InvoiceViewProps {
  show: boolean;
  onHide: () => void;
  invoice: Invoice;
  customer: Customer | null;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ 
  show, 
  onHide, 
  invoice, 
  customer 
}) => {
  const handlePrint = () => {
    const printContents = document.getElementById('printableInvoice')?.innerHTML;
    const originalContents = document.body.innerHTML;
    
    if (printContents) {
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Invoice #{invoice.invoiceNumber}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div id="printableInvoice" className="invoice-container">
          <div className="invoice-header">
            <h2>Invoice</h2>
            
            <div className="business-details">
              <div className="business-name">ClientNest Solutions</div>
              <div>7th Floor Nayti Park</div>
              <div>Pune, Maharashtra 414002</div>
              <div>Phone: (800) 555-8800</div>
              <div>Email: Admin@clientnest.com</div>
            </div>
            
            <Row className="invoice-info">
              <Col md={6}>
                <div className="billing-to">
                  <h6>Bill To</h6>
                  <div>{invoice.customerName || customer?.name || ''}</div>
                  <div>{customer?.address || ''}</div>
                  <div>{customer?.email || ''}</div>
                  <div>{customer?.phoneNumber || ''}</div>
                </div>
              </Col>
              <Col md={6}>
                <div className="invoice-details">
                  <h6>Invoice Details</h6>
                  <div><strong>Invoice #</strong> {invoice.invoiceNumber}</div>
                  <div><strong>Invoice date</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}</div>
                  <div><strong>Due date</strong> {new Date(invoice.dueDate).toLocaleDateString()}</div>
                </div>
              </Col>
            </Row>
          </div>

          <div className="invoice-body">
            <Table bordered hover>
              <thead className="bg-light">
                <tr>
                  <th>Product/Services</th>
                  <th style={{ width: '100px' }}>Quantity</th>
                  <th style={{ width: '120px' }}>Rate</th>
                  <th style={{ width: '120px' }}>Discount</th>
                  <th style={{ width: '120px' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => {
                  // Calculate the item amount based on quantity, price, and discount
                  const price = item.product?.price || 0;
                  const quantity = item.quantity || 0;
                  const discount = item.discount || 0;
                  const amount = quantity * price * (1 - discount / 100);

                  return (
                    <tr key={index}>
                      <td>{item.product?.name || 'Unknown Product'}</td>
                      <td>{quantity}</td>
                      <td>₹{price.toFixed(2)}</td>
                      <td>{discount}%</td>
                      <td className="text-end">₹{amount.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            <div className="invoice-summary">
              <Row>
                <Col md={6}></Col>
                <Col md={6}>
                  <div className="summary-item">
                    <div>Subtotal</div>
                    <div>₹{invoice.subtotal.toFixed(2)}</div>
                  </div>
                  <div className="summary-item">
                    <div>Tax {invoice.taxRate}%</div>
                    <div>₹{invoice.taxAmount.toFixed(2)}</div>
                  </div>
                  
                  <div className="summary-item total">
                    <div>Total</div>
                    <div>₹{invoice.total.toFixed(2)}</div>
                  </div>
                </Col>
              </Row>
            </div>

            <div className="invoice-footer">
              <div className="payment-info">
                <h6>Payment Information</h6>
                <p>Please make payment by bank transfer to:</p>
                <p>Bank: National Bank<br />
                Account Name: ClientNest Solutions<br />
                Account Number: 1234567890<br /></p>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handlePrint}>
          <i className="bi bi-printer me-2"></i>
          Print Invoice
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InvoiceView;