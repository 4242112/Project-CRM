/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import TicketService, { Ticket, TicketStatus, formatDate } from '../../services/TicketService';
import AITicketService, { TicketAnalysis } from '../../services/AITicketService';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Alert, Spinner, Tabs, Tab } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import AuthService from '../../services/AuthService';
import Pagination from '../common/Pagination';

const OpenTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(10);
  
  // AI features
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [ticketAnalysis, setTicketAnalysis] = useState<TicketAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<string>('details');
  
  const currentEmployee = AuthService.getCurrentEmployee();
  const isAdmin = currentEmployee?.role === 'ADMIN';
  
  useEffect(() => {
    console.log('Current employee:', currentEmployee);
    console.log('Is admin:', isAdmin);
  }, []);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const allTickets = await TicketService.getAllTickets();
      
      const openTickets = allTickets.filter(ticket => ticket.status === TicketStatus.NEW);
      
      setTickets(openTickets);
      setError(null);
    } catch (err) {
      setError('Error loading open tickets. Please try again later.');
      console.error('Error fetching open tickets:', err);
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
    setTicketAnalysis(null);
    setAiError(null);
    setActiveTab('details');
  };

  const handleAcceptTicket = async () => {
    if (!selectedTicket || !currentEmployee) return;
    
    try {
      await TicketService.assignTicketToEmployee(
        selectedTicket.id!, currentEmployee.userId!)

      setShowTicketModal(false);
      fetchTickets(); // Refresh tickets
      setError(null);
    } catch (err) {
      setError('Failed to accept ticket. Please try again.');
      console.error('Error updating ticket:', err);
    }
  };
  
  // AI features
  const analyzeTicket = async () => {
    if (!selectedTicket || !selectedTicket.id) return;
    
    setAiLoading(true);
    setAiError(null);
    
    try {
      const analysis = await AITicketService.analyzeTicket(selectedTicket.id);
      setTicketAnalysis(analysis);
    } catch (err) {
      console.error('Error analyzing ticket:', err);
      setAiError('Failed to analyze ticket. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };
  
  const getSentimentBadge = (sentiment?: string) => {
    if (!sentiment) return 'secondary';
    
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'danger';
      case 'neutral':
        return 'info';
      default:
        return 'secondary';
    }
  };
  
  const getUrgencyBadge = (urgency?: string) => {
    if (!urgency) return 'secondary';
    
    switch (urgency.toLowerCase()) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const showAcceptButton = !isAdmin;

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
          <i className="bi bi-inbox me-2"></i>
          Open Tickets
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
                  <p className="mt-3">No new tickets available</p>
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
                          <td>
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="me-2"
                              onClick={() => handleOpenTicket(ticket)}
                            >
                              <i className="bi bi-eye"></i> View
                            </Button>
                            {showAcceptButton && (
                              <Button 
                                variant="outline-success" 
                                size="sm"
                                onClick={() => {
                                  setSelectedTicket(ticket);
                                  handleAcceptTicket();
                                }}
                              >
                                <i className="bi bi-check-circle"></i> Accept
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Pagination */}
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

      {/* Enhanced Ticket Details Modal with AI Analysis */}
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
            <>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => k && setActiveTab(k)}
                className="mb-4"
              >
                <Tab eventKey="details" title={<><i className="bi bi-info-circle me-1"></i> Details</>}>
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
                    </Row>
                  </div>
                </Tab>
                <Tab eventKey="ai-analysis" title={<><i className="bi bi-robot me-1"></i> AI Analysis</>}>
                  <div>
                    {aiError && <Alert variant="danger">{aiError}</Alert>}
                    
                    {!ticketAnalysis && !aiLoading && (
                      <div className="text-center p-5">
                        <i className="bi bi-graph-up text-primary" style={{ fontSize: '3rem' }}></i>
                        <p className="mt-3">Get AI-powered insights about this ticket</p>
                        <Button 
                          variant="primary" 
                          onClick={analyzeTicket}
                        >
                          <i className="bi bi-magic me-1"></i> Analyze Ticket
                        </Button>
                      </div>
                    )}
                    
                    {aiLoading && (
                      <div className="text-center p-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3">Analyzing ticket...</p>
                      </div>
                    )}
                    
                    {ticketAnalysis && (
                      <Card className="bg-light">
                        <Card.Header>
                          <h5 className="mb-0">Ticket Analysis</h5>
                        </Card.Header>
                        <Card.Body>
                          <Row>
                            <Col md={6}>
                              <p>
                                <strong>Sentiment:</strong>{' '}
                                <Badge bg={getSentimentBadge(ticketAnalysis.sentiment)}>
                                  {ticketAnalysis.sentiment}
                                </Badge>
                              </p>
                              <p>
                                <strong>Urgency:</strong>{' '}
                                <Badge bg={getUrgencyBadge(ticketAnalysis.urgency)}>
                                  {ticketAnalysis.urgency}
                                </Badge>
                              </p>
                            </Col>
                            <Col md={6}>
                              <p><strong>Complexity:</strong> {ticketAnalysis.complexity}</p>
                              <p><strong>Keywords:</strong> {ticketAnalysis.keywords}</p>
                            </Col>
                          </Row>
                          
                          <hr />
                          
                          <h6 className="mb-3">Smart Recommendations</h6>
                          <ul className="list-group">
                            {ticketAnalysis.urgency.toLowerCase() === 'high' && (
                              <li className="list-group-item list-group-item-danger">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i> 
                                This ticket requires immediate attention
                              </li>
                            )}
                            {ticketAnalysis.complexity.toLowerCase() === 'complex' && (
                              <li className="list-group-item list-group-item-warning">
                                <i className="bi bi-puzzle-fill me-2"></i>
                                May require specialized knowledge or escalation
                              </li>
                            )}
                            {ticketAnalysis.sentiment.toLowerCase() === 'negative' && (
                              <li className="list-group-item list-group-item-info">
                                <i className="bi bi-emoji-frown-fill me-2"></i>
                                Customer appears frustrated; consider prioritizing
                              </li>
                            )}
                          </ul>
                        </Card.Body>
                      </Card>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTicketModal(false)}>
            Close
          </Button>
          {showAcceptButton && (
            <Button variant="primary" onClick={handleAcceptTicket}>
              <i className="bi bi-check-circle me-1"></i> Accept Ticket
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OpenTickets;