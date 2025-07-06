import React from "react";
import "../styles/import.css";

//for displaying modal during CSV import
const ImportModal = ({
  show,
  onConfirm,
  onCancel,
  fileName,
  loading,
  isSuccess,
  importedCount,
  updatedCount,
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" role="dialog" aria-modal="true">
        <h2 className="modal-title">
          {isSuccess
            ? "Import Complete"
            : loading
            ? "Importing File"
            : "Confirm Import"}
        </h2>

        <div className="modal-body">
          {loading ? (
            // Show progress indicator during loading
            <>
              <p className="modal-message">
                Importing <strong>{fileName}</strong>...
              </p>
              <div className="progress-bar">
                <div className="progress-fill animate"></div>
              </div>
            </>
          ) : isSuccess ? (
            // Show success message if import is done
            <>
              <p className="modal-message success">
                Import completed successfully!
              </p>
              <p className="modal-message details">
                <strong>{importedCount}</strong> new /{" "}
                <strong>{updatedCount}</strong> updated
              </p>
            </>
          ) : (
            // confirmation message before importing
            <>
              <p className="modal-message confirm">
                Are you sure you want to import <strong>{fileName}</strong> into
                the inventory?
              </p>
            </>
          )}
        </div>

        {!loading && (
          <div className="modal-footer">
            {isSuccess ? (
              // Show close button after success
              <button className="modal-btn primary" onClick={onCancel}>
                Close
              </button>
            ) : (
              // Show confirmation buttons
              <>
                <button className="modal-btn primary" onClick={onConfirm}>
                  Yes, Import
                </button>
                <button className="modal-btn secondary" onClick={onCancel}>
                  Cancel
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportModal;
