import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import ConfirmationModal from './ConfirmationModal'; // Import the ConfirmationModal
import '../styles/AddAssetModal.css';

const AddAssetModal = ({
  show,
  onHide,
  selectedAsset,
  isAdding,
  onChange,
  onSave,
  onDelete,
}) => {
  // State for the confirmation modal
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionType, setActionType] = useState(null); // Store action type ('add', 'save', 'delete')

  // Open confirmation modal
  const handleActionConfirmation = (action) => {
    setActionType(action);
    setShowConfirmation(true);
  };

  // Confirm action (add, save, delete)
  const handleConfirmAction = () => {
    if (actionType === 'add') {
      onSave(); // Proceed with adding the asset
    } else if (actionType === 'save') {
      onSave(); // Proceed with saving changes
    } else if (actionType === 'delete') {
      onDelete(); // Proceed with deleting the asset
    }
    setShowConfirmation(false); // Close the confirmation modal
    onHide(); // Close the Add Asset modal after confirmation
  };

  // Cancel action (close confirmation modal)
  const handleCancelAction = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      {/* Add/Edit Asset Modal */}
      <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isAdding ? 'Add New Asset' : 'Edit Asset'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group controlId="formServiceTag" className="mb-3">
                  <Form.Label>Service Tag</Form.Label>
                  <Form.Control
                    type="text"
                    name="serviceTag"
                    value={selectedAsset?.serviceTag || ''}
                    onChange={onChange}
                    placeholder="Enter service tag"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formModel" className="mb-3">
                  <Form.Label>Model</Form.Label>
                  <Form.Control
                    type="text"
                    name="model"
                    value={selectedAsset?.model || ''}
                    onChange={onChange}
                    placeholder="Enter model"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group controlId="formCategory" className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    name="category"
                    value={selectedAsset?.category || ''}
                    onChange={onChange}
                    placeholder="Enter category"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formStatus" className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Control
                    type="text"
                    name="status"
                    value={selectedAsset?.status || ''}
                    onChange={onChange}
                    placeholder="Enter status"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group controlId="formNotes" className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    type="text"
                    name="notes"
                    value={selectedAsset?.notes || ''}
                    onChange={onChange}
                    placeholder="Enter notes"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formMacAddress" className="mb-3">
                  <Form.Label>MAC Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="macAddress"
                    value={selectedAsset?.macAddress || ''}
                    onChange={onChange}
                    placeholder="Enter MAC address"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group controlId="formDecal" className="mb-3">
                  <Form.Label>Decal</Form.Label>
                  <Form.Control
                    type="text"
                    name="decal"
                    value={selectedAsset?.decal || ''}
                    onChange={onChange}
                    placeholder="Enter decal"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formLocation" className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={selectedAsset?.location || ''}
                    onChange={onChange}
                    placeholder="Enter location"
                  />
                </Form.Group>
              </Col>
            </Row>

          </Form>
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-end">
          <Button variant="secondary" onClick={onHide} className="me-2">
            Cancel
          </Button>
          {isAdding ? (
            <Button variant="primary" onClick={() => handleActionConfirmation('add')}>
              Add Asset
            </Button>
          ) : (
            <>
              <Button variant="danger" onClick={() => handleActionConfirmation('delete')} className="me-2">
                Delete
              </Button>
              <Button variant="success" onClick={() => handleActionConfirmation('save')}>
                Save Changes
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={showConfirmation}
        onClose={handleCancelAction}
        onConfirm={handleConfirmAction}
      />
    </>
  );
};

export default AddAssetModal;
