import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "../styles/AddAssetModal.css";

// AddAssetModal handles both adding and editing assets through a modal form
const AddAssetModal = ({
  show,
  onHide,
  selectedAsset,
  isAdding,
  onChange,
  onSave,
  onAdd,
}) => {
  // Local state for form validation errors and duplicate check
  const [errors, setErrors] = useState({});
  const [isDuplicate, setIsDuplicate] = useState(false);

  // Fields that must be filled in to submit
  const requiredFields = [
    "partNumber",
    "category",
    "description",
    "quantity",
    "price",
    "retail",
  ];

  // clearing the form
  const emptyAsset = {
    partNumber: "",
    category: "",
    description: "",
    quantity: "",
    price: "",
    retail: "",
  };

  // Reset state when modal is closed
  useEffect(() => {
    if (!show) {
      setErrors({});
      setIsDuplicate(false);
      if (isAdding && onChange) {
        // Reset fields if you are adding a new asset
        onChange({ target: { name: "reset", value: emptyAsset } });
      }
    }
  }, [show]);

  // Validate that all required fields are filled in
  const validateFields = () => {
    const validationErrors = {};
    requiredFields.forEach((field) => {
      if (!selectedAsset?.[field]?.toString().trim()) {
        validationErrors[field] = "This field is required";
      }
    });
    return validationErrors;
  };

  // Check if the part number already exists in the database
  const checkPartNumberUnique = async (partNumber) => {
    const assetsRef = collection(db, "assets");
    const q = query(assetsRef, where("partNumber", "==", partNumber));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  };

  // Validate input and check for duplicate part number before submitting
  const handleActionAttempt = async (action) => {
    const validationErrors = validateFields();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({}); // Clear previous errors

    const isUnique = await checkPartNumberUnique(selectedAsset.partNumber);

    if (!isUnique) {
      setIsDuplicate(true); // Show duplicate warning
      return;
    } else {
      setIsDuplicate(false);
    }

    handleConfirmAction(action); // Proceed to add or save
  };

  // Perform action add or save the asset
  const handleConfirmAction = (action) => {
    if (action === "save" && onSave) {
      onSave(selectedAsset);
    } else if (action === "add" && onAdd) {
      onAdd(selectedAsset);
    }
    onHide(); // Close the modal afterward
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isAdding ? "Add New Item" : "Edit Item"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Duplicate part number alert */}
        {isDuplicate && (
          <Alert variant="danger">
            <strong>
              The part number already exists. Please use a unique part number.
            </strong>
          </Alert>
        )}

        {Object.keys(errors).length > 0 && (
          <Alert variant="danger">
            <strong>Please fix the following errors:</strong>
            <ul>
              {Object.keys(errors).map((field) => (
                <li key={field}>{errors[field]}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Asset Table */}
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formPartNumber" className="mb-3">
                <Form.Label>Part Number</Form.Label>
                <Form.Control
                  type="text"
                  name="partNumber"
                  value={selectedAsset?.partNumber || ""}
                  onChange={onChange}
                  placeholder="Enter part number"
                  isInvalid={!!errors.partNumber}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.partNumber}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="formCategory" className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  type="text"
                  name="category"
                  value={selectedAsset?.category || ""}
                  onChange={onChange}
                  placeholder="Enter category"
                  isInvalid={!!errors.category}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.category}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formDescription" className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  value={selectedAsset?.description || ""}
                  onChange={onChange}
                  placeholder="Enter description"
                  isInvalid={!!errors.description}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.description}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="formQuantity" className="mb-3">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={selectedAsset?.quantity || ""}
                  onChange={onChange}
                  placeholder="Enter quantity"
                  isInvalid={!!errors.quantity}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.quantity}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="formPrice" className="mb-3">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="price"
                  value={selectedAsset?.price || ""}
                  onChange={onChange}
                  placeholder="Enter price"
                  isInvalid={!!errors.price}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.price}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="formRetail" className="mb-3">
                <Form.Label>Retail</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="retail"
                  value={selectedAsset?.retail || ""}
                  onChange={onChange}
                  placeholder="Enter retail value"
                  isInvalid={!!errors.retail}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.retail}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      {/* Modal action buttons */}
      <Modal.Footer className="d-flex justify-content-end">
        <Button variant="secondary" onClick={onHide} className="me-2">
          Cancel
        </Button>
        {isAdding ? (
          <Button variant="primary" onClick={() => handleActionAttempt("add")}>
            Add Item
          </Button>
        ) : (
          <Button variant="success" onClick={() => handleActionAttempt("save")}>
            Save Changes
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default AddAssetModal;
