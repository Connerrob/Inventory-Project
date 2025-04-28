import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { logAction } from '../utils';
import Papa from 'papaparse';
import Sidebar from '../components/Sidebar';
import AddAssetModal from '../components/AddAssetModal';
import ImportModal from '../components/ImportModal';
import '../styles/Import.css';

const Import = ({ handleSignOut }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [updatedCount, setUpdatedCount] = useState(0);
  const location = useLocation();

  const toggleSidebar = () => setCollapsed(!collapsed);

  const downloadTemplate = () => {
    const csvHeaders = ['Service Tag', 'Model', 'Category', 'Status', 'Location', 'Notes', 'Mac Address', 'Decal'];
    const csvContent = [csvHeaders.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'inventory_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setShowImportModal(true); // Open confirmation
  };

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
          const validItems = parsedData.filter(item =>
            item['Service Tag'] && item['Model'] && item['Category'] && item['Status'] &&
            item['Location'] && item['Notes'] && item['Mac Address'] && item['Decal']
          );
  
          let addedCount = 0;
          let updatedCount = 0;
  
          for (const item of validItems) {
            const serviceTag = item['Service Tag'].trim();
            const q = query(collection(db, 'assets'), where('serviceTag', '==', serviceTag));
            const snapshot = await getDocs(q);
  
            if (!snapshot.empty) {
              const docRef = snapshot.docs[0].ref;
              const existingItem = snapshot.docs[0].data();
  
              const hasChanged = (
                existingItem.model !== item['Model'] ||
                existingItem.category !== item['Category'] ||
                existingItem.status !== item['Status'] ||
                existingItem.location !== item['Location'] ||
                existingItem.notes !== item['Notes'] ||
                existingItem.macAddress !== item['Mac Address'] ||
                existingItem.decal !== item['Decal']
              );
  
              if (hasChanged) {
                const updatedItem = {
                  serviceTag,
                  model: item['Model'],
                  category: item['Category'],
                  status: item['Status'],
                  location: item['Location'],
                  notes: item['Notes'],
                  macAddress: item['Mac Address'],
                  decal: item['Decal'],
                };
                await updateDoc(docRef, updatedItem);
                await logAction('edit', { oldItem: existingItem, newItem: updatedItem });
                updatedCount++;
              }
            } else {
              const newItem = {
                serviceTag,
                model: item['Model'],
                category: item['Category'],
                status: item['Status'],
                location: item['Location'],
                notes: item['Notes'],
                macAddress: item['Mac Address'],
                decal: item['Decal'],
              };
              await addDoc(collection(db, 'assets'), newItem);
              await logAction('Imported', newItem);
              addedCount++;
            }
          }
  
          setImportedCount(addedCount);
          setUpdatedCount(updatedCount); 
          setLoading(false);
          setIsSuccess(true);
  
          setSelectedFile(null);
          document.querySelector('.file-input').value = '';
  
        }
      });
    };
  
    reader.readAsText(selectedFile);
  };
  

  return (
    <div className="import-container-wrapper">
      <Sidebar 
        collapsed={collapsed} 
        toggleSidebar={toggleSidebar} 
        location={location} 
        handleSignOut={handleSignOut} 
      />
      <div className={`import-content ${collapsed ? 'collapsed' : ''}`}>
        <div className="import-content-wrapper">
          <h2>Import Inventory Items</h2>
          <div className="file-upload-container">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload} 
              className="file-input"
            />
            <p className="file-instruction">
              Upload a CSV file with columns: <strong>Service Tag, Model, Category, Status, Location, Notes, Mac Address, Decal</strong>
            </p>
          </div>
          <button onClick={downloadTemplate} className="download-template-btn">
            Download CSV Template
          </button>
        </div>
      </div>

      <ImportModal
        show={showImportModal}
        onConfirm={processFile}
        onCancel={() => { 
          setShowImportModal(false); 
          setSelectedFile(null); 
          setIsSuccess(false); 
          setImportedCount(0);
          setUpdatedCount(0);
          setLoading(false);
        }}
        fileName={selectedFile?.name || ''}
        loading={loading}
        isSuccess={isSuccess}
        importedCount={importedCount}
        updatedCount={updatedCount}
      />

      <AddAssetModal showModal={showModal} closeModal={() => setShowModal(false)} />
    </div>
  );
};

export default Import;
