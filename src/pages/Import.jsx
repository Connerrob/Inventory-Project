import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  writeBatch,
  doc,
} from "firebase/firestore";
import { logAction } from "../utils";
import Papa from "papaparse";
import Sidebar from "../components/Sidebar";
import AddAssetModal from "../components/AddAssetModal";
import ImportModal from "../components/ImportModal";
import "../styles/Import.css";

const Import = ({ handleSignOut }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [updatedCount, setUpdatedCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const location = useLocation();

  const toggleSidebar = () => setCollapsed(!collapsed);

  // Trigger CSV download of a template file with correct headers
  const downloadTemplate = () => {
    const headers = [
      "Part Number",
      "Category",
      "Description",
      "Quantity",
      "Price",
      "Retail",
    ];
    const csvContent = [headers.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "inventory_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle file upload input and validate file type
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setErrorMsg("Only .csv files are allowed.");
      return;
    }

    setSelectedFile(file);
    setShowImportModal(true);
    setErrorMsg("");
  };

  // Process CSV, then write new or updated items to Firestore
  const processFile = async () => {
    if (!selectedFile) return;

    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      Papa.parse(e.target.result, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const parsedData = results.data;

          // Filter out rows missing required fields
          const validItems = parsedData.filter(
            (item) =>
              item["Part Number"] &&
              item["Category"] &&
              item["Description"] &&
              item["Quantity"] &&
              item["Price"] &&
              item["Retail"]
          );

          let addedCount = 0;
          let updatedCount = 0;
          const batch = writeBatch(db);

          for (const item of validItems) {
            const partNumber = item["Part Number"].trim();
            const q = query(
              collection(db, "assets"),
              where("partNumber", "==", partNumber)
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
              // check if any values have changed
              const docRef = snapshot.docs[0].ref;
              const existingItem = snapshot.docs[0].data();

              const hasChanged =
                existingItem.category !== item["Category"] ||
                existingItem.description !== item["Description"] ||
                existingItem.quantity !== item["Quantity"] ||
                existingItem.price !== item["Price"] ||
                existingItem.retail !== item["Retail"];

              if (hasChanged) {
                const updatedItem = {
                  partNumber,
                  category: item["Category"],
                  description: item["Description"],
                  quantity: item["Quantity"],
                  price: item["Price"],
                  retail: item["Retail"],
                };
                batch.update(docRef, updatedItem);
                updatedCount++;
                logAction("edit", {
                  oldItem: existingItem,
                  newItem: updatedItem,
                });
              }
            } else {
              // New item add it to Firestore
              const newItem = {
                partNumber,
                category: item["Category"],
                description: item["Description"],
                quantity: item["Quantity"],
                price: item["Price"],
                retail: item["Retail"],
              };
              const newDocRef = doc(collection(db, "assets"));
              batch.set(newDocRef, newItem);
              addedCount++;
              logAction("add", newItem);
            }
          }

          try {
            await batch.commit();
          } catch (error) {
            console.error("Batch commit failed:", error);
          }

          // Update UI state after successful import
          setImportedCount(addedCount);
          setUpdatedCount(updatedCount);
          setLoading(false);
          setIsSuccess(true);
          setSelectedFile(null);
          document.querySelector(".file-input").value = "";
        },
      });
    };

    reader.readAsText(selectedFile);
  };

  // Reset modal state for new import session
  const resetModal = () => {
    setShowImportModal(false);
    setSelectedFile(null);
    setIsSuccess(false);
    setImportedCount(0);
    setUpdatedCount(0);
    setLoading(false);
    setErrorMsg("");
  };

  return (
    <div className="import-container-wrapper">
      <Sidebar
        collapsed={collapsed}
        toggleSidebar={toggleSidebar}
        location={location}
        handleSignOut={handleSignOut}
      />

      <div className={`import-content ${collapsed ? "collapsed" : ""}`}>
        <div className="import-content-wrapper">
          <h2>Import Inventory Items</h2>
          <div className="file-upload-container">
            {/* File upload input */}
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="file-input"
            />
            <p className="file-instruction">
              Upload a CSV file with columns:{" "}
              <strong>
                Part Number, Category, Description, Quantity, Price, Retail
              </strong>
            </p>
            {errorMsg && <p className="error-text">{errorMsg}</p>}
          </div>

          {/* Button to download CSV template */}
          <button onClick={downloadTemplate} className="download-template-btn">
            Download CSV Template
          </button>
        </div>
      </div>

      {/* Modal to confirm import */}
      <ImportModal
        show={showImportModal}
        onConfirm={processFile}
        onCancel={resetModal}
        fileName={selectedFile?.name || ""}
        loading={loading}
        isSuccess={isSuccess}
        importedCount={importedCount}
        updatedCount={updatedCount}
      />

      {/* Modal to manually add asset */}
      <AddAssetModal
        showModal={showModal}
        closeModal={() => setShowModal(false)}
      />
    </div>
  );
};

export default Import;
