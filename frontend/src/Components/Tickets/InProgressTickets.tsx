import React, { useState, useEffect } from 'react';
import TicketService, { Ticket, TicketStatus, formatDate } from '../../services/TicketService';
import AITicketService, { ResponseSuggestions } from '../../services/AITicketService';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form, Alert, Tabs, Tab, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const InProgressTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
  
  // AI features
  const [aiResponseSuggestions, setAiResponseSuggestions] = useState<ResponseSuggestions | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>('');
  const [customResponse, setCustomResponse] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('details');
  const [responseTone, setResponseTone] = useState<string>('formal');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const allTickets = await TicketService.getAllTickets();
      
      const inProgressTickets = allTickets.filter(
        ticket => ticket.status === TicketStatus.IN_PROGRESS
      );
      
      setTickets(inProgressTickets);
      setError(null);
    } catch (err) {
      setError('Error loading in-progress tickets. Please try again later.');
      console.error('Error fetching in-progress tickets:', err);
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
    setAiResponseSuggestions(null);
    setAiError(null);
    setCustomResponse('');
    setActiveTab('details');
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
  
  // AI features
  const fetchAiSuggestions = async () => {
    if (!selectedTicket || !selectedTicket.id) return;
    
    setAiLoading(true);
    setAiError(null);
    
    try {
      const suggestions = await AITicketService.getResponseSuggestions(selectedTicket.id);
      setAiResponseSuggestions(suggestions);
    } catch (err) {
      console.error('Error fetching AI suggestions:', err);
      setAiError('Failed to load AI suggestions. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };
  
  const generateResponseDraft = async () => {
    if (!selectedTicket || !selectedTicket.id) return;
    
    setAiLoading(true);
    setAiError(null);
    
    try {
      const responseText = await AITicketService.generateResponseDraft(selectedTicket.id, responseTone);
      setCustomResponse(responseText);
    } catch (err) {
      console.error('Error generating response draft:', err);
      setAiError('Failed to generate response draft. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };
  
  const handleSelectSuggestion = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    setCustomResponse(suggestion);
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
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <Container fluid className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded" style={{ 
        backgroundColor: '#1a2236', 
        color: 'white',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <h3 className="m-0">
          <i className="bi bi-clock-history me-2"></i>
          In-Progress Tickets
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
                  <i className="bi bi-clipboard-x text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-3">No tickets are currently in progress</p>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Subject</th>
                      <th>Customer</th>
                      <th>Handled By</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Last Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td>{ticket.id}</td>
                        <td>{ticket.subject}</td>
                        <td>{ticket.customerName}</td>
                        <td>
                          <Badge bg="info" className="me-1">
                            {ticket.employeeName || 'Unassigned'}
                          </Badge>
                        </td>
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
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Ticket Details/Edit Modal with AI Features */}
      <Modal 
        show={showTicketModal} 
        onHide={() => setShowTicketModal(false)}
        size="lg"
        fullscreen="lg-down"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {viewMode === 'view' ? 'Ticket Details' : 'Edit Ticket'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket && (
            viewMode === 'view' ? (
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

                      <Row className="mb-3">
                        <Col md={6}>
                          <p className="mb-1"><strong>Assigned To:</strong></p>
                          <p>{selectedTicket.employeeName || 'Unassigned'}</p>
                        </Col>
                        <Col md={6}>
                          <p className="mb-1"><strong>Employee Email:</strong></p>
                          <p>{selectedTicket.employeeEmail || 'N/A'}</p>
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
                  </Tab>
                  
                  <Tab eventKey="ai-suggestions" title={<><i className="bi bi-robot me-1"></i> AI Suggestions</>}>
                    <div>
                      {aiError && <Alert variant="danger">{aiError}</Alert>}
                      
                      {!aiResponseSuggestions && !aiLoading && (
                        <div className="text-center p-5">
                          <i className="bi bi-lightbulb text-warning" style={{ fontSize: '3rem' }}></i>
                          <p className="mt-3">Get AI assistance with responding to this ticket</p>
                          <Button 
                            variant="primary" 
                            onClick={fetchAiSuggestions}
                          >
                            <i className="bi bi-magic me-1"></i> Generate Response Suggestions
                          </Button>
                        </div>
                      )}
                      
                      {aiLoading && (
                        <div className="text-center p-5">
                          <Spinner animation="border" variant="primary" />
                          <p className="mt-3">Analyzing ticket and generating suggestions...</p>
                        </div>
                      )}
                      
                      {aiResponseSuggestions && (
                        <div>
                          <Card className="mb-4 bg-light">
                            <Card.Header>
                              <h5 className="mb-0">Ticket Analysis</h5>
                            </Card.Header>
                            <Card.Body>
                              <Row>
                                <Col md={6}>
                                  <p><strong>Sentiment:</strong> <Badge bg={getSentimentBadge(aiResponseSuggestions.analysis.sentiment)}>{aiResponseSuggestions.analysis.sentiment}</Badge></p>
                                  <p><strong>Urgency:</strong> <Badge bg={getUrgencyBadge(aiResponseSuggestions.analysis.urgency)}>{aiResponseSuggestions.analysis.urgency}</Badge></p>
                                </Col>
                                <Col md={6}>
                                  <p><strong>Complexity:</strong> {aiResponseSuggestions.analysis.complexity}</p>
                                  <p><strong>Keywords:</strong> {aiResponseSuggestions.analysis.keywords}</p>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                          
                          <h5>Response Suggestions</h5>
                          <p className="text-muted mb-3">Select a suggestion to use as a starting point for your response.</p>
                          
                          {aiResponseSuggestions.suggestions.map((suggestion, index) => (
                            <Card key={index} className={`mb-3 ${selectedSuggestion === suggestion ? 'border-primary' : ''}`}>
                              <Card.Header className="d-flex justify-content-between align-items-center">
                                <span><strong>Suggestion {index + 1}</strong> {index === 0 ? '(Brief)' : index === 1 ? '(Detailed)' : '(With Questions)'}</span>
                                <div>
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm" 
                                    className="me-2"
                                    onClick={() => handleSelectSuggestion(suggestion)}
                                  >
                                    <i className="bi bi-check-circle me-1"></i> Use This
                                  </Button>
                                  <Button 
                                    variant="outline-secondary" 
                                    size="sm"
                                    onClick={() => copyToClipboard(suggestion)}
                                  >
                                    <i className="bi bi-clipboard"></i>
                                  </Button>
                                </div>
                              </Card.Header>
                              <Card.Body>
                                <div style={{ whiteSpace: 'pre-wrap' }}>
                                  {suggestion}
                                </div>
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </Tab>
                  
                  <Tab eventKey="response-composer" title={<><i className="bi bi-pencil-square me-1"></i> Compose Response</>}>
                    <div>
                      <Form.Group className="mb-3">
                        <div className="d-flex justify-content-between mb-2">
                          <Form.Label><strong>Response Draft</strong></Form.Label>
                          <div className="d-flex">
                            <Form.Select 
                              size="sm" 
                              className="me-2" 
                              style={{ width: 'auto' }}
                              value={responseTone}
                              onChange={(e) => setResponseTone(e.target.value)}
                            >
                              <option value="formal">Formal</option>
                              <option value="friendly">Friendly</option>
                              <option value="technical">Technical</option>
                            </Form.Select>
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={generateResponseDraft}
                              disabled={aiLoading}
                            >
                              <i className="bi bi-magic me-1"></i> Generate Draft
                            </Button>
                          </div>
                        </div>
                        <Form.Control
                          as="textarea"
                          rows={8}
                          value={customResponse}
                          onChange={(e) => setCustomResponse(e.target.value)}
                          placeholder="Type or generate a response to the customer..."
                        />
                      </Form.Group>
                      <div className="d-flex justify-content-end">
                        <Button 
                          variant="outline-secondary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => setCustomResponse('')}
                        >
                          <i className="bi bi-x-circle me-1"></i> Clear
                        </Button>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => copyToClipboard(customResponse)}
                        >
                          <i className="bi bi-clipboard me-1"></i> Copy
                        </Button>
                      </div>
                    </div>
                  </Tab>
                </Tabs>
              </>
            ) : (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedTicket.subject}
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
                    value={selectedTicket.description}
                    readOnly
                    disabled
                    className="bg-light"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={selectedTicket.status}
                    onChange={(e) => setSelectedTicket({...selectedTicket, status: e.target.value})}
                  >
                    <option value={TicketStatus.NEW}>New</option>
                    <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
                    <option value={TicketStatus.RESOLVED}>Resolved</option>
                    <option value={TicketStatus.CLOSED}>Closed</option>
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
    </Container>
  );
};

export default InProgressTickets;