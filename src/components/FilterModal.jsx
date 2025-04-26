import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const FilterModal = ({ show, onHide, onFilter }) => {
  const [filters, setFilters] = useState({
    serviceTag: '',
    model: '',
    category: '',
    status: '',
    location: '',
    notes: '',
    macAddress: '',
    decal: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleApplyFilters = () => {
    onFilter(filters);
    onHide();
  };

  const handleClearFilters = () => {
    setFilters({
      serviceTag: '',
      model: '',
      category: '',
      status: '',
      location: '',
      notes: '',
      macAddress: '',
      decal: '',
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Advanced Filter</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="serviceTag">
            <Form.Label>Service Tag</Form.Label>
            <Form.Control
              type="text"
              name="serviceTag"
              value={filters.serviceTag}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="model">
            <Form.Label>Model</Form.Label>
            <Form.Control
              type="text"
              name="model"
              value={filters.model}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="category">
            <Form.Label>Category</Form.Label>
            <Form.Control
              type="text"
              name="category"
              value={filters.category}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="status">
            <Form.Label>Status</Form.Label>
            <Form.Control
              type="text"
              name="status"
              value={filters.status}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="location">
            <Form.Label>Location</Form.Label>
            <Form.Control
              type="text"
              name="location"
              value={filters.location}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="notes">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              type="text"
              name="notes"
              value={filters.notes}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="macAddress">
            <Form.Label>MAC Address</Form.Label>
            <Form.Control
              type="text"
              name="macAddress"
              value={filters.macAddress}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="decal">
            <Form.Label>Decal</Form.Label>
            <Form.Control
              type="text"
              name="decal"
              value={filters.decal}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} aria-label="Close filter modal">
          Close
        </Button>
        <Button variant="secondary" onClick={handleClearFilters} aria-label="Clear all filters">
          Clear Filters
        </Button>
        <Button variant="primary" onClick={handleApplyFilters} aria-label="Apply selected filters">
          Apply Filters
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FilterModal;
