import React, { useState } from 'react';
import { Card, Button, Spinner, Alert, Badge, Row, Col, Form } from 'react-bootstrap';
import AITicketService, { ResponseSuggestions } from '../../services/AITicketService';
import { Ticket } from '../../services/TicketService';

interface AITicketAssistantProps {
  ticket: Ticket;
  onSelectSuggestion?: (suggestion: string) => void;
}

const AITicketAssistant: React.FC<AITicketAssistantProps> = ({ ticket, onSelectSuggestion }) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<ResponseSuggestions | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'analyze' | 'suggest' | 'draft'>('analyze');
  const [responseTone, setResponseTone] = useState<string>('formal');
  const [responseDraft, setResponseDraft] = useState<string>('');

  const getSentimentBadge = (sentiment?: string) => {
    if (!sentiment) return 'secondary';
    
    switch (sentiment?.toLowerCase()) {
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
    
    switch (urgency?.toLowerCase()) {
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

  const handleFetchSuggestions = async () => {
    if (!ticket || !ticket.id) return;
    
    setAiLoading(true);
    setAiError(null);
    setAnalysisMode('suggest');
    
    try {
      const fetchedSuggestions = await AITicketService.getResponseSuggestions(ticket.id);
      setSuggestions(fetchedSuggestions);
    } catch (err) {
      console.error('Error fetching AI suggestions:', err);
      setAiError('Failed to load AI suggestions. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAnalyzeTicket = async () => {
    if (!ticket || !ticket.id) return;
    
    setAiLoading(true);
    setAiError(null);
    setAnalysisMode('analyze');
    
    try {
      const analysis = await AITicketService.analyzeTicket(ticket.id);
      setSuggestions({ analysis, suggestions: [] });
    } catch (err) {
      console.error('Error analyzing ticket:', err);
      setAiError('Failed to analyze ticket. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateResponseDraft = async () => {
    if (!ticket || !ticket.id) return;
    
    setAiLoading(true);
    setAiError(null);
    setAnalysisMode('draft');
    
    try {
      const draft = await AITicketService.generateResponseDraft(ticket.id, responseTone);
      setResponseDraft(draft);
    } catch (err) {
      console.error('Error generating response draft:', err);
      setAiError('Failed to generate response draft. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const renderContent = () => {
    if (aiLoading) {
      return (
        <div className="text-center p-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">
            {analysisMode === 'analyze' 
              ? 'Analyzing ticket...'
              : analysisMode === 'suggest'
                ? 'Generating response suggestions...'
                : 'Drafting response...'}
          </p>
        </div>
      );
    }

    if (!suggestions && analysisMode !== 'draft') {
      return (
        <div className="text-center p-4">
          <div className="d-flex justify-content-center mb-4">
            <Button 
              variant="outline-primary" 
              className="me-2"
              onClick={handleAnalyzeTicket}
            >
              <i className="bi bi-graph-up me-1"></i> Analyze Ticket
            </Button>
            <Button 
              variant="outline-success" 
              onClick={handleFetchSuggestions}
            >
              <i className="bi bi-lightbulb me-1"></i> Get Response Suggestions
            </Button>
          </div>
          
          <div className="border-top pt-3">
            <h6 className="mb-3">Generate Custom Response</h6>
            <div className="d-flex align-items-center mb-3">
              <Form.Select 
                size="sm"
                value={responseTone}
                onChange={(e) => setResponseTone(e.target.value)}
                style={{ width: 'auto' }}
                className="me-2"
              >
                <option value="formal">Formal Tone</option>
                <option value="friendly">Friendly Tone</option>
                <option value="technical">Technical Tone</option>
              </Form.Select>
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleGenerateResponseDraft}
              >
                <i className="bi bi-magic me-1"></i> Generate Draft
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (responseDraft && analysisMode === 'draft') {
      return (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">Generated Response Draft ({responseTone} tone)</h6>
            <div>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="me-2"
                onClick={() => {
                  setResponseDraft('');
                  setAnalysisMode('analyze');
                }}
              >
                <i className="bi bi-arrow-left me-1"></i> Back
              </Button>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => handleCopyToClipboard(responseDraft)}
              >
                <i className="bi bi-clipboard me-1"></i> Copy
              </Button>
              {onSelectSuggestion && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="ms-2"
                  onClick={() => handleSelectSuggestion(responseDraft)}
                >
                  <i className="bi bi-check-circle me-1"></i> Use This
                </Button>
              )}
            </div>
          </div>
          
          <div className="border p-3 bg-light mb-3" style={{ whiteSpace: 'pre-wrap' }}>
            {responseDraft}
          </div>
          
          <div className="d-flex justify-content-between">
            <div>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={() => {
                  setResponseDraft('');
                  setAnalysisMode('analyze');
                }}
              >
                <i className="bi bi-x-circle me-1"></i> Cancel
              </Button>
            </div>
            <div className="d-flex">
              <Form.Select 
                size="sm"
                value={responseTone}
                onChange={(e) => setResponseTone(e.target.value)}
                className="me-2"
              >
                <option value="formal">Formal</option>
                <option value="friendly">Friendly</option>
                <option value="technical">Technical</option>
              </Form.Select>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={handleGenerateResponseDraft}
              >
                <i className="bi bi-arrow-clockwise me-1"></i> Regenerate
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (suggestions?.analysis && analysisMode === 'analyze') {
      return (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">Ticket Analysis</h6>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={handleFetchSuggestions}
            >
              <i className="bi bi-chat-text me-1"></i> Get Response Suggestions
            </Button>
          </div>
          
          <Card className="bg-light mb-3">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p>
                    <strong>Sentiment:</strong>{' '}
                    <Badge bg={getSentimentBadge(suggestions.analysis.sentiment)}>
                      {suggestions.analysis.sentiment}
                    </Badge>
                  </p>
                  <p>
                    <strong>Urgency:</strong>{' '}
                    <Badge bg={getUrgencyBadge(suggestions.analysis.urgency)}>
                      {suggestions.analysis.urgency}
                    </Badge>
                  </p>
                </Col>
                <Col md={6}>
                  <p><strong>Complexity:</strong> {suggestions.analysis.complexity}</p>
                  <p><strong>Keywords:</strong> {suggestions.analysis.keywords}</p>
                </Col>
              </Row>
              
              <hr />
              
              <h6 className="mb-3">Smart Recommendations</h6>
              <ul className="list-group">
                {suggestions.analysis.urgency.toLowerCase() === 'high' && (
                  <li className="list-group-item list-group-item-danger">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i> 
                    This ticket requires immediate attention
                  </li>
                )}
                {suggestions.analysis.complexity.toLowerCase() === 'complex' && (
                  <li className="list-group-item list-group-item-warning">
                    <i className="bi bi-puzzle-fill me-2"></i>
                    May require specialized knowledge or escalation
                  </li>
                )}
                {suggestions.analysis.sentiment.toLowerCase() === 'negative' && (
                  <li className="list-group-item list-group-item-info">
                    <i className="bi bi-emoji-frown-fill me-2"></i>
                    Customer appears frustrated; consider prioritizing
                  </li>
                )}
              </ul>
            </Card.Body>
          </Card>
          
          <div className="d-flex justify-content-between">
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => {
                setSuggestions(null);
              }}
            >
              <i className="bi bi-arrow-left me-1"></i> Back
            </Button>
            <div>
              <Button 
                variant="outline-primary" 
                size="sm" 
                className="me-2"
                onClick={() => setAnalysisMode('draft')}
              >
                <i className="bi bi-pencil me-1"></i> Draft Response
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleFetchSuggestions}
              >
                <i className="bi bi-chat-text me-1"></i> Get Response Ideas
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (suggestions?.suggestions && suggestions.suggestions.length > 0 && analysisMode === 'suggest') {
      return (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">AI-Generated Response Suggestions</h6>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={handleAnalyzeTicket}
            >
              <i className="bi bi-graph-up me-1"></i> View Ticket Analysis
            </Button>
          </div>
          
          {suggestions.suggestions.map((suggestion, index) => (
            <Card key={index} className="mb-3">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span>
                  <strong>Suggestion {index + 1}</strong> 
                  {index === 0 ? ' (Brief)' : index === 1 ? ' (Detailed)' : ' (With Questions)'}
                </span>
                <div>
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    className="me-2"
                    onClick={() => handleCopyToClipboard(suggestion)}
                  >
                    <i className="bi bi-clipboard"></i>
                  </Button>
                  {onSelectSuggestion && (
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      <i className="bi bi-check-circle me-1"></i> Use This
                    </Button>
                  )}
                </div>
              </Card.Header>
              <Card.Body>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {suggestion}
                </div>
              </Card.Body>
            </Card>
          ))}
          
          <div className="d-flex justify-content-between">
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => {
                setSuggestions(null);
              }}
            >
              <i className="bi bi-arrow-left me-1"></i> Back
            </Button>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => setAnalysisMode('draft')}
            >
              <i className="bi bi-pencil me-1"></i> Write Custom Response
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center p-4">
        <p>No data available. Please try another option.</p>
      </div>
    );
  };

  return (
    <Card className="mb-4">
      <Card.Header className="bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-robot me-2"></i>
            AI Ticket Assistant
          </h5>
        </div>
      </Card.Header>
      <Card.Body>
        {aiError && <Alert variant="danger">{aiError}</Alert>}
        {renderContent()}
      </Card.Body>
    </Card>
  );
};

export default AITicketAssistant;