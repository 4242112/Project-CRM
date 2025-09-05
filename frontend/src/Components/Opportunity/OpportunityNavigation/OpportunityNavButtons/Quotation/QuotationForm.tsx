import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { QItem, Quotation } from '../../../../../services/QuotationService';
import ProductService, { Product } from '../../../../../services/ProductService';
import { Opportunity } from '../../../OpportunityCard';



interface Props {
  opportunity: Opportunity;
  quotation: Quotation | null;
  onSubmit: (data: Quotation) => void;
}

const QuotationForm: React.FC<Props> = ({ opportunity, quotation, onSubmit }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [title, setTitle] = useState(quotation?.title || '');
  const [description, setDescription] = useState(quotation?.description || '');
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });

  const [items, setItems] = useState<QItem[]>(quotation?.items || []);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    ProductService.getAllProducts().then(setProducts);
  }, []);

  useEffect(() => {
    const totalAmount = items.reduce((sum, i) =>
      sum + i.quantity * i.product.price * (1 - i.discount / 100), 0);
    setTotal(totalAmount);
  }, [items]);

  const addItem = () => {
    if (!selectedProduct) return;
    const newItem: QItem = { product: selectedProduct, quantity, discount };
    setItems([...items, newItem]);
    setQuantity(1);
    setDiscount(0);
    setSelectedProduct(null);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newQuotation: Quotation = {
      id: quotation?.id, 
      title,
      description,
      validUntil: new Date(validUntil),
      amount: total,
      items,
      isApproved: false,
      opportunityId: opportunity.id,
      stage: quotation?.stage,
    };
    
    onSubmit(newQuotation);
  };

  return (
    <Container className="my-4">
      <Card>
        <Card.Header><h5>{quotation?.id ? 'Edit' : 'Create'} Quotation</h5></Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control value={title} onChange={e => setTitle(e.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Valid Until</Form.Label>
                  <Form.Control type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} required />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
            </Form.Group>

            <h6 className="mb-3 fw-bold">Item Details</h6>
            <Row className="mb-4">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Select Product</Form.Label>
                  <Form.Select 
                    value={selectedProduct?.id || ''}
                    onChange={e => {
                      const p = products.find(p => p.id === parseInt(e.target.value));
                      setSelectedProduct(p || null);
                    }}
                  >
                    <option value="">Select Product</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control 
                    type="number" 
                    min="1"
                    value={quantity} 
                    onChange={e => setQuantity(parseInt(e.target.value) || 1)} 
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Discount (%)</Form.Label>
                  <Form.Control 
                    type="number"
                    min="0"
                    max="100"
                    value={discount} 
                    onChange={e => setDiscount(parseInt(e.target.value) || 0)} 
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex align-items-end">
                <Button 
                  variant="success" 
                  size="sm"
                  className="px-4 py-2"
                  onClick={addItem}
                >
                  <i className="bi bi-plus-circle me-2"></i>Add Item
                </Button>
              </Col>
            </Row>

            {items.length > 0 && (
              <Table striped bordered className="mt-4">
                <thead>
                  <tr><th>Product</th><th>Qty</th><th>Rate</th><th>Discount</th><th>Subtotal</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.product.name}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.product.price.toFixed(2)}</td>
                      <td>{item.discount}%</td>
                      <td>₹{(item.quantity * item.product.price * (1 - item.discount / 100)).toFixed(2)}</td>
                      <td><Button variant="danger" size="sm" onClick={() => removeItem(idx)}>X</Button></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            <h5 className="text-end mt-4">Total: ${total.toFixed(2)}</h5>
            <Button type="submit" className="mt-3">Save Quotation</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default QuotationForm;
