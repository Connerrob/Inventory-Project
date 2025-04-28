// ImportModal.jsx
import React from 'react';
import '../styles/import.css';

const ImportModal = ({ 
  show, 
  onConfirm, 
  onCancel, 
  fileName, 
  loading, 
  isSuccess, 
  importedCount, 
  updatedCount 
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">{isSuccess ? "Import Complete" : "Confirm Import"}</h2>

        {loading ? (
          <>
            <p className="modal-message">Importing <strong>{fileName}</strong>...</p>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </>
        ) : isSuccess ? (
          <>
            <p className="modal-message">
              ✅ Import completed successfully!
            </p>
            <p className="modal-message">
              {importedCount} imported / {updatedCount} updated.
            </p>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={onCancel}>
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="modal-message">
              Are you sure you want to import <strong>{fileName}</strong> into the inventory?
            </p>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={onConfirm}>
                Yes, Import
              </button>
              <button className="cancel-btn" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImportModal;