import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { db } from '../firebase'; 
import { collection, query, where, getDocs } from 'firebase/firestore';
import '../styles/AddAssetModal.css';

const AddAssetModal = ({
  show,
  onHide,
  selectedAsset,
  isAdding,
  onChange,
  onSave,
  onAdd,
}) => {
  const [errors, setErrors] = useState({});
  const [isDuplicate, setIsDuplicate] = useState(false); 

  const requiredFields = [
    'serviceTag',
    'model',
    'category',
    'status',
    'location',
    'notes',
    'macAddress',
    'decal',
  ];

  const validateFields = () => {
    const validationErrors = {};
    requiredFields.forEach((field) => {
      if (!selectedAsset?.[field]?.trim()) {
        validationErrors[field] = 'This field is required';
      }
    });
    return validationErrors;
  };

  const checkServiceTagUnique = async (serviceTag) => {
    const assetsRef = collection(db, 'assets'); 
    const q = query(assetsRef, where('serviceTag', '==', serviceTag));
    const querySnapshot = await getDocs(q);

    return querySnapshot.empty; 
  };

  const handleActionAttempt = async (action) => {
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    const isUnique = await checkServiceTagUnique(selectedAsset.serviceTag);
    if (!isUnique) {
      setIsDuplicate(true);
      return;
    } else {
      setIsDuplicate(false);
    }

    if (action === 'save') {
      handleConfirmAction('save');
    } else if (action === 'add') {
      handleConfirmAction('add');
    }
  };

  const handleConfirmAction = (action) => {
    if (action === 'save') {
      if (onSave) {
        onSave(selectedAsset);
      }
      onHide();
    } else if (action === 'add') {
      if (onAdd) {
        onAdd(selectedAsset);
      }
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isAdding ? 'Add New Asset' : 'Edit Asset'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isDuplicate && (
          <Alert variant="danger">
            <strong>The service tag already exists. Please use a unique service tag.</strong>
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
                  isInvalid={!!errors.serviceTag}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.serviceTag}
                </Form.Control.Feedback>
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
                  isInvalid={!!errors.model}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.model}
                </Form.Control.Feedback>
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
                  isInvalid={!!errors.category}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.category}
                </Form.Control.Feedback>
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
                  isInvalid={!!errors.status}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.status}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formLocation" className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={selectedAsset?.location || ''}
                  onChange={onChange}
                  placeholder="Enter location"
                  isInvalid={!!errors.location}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.location}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formNotes" className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  type="text"
                  name="notes"
                  value={selectedAsset?.notes || ''}
                  onChange={onChange}
                  placeholder="Enter notes"
                  isInvalid={!!errors.notes}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.notes}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formMacAddress" className="mb-3">
                <Form.Label>MAC Address</Form.Label>
                <Form.Control
                  type="text"
                  name="macAddress"
                  value={selectedAsset?.macAddress || ''}
                  onChange={onChange}
                  placeholder="Enter MAC address"
                  isInvalid={!!errors.macAddress}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.macAddress}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formDecal" className="mb-3">
                <Form.Label>Decal</Form.Label>
                <Form.Control
                  type="text"
                  name="decal"
                  value={selectedAsset?.decal || ''}
                  onChange={onChange}
                  placeholder="Enter decal"
                  isInvalid={!!errors.decal}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.decal}
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
        {isAdding ? (
          <Button variant="primary" onClick={() => handleActionAttempt('add')}>
            Add Asset
          </Button>
        ) : (
          <Button variant="success" onClick={() => handleActionAttempt('save')}>
            Save Changes
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default AddAssetModal;
