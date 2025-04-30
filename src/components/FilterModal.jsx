import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const FilterModal = ({ show, onHide, onFilter, inventoryData }) => {
  const [filters, setFilters] = useState({
    partNumber: "",
    category: "",
    description: "",
    quantity: "",
    price: "",
    retail: "",
  });

  const [filteredData, setFilteredData] = useState(inventoryData || []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));

    const newFilteredData = (inventoryData || []).filter(
      (item) => item[name]?.toString().toLowerCase() === value.toLowerCase()
    );
    setFilteredData(newFilteredData);
  };

  const handleApplyFilters = () => {
    onFilter(filters);
    onHide();
  };

  const handleClearFilters = () => {
    setFilters({
      partNumber: "",
      category: "",
      description: "",
      quantity: "",
      price: "",
      retail: "",
    });
    setFilteredData(inventoryData || []);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Advanced Filter</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="partNumber">
            <Form.Label>Part Number</Form.Label>
            <Form.Control
              type="text"
              name="partNumber"
              value={filters.partNumber}
              onChange={handleChange}
              list="partNumberOptions"
            />
            <datalist id="partNumberOptions">
              {(filteredData || []).map((item, index) => (
                <option key={index} value={item.partNumber} />
              ))}
            </datalist>
          </Form.Group>

          <Form.Group controlId="category">
            <Form.Label>Category</Form.Label>
            <Form.Control
              type="text"
              name="category"
              value={filters.category}
              onChange={handleChange}
              list="categoryOptions"
            />
            <datalist id="categoryOptions">
              {(filteredData || []).map((item, index) => (
                <option key={index} value={item.category} />
              ))}
            </datalist>
          </Form.Group>

          <Form.Group controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              name="description"
              value={filters.description}
              onChange={handleChange}
              list="descriptionOptions"
            />
            <datalist id="descriptionOptions">
              {(filteredData || []).map((item, index) => (
                <option key={index} value={item.description} />
              ))}
            </datalist>
          </Form.Group>

          <Form.Group controlId="quantity">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="text"
              name="quantity"
              value={filters.quantity}
              onChange={handleChange}
              list="quantityOptions"
            />
            <datalist id="quantityOptions">
              {(filteredData || []).map((item, index) => (
                <option key={index} value={item.quantity} />
              ))}
            </datalist>
          </Form.Group>

          <Form.Group controlId="price">
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="text"
              name="price"
              value={filters.price}
              onChange={handleChange}
              list="priceOptions"
            />
            <datalist id="priceOptions">
              {(filteredData || []).map((item, index) => (
                <option key={index} value={item.price} />
              ))}
            </datalist>
          </Form.Group>

          <Form.Group controlId="retail">
            <Form.Label>Retail</Form.Label>
            <Form.Control
              type="text"
              name="retail"
              value={filters.retail}
              onChange={handleChange}
              list="retailOptions"
            />
            <datalist id="retailOptions">
              {(filteredData || []).map((item, index) => (
                <option key={index} value={item.retail} />
              ))}
            </datalist>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="secondary" onClick={handleClearFilters}>
          Clear Filters
        </Button>
        <Button variant="primary" onClick={handleApplyFilters}>
          Apply Filters
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FilterModal;
