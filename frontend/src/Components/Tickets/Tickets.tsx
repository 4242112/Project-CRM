import React, { useState, useEffect } from 'react';
import TicketService, { Ticket, TicketStatus, formatDate } from '../../services/TicketService';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import AuthService from '../../services/AuthService';
import Pagination from '../common/Pagination';

const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicket, setNewTicket] = useState<Ticket>({
    subject: '',
    description: '',
    status: TicketStatus.NEW
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<number | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(10); // Show 10 tickets per page
  
  const isEmployee = AuthService.isEmployeeLoggedIn();
  const currentEmployee = AuthService.getCurrentEmployee();
  const isAdmin = currentEmployee?.role === 'ADMIN';

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await TicketService.getAllTickets();
      setTickets(data);
      setError(null);
    } catch (err) {
      setError('Error loading tickets. Please try again later.');
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
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

  const handleOpenTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setViewMode('view');
    setShowTicketModal(true);
  };

  const handleEditTicket = () => {
    setViewMode('edit');
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket || !selectedTicket.id) return;
    
    try {
      await TicketService.updateTicket(selectedTicket.id, selectedTicket);
      setShowTicketModal(false);
      fetchTickets(); 
      setError(null);
    } catch (err) {
      setError('Failed to update ticket. Please try again.');
      console.error('Error updating ticket:', err);
    }
  };

  const handleCreateTicket = async () => {

    const customerId = 1; 
    
    try {
      await TicketService.createTicket(newTicket, customerId);
      setShowCreateModal(false);
      setNewTicket({
        subject: '',
        description: '',
        status: TicketStatus.NEW
      });
      fetchTickets(); 
      setError(null);
    } catch (err) {
      setError('Failed to create ticket. Please try again.');
      console.error('Error creating ticket:', err);
    }
  };

  const confirmDelete = (id: number) => {
    setTicketToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteTicket = async () => {
    if (ticketToDelete === null) return;
    
    try {
      await TicketService.deleteTicket(ticketToDelete);
      setShowDeleteConfirm(false);
      fetchTickets(); 
      setError(null);
    } catch (err) {
      setError('Failed to delete ticket. Please try again.');
      console.error('Error deleting ticket:', err);
    }
  };

  const handleTicket = async () => {
    if (!selectedTicket?.id || !currentEmployee?.userId) return;
    
    try {
      await TicketService.assignTicketToEmployee(selectedTicket.id, currentEmployee.userId);
      setShowTicketModal(false);
      fetchTickets();
      setError(null);
    } catch (err) {
      setError('Failed to handle ticket. Please try again.');
      console.error('Error handling ticket:', err);
    }
  };

  // Get current tickets for the page
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);

  return (
    <Container fluid className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded" style={{ 
        backgroundColor: '#1a2236', 
        color: 'white',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <h3 className="m-0">
          <i className="bi bi-ticket-perforated me-2"></i>
          Support Tickets
        </h3>
        <div>
          <Button 
            variant="light" 
            size="sm"
            onClick={fetchTickets}
            className="me-2"
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </Button>
          <Button 
            variant="light" 
            size="sm" 
            onClick={() => setShowCreateModal(true)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            New Ticket
          </Button>
        </div>
      </div>

      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <Card>
            <Card.Body>
              {loading ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center p-5">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-3">No tickets found</p>
                </div>
              ) : (
                <>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Subject</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td>{ticket.id}</td>
                          <td>{ticket.subject}</td>
                          <td>{ticket.customerName}</td>
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
                              className="me-2"
                              onClick={() => handleOpenTicket(ticket)}
                            >
                              <i className="bi bi-eye"></i> View
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => ticket.id && confirmDelete(ticket.id)}
                            >
                              <i className="bi bi-trash"></i> Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Pagination Component */}
                  <Pagination 
                    currentPage={currentPage} 
                    itemsPerPage={ticketsPerPage} 
                    totalItems={tickets.length} 
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Ticket Details/Edit Modal */}
      <Modal 
        show={showTicketModal} 
        onHide={() => setShowTicketModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {viewMode === 'view' ? 'Ticket Details' : 'Edit Ticket'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket && (
            viewMode === 'view' ? (
              <div>
                <h5>{selectedTicket.subject}</h5>
                <Badge bg={getBadgeColor(selectedTicket.status as string)} className="mb-3">
                  {selectedTicket.status}
                </Badge>

                <p><strong>Description:</strong></p>
                <p className="border p-3 bg-light">{selectedTicket.description}</p>

                <Row className="mb-3">
                  <Col md={6}>
                    <p className="mb-1"><strong>Customer:</strong></p>
                    <p>{selectedTicket.customerName}</p>
                  </Col>
                  <Col md={6}>
                    <p className="mb-1"><strong>Email:</strong></p>
                    <p>{selectedTicket.customerEmail}</p>
                  </Col>
                </Row>

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
              </div>
            ) : (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedTicket.subject}
                    onChange={(e) => setSelectedTicket({...selectedTicket, subject: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={selectedTicket.description}
                    onChange={(e) => setSelectedTicket({...selectedTicket, description: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={selectedTicket.status}
                    onChange={(e) => setSelectedTicket({...selectedTicket, status: e.target.value})}
                  >
                    <option value={TicketStatus.NEW}>{TicketStatus.NEW}</option>
                    <option value={TicketStatus.IN_PROGRESS}>{TicketStatus.IN_PROGRESS}</option>
                    <option value={TicketStatus.RESOLVED}>{TicketStatus.RESOLVED}</option>
                    <option value={TicketStatus.CLOSED}>{TicketStatus.CLOSED}</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            )
          )}
        </Modal.Body>
        <Modal.Footer>
          {viewMode === 'view' ? (
            <>
              <Button variant="secondary" onClick={() => setShowTicketModal(false)}>
                Close
              </Button>
              {isEmployee && !isAdmin && selectedTicket?.status === TicketStatus.NEW && (
                <Button variant="success" onClick={handleTicket}>
                  <i className="bi bi-check-circle me-1"></i> Handle Ticket
                </Button>
              )}
              <Button variant="primary" onClick={handleEditTicket}>
                <i className="bi bi-pencil me-1"></i> Edit
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setViewMode('view')}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleUpdateTicket}>
                <i className="bi bi-check2 me-1"></i> Save Changes
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Create Ticket Modal */}
      <Modal 
        show={showCreateModal} 
        onHide={() => setShowCreateModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter ticket subject"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Describe your issue..."
                value={newTicket.description}
                onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateTicket}
            disabled={!newTicket.subject || !newTicket.description}
          >
            Create Ticket
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this ticket? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteTicket}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Tickets;