import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal, Toast, ToastContainer } from 'react-bootstrap';
import CategoryService, { Category as CategoryType } from '../../services/CategoryService';

const Category: React.FC = () => {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<CategoryType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await CategoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddCategory = async () => {
    try {
      const newCategory = await CategoryService.createCategory({
        name: formData.name,
        description: formData.description
      });
      
      setCategories([...categories, newCategory]);
      setFormData({ name: '', description: '' });
      setShowAddModal(false);
      showToastMessage('Category added successfully');
    } catch (err) {
      console.error('Error adding category:', err);
      showToastMessage('Failed to add category');
    }
  };

  const handleEditClick = (category: CategoryType) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description
    });
    setShowEditModal(true);
  };

  const handleUpdateCategory = async () => {
    if (!currentCategory || !currentCategory.id) return;
    
    try {
      const updatedCategory = await CategoryService.updateCategory(currentCategory.id, {
        name: formData.name,
        description: formData.description
      });
      
      setCategories(categories.map(cat => 
        cat.id === currentCategory.id ? updatedCategory : cat
      ));
      
      setShowEditModal(false);
      setCurrentCategory(null);
      setFormData({ name: '', description: '' });
      showToastMessage('Category updated successfully');
    } catch (err) {
      console.error('Error updating category:', err);
      showToastMessage('Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await CategoryService.deleteCategory(id);
        setCategories(categories.filter(cat => cat.id !== id));
        showToastMessage('Category deleted successfully');
      } catch (err) {
        console.error('Error deleting category:', err);
        showToastMessage('Failed to delete category');
      }
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        const results = await CategoryService.searchCategories(searchTerm);
        setCategories(results);
      } catch (err) {
        console.error('Error searching categories:', err);
        showToastMessage('Error searching categories');
      }
    } else {
      fetchCategories();
    }
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };


  return (
    <Container fluid className="p-4">
      <ToastContainer position="top-end" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)}>
          <Toast.Header>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded" style={{
        backgroundColor: '#1a2236',
        color: 'white',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <h3 className="m-0">Categories</h3>
        <Button variant="light" size="sm" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-plus me-2"></i> Add Category
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <Row className="mb-3">
            <Col md={5}>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </Form.Group>
            </Col>
            <Col md={1}>
              <Button variant="outline-secondary" onClick={handleSearch}>
                <i className="bi bi-search"></i>
              </Button>
            </Col>
          </Row>
          
          {error && <div className="alert alert-danger">{error}</div>}
          
          {isLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, index) => (
                  <tr key={category.id}>
                    <td>{index + 1}</td>
                    <td>{category.name}</td>
                    <td>{category.description}</td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEditClick(category)}>
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteCategory(category.id!)}>
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="text-center">No categories found</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add Category Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddCategory}>Add Category</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Category Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleUpdateCategory}>Update Category</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Category;