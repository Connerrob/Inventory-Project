import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';
import NavbarComponent from '../components/Navbar';
import AssetTable from '../components/Table';
import AddAssetModal from '../components/AddAssetModal';
import EditAssetModal from '../components/EditAssetModal';
import FilterModal from '../components/FilterModal';
import { logAction } from '../utils';
import Pagination from '../components/Pagination';
import ConfirmationModal from '../components/ConfirmationModal';
import '../styles/Dashboard.css';

const Dashboard = ({ handleSignOut }) => {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsed, setCollapsed] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterModalShow, setFilterModalShow] = useState(false);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionText, setActionText] = useState(''); 

  const location = useLocation();

  const initialAssetState = {
    serviceTag: '',
    model: '',
    category: '',
    status: '',
    location: '',
    notes: '',
    macAddress: '',
    decal: '',
  };

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchAssets = async () => {
      const querySnapshot = await getDocs(collection(db, 'assets'));
      const assetsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAssets(assetsList);
    };
    fetchAssets();
  }, []);

  const handleEditClick = (asset) => {
    setSelectedAsset(asset);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedAsset((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setShowConfirmation(true); 
    setActionText(selectedAsset.id ? 'save changes to' : 'add'); 
  };

  const handleConfirmSave = async () => {
    if (selectedAsset.id) {
      const assetRef = doc(db, 'assets', selectedAsset.id);
      const oldItem = assets.find((a) => a.id === selectedAsset.id);

      await updateDoc(assetRef, selectedAsset);
      setAssets((prev) =>
        prev.map((a) => (a.id === selectedAsset.id ? selectedAsset : a))
      );

      await logAction('edit', { oldItem, newItem: selectedAsset });
    } else {
      const docRef = await addDoc(collection(db, 'assets'), selectedAsset);
      const newAsset = { ...selectedAsset, id: docRef.id };

      setAssets((prev) => [...prev, newAsset]);

      await logAction('add', newAsset);
    }

    setShowModal(false);
    setShowConfirmation(false);
  };

  const handleDelete = async (id) => {
    if (typeof id !== 'string' || id.trim() === '') {
      return;
    }
  
    const assetToDelete = assets.find((a) => a.id === id);
  
    if (!assetToDelete) {
      console.error('Asset not found');
      return;
    }
  
    const assetRef = doc(db, 'assets', id);
  
    try {
      await deleteDoc(assetRef);
  
      await logAction('delete', assetToDelete);
  
      setAssets((prevAssets) => prevAssets.filter((asset) => asset.id !== id));
    } catch (error) {
      console.error('Error deleting asset: ', error);
    }
  };
  

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const filteredAssets = assets
    .filter((asset) => {
      if (searchQuery) {
        return Object.values(asset).some((value) =>
          value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return true;
    })
    .filter((asset) => {
      return Object.keys(filters).every((key) => {
        if (filters[key] && asset[key]) {
          return asset[key]?.toLowerCase().includes(filters[key].toLowerCase());
        }
        return !filters[key] || !asset[key];
      });
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAssets = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Container fluid className="dashboard-container">
      <Row>
        <Col xs={2}>
          <Sidebar
            collapsed={collapsed}
            toggleSidebar={() => setCollapsed(!collapsed)}
            location={location}
            handleSignOut={handleSignOut}
          />
        </Col>
        <Col xs={10}>
          <div className="dashboard-header">
            <NavbarComponent
              title="Inventory"
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
            />
          </div>
          <div className="table-container">
            <AssetTable
              assets={currentAssets}
              onEditClick={handleEditClick}
              searchQuery={searchQuery}
              filters={filters}
            />

            <Button
              className="filter-button"
              onClick={() => setFilterModalShow(true)}
            >
              Filter
            </Button>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />

            <Button
              className="add-button"
              onClick={() => {
                setSelectedAsset(initialAssetState);
                setShowModal(true);
              }}
            >
              Add New Asset
            </Button>
          </div>

          {selectedAsset?.id ? (
            <EditAssetModal
              show={showModal}
              onHide={() => setShowModal(false)}
              selectedAsset={selectedAsset}
              onChange={handleChange}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          ) : (
            <AddAssetModal
              show={showModal}
              onHide={() => setShowModal(false)}
              selectedAsset={selectedAsset}
              onChange={handleChange}
              onSave={handleSave}
            />
          )}

          <FilterModal
            show={filterModalShow}
            onHide={() => setFilterModalShow(false)}
            onFilter={handleFilter}
          />

          <ConfirmationModal
            show={showConfirmation}
            onClose={() => setShowConfirmation(false)}
            onConfirm={handleConfirmSave}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
