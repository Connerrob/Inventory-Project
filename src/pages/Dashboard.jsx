import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc, addDoc, writeBatch } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';
import NavbarComponent from '../components/Navbar';
import AssetTable from '../components/Table';
import AddAssetModal from '../components/AddAssetModal';
import FilterModal from '../components/FilterModal';
import { logAction } from '../utils';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsed, setCollapsed] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterModalShow, setFilterModalShow] = useState(false);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const location = useLocation();

  const initialAssetState = {
    name: '',
    category: '',
    description: '',
    quantity: '',
    serviceTag: '',
    model: '',
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

  const handleSave = async () => {
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
  };

  const handleDelete = async () => {
    if (!selectedAsset?.id) return;
    const assetRef = doc(db, 'assets', selectedAsset.id);

    await logAction('delete', { oldItem: selectedAsset });
    await deleteDoc(assetRef);
    setAssets((prev) => prev.filter((a) => a.id !== selectedAsset.id));

    setShowModal(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const filteredAssets = assets.filter((asset) => {
    return Object.keys(filters).every((key) => {
      if (key === 'status' && filters[key]) {
        return asset[key].toLowerCase() === filters[key].toLowerCase();
      }

      if (filters[key] && asset[key]) {
        return asset[key].toLowerCase().includes(filters[key].toLowerCase());
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

            <Button className="filter-button" onClick={() => setFilterModalShow(true)}>
              Filter
            </Button>

            <div className="pagination">
              {totalPages > 10 ? (
                <>
                  <button
                    onClick={() => setCurrentPage(1)}
                    className={currentPage === 1 ? 'active-page' : ''}
                    aria-label="Go to first page"
                  >
                    1
                  </button>

                  {currentPage > 6 && <span className="ellipsis">...</span>}

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page !== 1 &&
                        page !== totalPages &&
                        page >= currentPage - 4 &&
                        page <= currentPage + 4
                    )
                    .map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? 'active-page' : ''}
                        aria-label={`Go to page ${page}`}
                      >
                        {page}
                      </button>
                    ))}

                  {currentPage < totalPages - 5 && <span className="ellipsis">...</span>}

                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={currentPage === totalPages ? 'active-page' : ''}
                    aria-label="Go to last page"
                  >
                    {totalPages}
                  </button>
                </>
              ) : (
                Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={currentPage === index + 1 ? 'active-page' : ''}
                    aria-label={`Go to page ${index + 1}`}
                  >
                    {index + 1}
                  </button>
                ))
              )}
            </div>

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

          <AddAssetModal
            show={showModal}
            onHide={() => setShowModal(false)}
            selectedAsset={selectedAsset}
            onChange={handleChange}
            onSave={handleSave}
            onDelete={handleDelete}
          />

          <FilterModal
            show={filterModalShow}
            onHide={() => setFilterModalShow(false)}
            onFilter={handleFilter}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
