import React, { useState, useEffect } from 'react';
import TicketService, { Ticket, TicketStatus, formatDate } from '../../services/TicketService';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Pagination from '../common/Pagination';

const ClosedTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(10);

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const allTickets = await TicketService.getAllTickets();
      
      const closedTickets = allTickets.filter(ticket => ticket.status === TicketStatus.CLOSED);
      
      setTickets(closedTickets);
      setError(null);
    } catch (err) {
      setError('Error loading closed tickets. Please try again later.');
      console.error('Error fetching closed tickets:', err);
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
    setShowTicketModal(true);
  };

  // Get current tickets for the active page
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
          <i className="bi bi-archive me-2"></i>
          Closed Tickets
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
                  <p className="mt-3">No closed tickets found</p>
                </div>
              ) : (
                <>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Subject</th>
                        <th>Customer</th>
                        <th>Handler</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Closed</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td>{ticket.id}</td>
                          <td>{ticket.subject}</td>
                          <td>{ticket.customerName}</td>
                          <td>{ticket.employeeName || 'N/A'}</td>
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
                    onPageChange={(page: number) => setCurrentPage(page)}
                  />
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Ticket Details Modal */}
      <Modal 
        show={showTicketModal} 
        onHide={() => setShowTicketModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Ticket Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket && (
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

              <Row className="mb-3">
                <Col md={6}>
                  <p className="mb-1"><strong>Handled By:</strong></p>
                  <p>{selectedTicket.employeeName || 'N/A'}</p>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <p className="mb-1"><strong>Created:</strong></p>
                  <p>{formatDate(selectedTicket.createdAt)}</p>
                </Col>
                <Col md={6}>
                  <p className="mb-1"><strong>Closed:</strong></p>
                  <p>{formatDate(selectedTicket.updatedAt)}</p>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTicketModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ClosedTickets;