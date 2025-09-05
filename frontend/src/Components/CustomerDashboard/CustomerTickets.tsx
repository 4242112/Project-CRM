import React, { useState, useEffect } from 'react';
import { Card, Alert, Button, Spinner, Table, Badge, Modal, Form, Row, Col } from "react-bootstrap";
import TicketService, { Ticket, TicketStatus, formatDate } from '../../services/TicketService';

interface CustomerTicketsProps {
  customerId: number | null;
  customerEmail: string;
}

const CustomerTickets: React.FC<CustomerTicketsProps> = ({ customerId, customerEmail }) => {

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  const [showTicketModal, setShowTicketModal] = useState<boolean>(false);
  const [ticketSubject, setTicketSubject] = useState<string>('');
  const [ticketDescription, setTicketDescription] = useState<string>('');
  const [creatingTicket, setCreatingTicket] = useState<boolean>(false);


  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketDetailsModal, setShowTicketDetailsModal] = useState<boolean>(false);

  const [processingAction, setProcessingAction] = useState<boolean>(false);


  const statusPriority: { [key: string]: number } = {
    [TicketStatus.NEW]: 1,
    [TicketStatus.RESOLVED]: 2,
    [TicketStatus.IN_PROGRESS]: 3,
    [TicketStatus.CLOSED]: 4
  };

  const sortTicketsByPriority = (ticketsToSort: Ticket[]): Ticket[] => {
    return [...ticketsToSort].sort((a, b) => {
      const statusA = a.status as string;
      const statusB = b.status as string;
      return (statusPriority[statusA] || 999) - (statusPriority[statusB] || 999);
    });
  };

  useEffect(() => {
    if (customerId || customerEmail) {
      fetchCustomerTickets();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, customerEmail]);


  const fetchCustomerTickets = async () => {
    if (!customerId && !customerEmail) {
      console.log('No customer ID or email available, cannot fetch tickets');
      return;
    }
    
    setLoadingTickets(true);
    try {
      let data: Ticket[] = [];
      
      if (customerId) {
        data = await TicketService.getTicketsByCustomerId(customerId);
      } else if (customerEmail) {
        data = await TicketService.getTicketsByEmail(customerEmail);
      }
      

      setTickets(sortTicketsByPriority(data));
      setError(null);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to fetch tickets. Please try again later.');
    } finally {
      setLoadingTickets(false);
    }
  };


  const refreshTickets = async () => {
    setSuccessMessage(null);
    await fetchCustomerTickets();
    setSuccessMessage('Tickets refreshed successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleCreateTicket = async () => {
    if (!ticketSubject || !ticketDescription || !customerId) {
      setError('Please fill in all fields to create a ticket.');
      return;
    }

    setCreatingTicket(true);
    try {
      const newTicket: Ticket = {
        subject: ticketSubject,
        description: ticketDescription,
        status: TicketStatus.NEW,
        customerId: customerId
      };

      await TicketService.createTicket(newTicket, customerId);
      setSuccessMessage('Ticket created successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setShowTicketModal(false);
      setTicketSubject('');
      setTicketDescription('');
      await fetchCustomerTickets(); 
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('Failed to create ticket. Please try again later.');
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowTicketDetailsModal(true);
  };

  const handleConfirmResolution = async (ticketId: number | undefined) => {
    if (!ticketId) return;
    
    setProcessingAction(true);
    try {
      await TicketService.confirmTicketResolution(ticketId);
      setSuccessMessage('Ticket resolution confirmed and closed successfully!');
      setShowTicketDetailsModal(false);
      await fetchCustomerTickets(); 
    } catch (err) {
      console.error('Error confirming ticket resolution:', err);
      setError('Failed to confirm ticket resolution. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };


  const handleDenyResolution = async (ticketId: number | undefined) => {
    if (!ticketId) return;
    
    setProcessingAction(true);
    try {
      await TicketService.denyTicketResolution(ticketId);
      console.log('Ticket resolution denied:', ticketId);
      setSuccessMessage('Ticket returned to in-progress status.');
      setShowTicketDetailsModal(false);
      await fetchCustomerTickets();
    } catch (err) {
      console.error('Error denying ticket resolution:', err);
      setError('Failed to deny ticket resolution. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  const getBadgeColor = (status?: string) => {
    switch (status) {
      case TicketStatus.NEW:
        return 'primary';
      case TicketStatus.IN_PROGRESS:
        return 'warning';
      case TicketStatus.RESOLVED:
        return 'success';
      case TicketStatus.CLOSED:
        return 'secondary';
      default:
        return 'light';
    }
  };

  if (loadingTickets) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading your tickets...</p>
      </div>
    );
  }
  
  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Your Support Tickets</h5>
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={refreshTickets}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </Button>
        </Card.Header>
        <Card.Body>
          {successMessage && (
            <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}
          
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {tickets.length === 0 ? (
            <div className="text-center p-5">
              <i className="bi bi-ticket-detailed display-4 mb-4 text-muted"></i>
              <h4>No Tickets Found</h4>
              <p className="text-muted mb-4">
                You haven't created any support tickets yet. Need help? Create a new ticket.
              </p>
              <Button variant="primary" onClick={() => setShowTicketModal(true)}>Create New Ticket</Button>
            </div>
          ) : (
            <>
              <div className="mb-3">
                <Button 
                  variant="primary" 
                  onClick={() => setShowTicketModal(true)}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  New Ticket
                </Button>
              </div>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>{ticket.id}</td>
                      <td>{ticket.subject}</td>
                      <td>
                        <Badge bg={getBadgeColor(ticket.status as string)}>
                          {ticket.status}
                        </Badge>
                      </td>
                      <td>{formatDate(ticket.createdAt)}</td>
                      <td>{formatDate(ticket.updatedAt)}</td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          onClick={() => handleViewTicket(ticket)}
                        >
                          <i className="bi bi-eye me-1"></i>View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Create Ticket Modal */}
      <Modal show={showTicketModal} onHide={() => setShowTicketModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="ticketSubject">
              <Form.Label>Subject</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter ticket subject" 
                value={ticketSubject} 
                onChange={(e) => setTicketSubject(e.target.value)} 
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="ticketDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                placeholder="Enter ticket description" 
                value={ticketDescription} 
                onChange={(e) => setTicketDescription(e.target.value)} 
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTicketModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateTicket} 
            disabled={creatingTicket}
          >
            {creatingTicket ? 'Creating...' : 'Create Ticket'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Ticket Details Modal */}
      <Modal 
        show={showTicketDetailsModal} 
        onHide={() => setShowTicketDetailsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Ticket Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket && (
            <div>
              <h5>{selectedTicket.subject}</h5>
              <Badge bg={getBadgeColor(selectedTicket.status as string)} className="mb-3">
                {selectedTicket.status}
              </Badge>

              <p className="mb-1"><strong>Description:</strong></p>
              <p className="border p-3 bg-light">{selectedTicket.description}</p>


              <Row>
                <Col md={6}>
                  <p className="mb-1"><strong>Created:</strong></p>
                  <p>{formatDate(selectedTicket.createdAt)}</p>
                </Col>
                <Col md={6}>
                  <p className="mb-1"><strong>Last Updated:</strong></p>
                  <p>{formatDate(selectedTicket.updatedAt)}</p>
                </Col>
              </Row>

              {/* Resolution confirmation/denial section for RESOLVED tickets */}
              {selectedTicket.status === TicketStatus.RESOLVED && (
                <div className="mt-3 border-top pt-3">
                  <h6>Resolution Confirmation</h6>
                  <p>This ticket has been resolved by our support team. Please confirm if the issue has been resolved to your satisfaction.</p>
                  
                  <div className="d-flex justify-content-end gap-2">
                    <Button 
                      variant="success" 
                      onClick={() => handleConfirmResolution(selectedTicket.id)}
                      disabled={processingAction}
                    >
                      <i className="bi bi-check-circle me-1"></i>
                      Confirm Resolution
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={() => handleDenyResolution(selectedTicket.id)}
                      disabled={processingAction}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Deny Resolution
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTicketDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CustomerTickets;