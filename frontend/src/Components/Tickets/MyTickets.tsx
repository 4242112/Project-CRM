import React, { useState, useEffect } from 'react';
import TicketService, { Ticket, TicketStatus, formatDate } from '../../services/TicketService';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import AuthService from '../../services/AuthService';
import Pagination from '../common/Pagination';

const MyTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');

  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(5);

  const currentEmployee = AuthService.getCurrentEmployee();

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      if (!currentEmployee?.userId) {
        setError('Unable to identify current employee.');
        setLoading(false);
        return;
      }

      const allTickets = await TicketService.getAllTickets();

      const myTickets = allTickets.filter(
        (ticket) =>
          (ticket.employeeName === currentEmployee.name ||
            ticket.employeeId === currentEmployee.userId ||
            ticket.employeeEmail === currentEmployee.email) &&
          (ticket.status === TicketStatus.IN_PROGRESS || ticket.status === TicketStatus.RESOLVED)
      );

      // Sort tickets to ensure IN_PROGRESS tickets appear above RESOLVED tickets
      const sortedTickets = [...myTickets].sort((a, b) => {
        // First compare by status: IN_PROGRESS tickets should come first
        if (a.status === TicketStatus.IN_PROGRESS && b.status !== TicketStatus.IN_PROGRESS) {
          return -1;
        }
        if (a.status !== TicketStatus.IN_PROGRESS && b.status === TicketStatus.IN_PROGRESS) {
          return 1;
        }
        // If both have the same status or neither is IN_PROGRESS, sort by creation date (newest first)
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      });

      setTickets(sortedTickets);
      setError(null);
    } catch (err) {
      setError('Error loading your tickets. Please try again later.');
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

  const handleCancelEdit = () => {
    setViewMode('view');
  };

  const handleSaveTicket = async () => {
    if (!selectedTicket) return;

    try {
      await TicketService.updateTicket(selectedTicket.id!, selectedTicket);
      setShowTicketModal(false);
      fetchTickets();
      setError(null);
    } catch (err) {
      setError('Failed to update ticket. Please try again.');
      console.error('Error updating ticket:', err);
    }
  };

  const handleTicketResolved = async () => {
    if (!selectedTicket) return;

    try {
      const updatedTicket = { ...selectedTicket, status: TicketStatus.RESOLVED };
      await TicketService.updateTicket(selectedTicket.id!, updatedTicket);
      setShowTicketModal(false);
      fetchTickets();
      setError(null);
    } catch (err) {
      setError('Failed to mark ticket as resolved. Please try again.');
      console.error('Error updating ticket:', err);
    }
  };

  // Get current tickets for the page
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);

  return (
    <Container fluid className="mt-4">
      <div
        className="d-flex justify-content-between align-items-center mb-4 p-3 rounded"
        style={{
          backgroundColor: '#1a2236',
          color: 'white',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        }}
      >
        <h3 className="m-0">
          <i className="bi bi-person-workspace me-2"></i>
          My Tickets
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
                  <p className="mt-3">You don't have any tickets currently assigned to you</p>
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
                            {ticket.status === TicketStatus.IN_PROGRESS && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => {
                                  setSelectedTicket(ticket);
                                  handleTicketResolved();
                                }}
                              >
                                <i className="bi bi-check-circle"></i> Resolve
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <Pagination
                    currentPage={currentPage}
                    itemsPerPage={ticketsPerPage}
                    totalItems={tickets.length}
                    onPageChange={(page) => setCurrentPage(page)}
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
                    value={selectedTicket.subject || ''}
                    readOnly
                    disabled
                    className="bg-light"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={selectedTicket.description || ''}
                    readOnly
                    disabled
                    className="bg-light"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={selectedTicket.status}
                    onChange={(e) => setSelectedTicket({ ...selectedTicket, status: e.target.value })}
                  >
                    <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
                    <option value={TicketStatus.RESOLVED}>Resolved</option>
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
              {selectedTicket?.status === TicketStatus.IN_PROGRESS && (
                <Button variant="success" onClick={handleTicketResolved}>
                  <i className="bi bi-check-circle me-1"></i> Mark as Resolved
                </Button>
              )}
              <Button variant="primary" onClick={handleEditTicket}>
                <i className="bi bi-pencil me-1"></i> Edit
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveTicket}>
                Save Changes
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyTickets;