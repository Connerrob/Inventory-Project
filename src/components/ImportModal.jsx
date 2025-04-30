import React from "react";
import "../styles/import.css";

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
            <>
              <p className="modal-message">
                Importing <strong>{fileName}</strong>...
              </p>
              <div className="progress-bar">
                <div className="progress-fill animate"></div>
              </div>
            </>
          ) : isSuccess ? (
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
              <button className="modal-btn primary" onClick={onCancel}>
                Close
              </button>
            ) : (
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
