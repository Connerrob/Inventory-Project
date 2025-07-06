import React, { useState } from "react";
import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap";
import ConfirmationModal from "./ConfirmationModal"; // Modal for confirming delete action
import "../styles/AddAssetModal.css";

const EditAssetModal = ({
  show,
  onHide,
  selectedAsset,
  isAdding,
  onChange,
  onSave,
  onAdd,
  onDelete,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [errors, setErrors] = useState({});

  // Fields required to be filled before submit
  const requiredFields = [
    "partNumber",
    "category",
    "description",
    "quantity",
    "price",
    "retail",
  ];

  // confirms that required fields are filled
  const validateFields = () => {
    const validationErrors = {};
    requiredFields.forEach((field) => {
      if (!selectedAsset?.[field]?.toString().trim()) {
        validationErrors[field] = "This field is required";
      }
    });
    return validationErrors;
  };

  // Called when user clicks "Save", "Add", or "Delete"
  const handleActionAttempt = (action) => {
    const validationErrors = validateFields();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setActionType(action);

    // Show confirmation only for delete
    if (action === "delete") {
      setShowConfirmation(true);
    } else {
      handleConfirmAction();
    }
  };

  // Called when user confirms an action
  const handleConfirmAction = () => {
    if (actionType === "delete") {
      if (typeof onDelete === "function") {
        onDelete(selectedAsset);
      }
      setShowConfirmation(false);
      onHide();
    } else if (actionType === "save") {
      if (onSave) onSave(selectedAsset);
      onHide();
    } else if (actionType === "add") {
      if (onAdd) onAdd(selectedAsset);
      onHide();
    }
  };

  // Called when user cancels delete confirmation
  const handleCancelAction = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isAdding ? "Add New Asset" : "Edit Asset"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
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

          <Form>
            {/* Row 1: Part Number and Category */}
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

            {/* Row 2: Description and Quantity */}
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

            {/* Row 3: Price and Retail */}
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

        <Modal.Footer className="d-flex justify-content-end">
          <Button variant="secondary" onClick={onHide} className="me-2">
            Cancel
          </Button>

          {/* Show different buttons depending on if we're adding or editing */}
          {isAdding ? (
            <Button
              variant="primary"
              onClick={() => handleActionAttempt("add")}
            >
              Add Asset
            </Button>
          ) : (
            <>
              <Button
                variant="danger"
                onClick={() => handleActionAttempt("delete")}
              >
                Delete Asset
              </Button>
              <Button
                variant="success"
                onClick={() => handleActionAttempt("save")}
              >
                Save Changes
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Confirmation modal appears only for delete */}
      <ConfirmationModal
        show={showConfirmation}
        onClose={handleCancelAction}
        onConfirm={handleConfirmAction}
        actionType={actionType}
      />
    </>
  );
};

export default EditAssetModal;
