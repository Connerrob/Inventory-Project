import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import NavbarComponent from "../components/Navbar";
import AssetTable from "../components/Table";
import AddAssetModal from "../components/AddAssetModal";
import EditAssetModal from "../components/EditAssetModal";
import FilterModal from "../components/FilterModal";
import { logAction } from "../utils";
import ConfirmationModal from "../components/ConfirmationModal";
import "../styles/Dashboard.css";

const Dashboard = ({ handleSignOut }) => {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsed, setCollapsed] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterModalShow, setFilterModalShow] = useState(false);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteAssetId, setDeleteAssetId] = useState(null);

  const location = useLocation();

  const initialAssetState = {
    partNumber: "",
    category: "",
    description: "",
    quantity: "",
    price: "",
    retail: "",
  };

  useEffect(() => {
    const fetchAssets = async () => {
      const querySnapshot = await getDocs(collection(db, "assets"));
      const assetsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAssets(assetsList);
      setFilteredAssets(assetsList);
    };
    fetchAssets();
  }, []);

  const handleEditClick = (asset) => {
    setSelectedAsset(asset);
    setShowModal(true);
  };

  const handleDeleteClick = (asset) => {
    setDeleteAssetId(asset);
    setShowConfirmation(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedAsset((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setShowConfirmation(true);
  };

  const handleConfirmSave = async () => {
    if (selectedAsset.id) {
      const assetRef = doc(db, "assets", selectedAsset.id);
      const oldItem = assets.find((a) => a.id === selectedAsset.id);

      await updateDoc(assetRef, selectedAsset);
      setAssets((prev) =>
        prev.map((a) => (a.id === selectedAsset.id ? selectedAsset : a))
      );

      await logAction("edit", { oldItem, newItem: selectedAsset });
    } else {
      const docRef = await addDoc(collection(db, "assets"), selectedAsset);
      const newAsset = { ...selectedAsset, id: docRef.id };

      setAssets((prev) => [...prev, newAsset]);

      await logAction("add", newAsset);
    }

    setShowModal(false);
    setShowConfirmation(false);
  };
  const handleConfirmDelete = async (assetToDelete) => {
    const idToDelete = assetToDelete?.id || deleteAssetId;
    if (idToDelete) {
      const assetRef = doc(db, "assets", idToDelete);
      const oldItem = assets.find((a) => a.id === idToDelete);

      await deleteDoc(assetRef);
      await logAction("delete", oldItem);

      setAssets((prev) => prev.filter((asset) => asset.id !== idToDelete));
      setDeleteAssetId(null);
      setShowConfirmation(false);
      setShowModal(false);
      console.log("Asset deleted successfully");
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilter = (filters) => {
    setFilters(filters);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  const getFilteredSortedAssets = () => {
    return assets
      .filter((asset) => {
        if (searchQuery) {
          return Object.values(asset).some((value) =>
            value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        return true;
      })
      .filter((asset) => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          return asset[key]?.toString().toLowerCase() === value.toLowerCase();
        });
      })
      .sort((a, b) => {
        if (sortConfig.key) {
          const aValue = (a[sortConfig.key] ?? "").toString();
          const bValue = (b[sortConfig.key] ?? "").toString();
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue, undefined, {
                numeric: true,
                sensitivity: "base",
              })
            : bValue.localeCompare(aValue, undefined, {
                numeric: true,
                sensitivity: "base",
              });
        }
        return 0;
      });
  };

  useEffect(() => {
    setFilteredAssets(getFilteredSortedAssets());
  }, [assets, searchQuery, filters, sortConfig]);

  const exportToCSV = () => {
    const headers = [
      "Part Number",
      "Category",
      "Description",
      "Quantity",
      "Price",
      "Retail",
    ];

    const rows = filteredAssets.map((asset) => [
      asset.partNumber,
      asset.category,
      asset.description,
      asset.quantity,
      asset.price ? `$${asset.price}` : "",
      asset.retail ? `$${asset.retail}` : "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "assets_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <Button
              className="add-button"
              onClick={() => {
                setSelectedAsset(initialAssetState);
                setShowModal(true);
              }}
            >
              Add New Item
            </Button>

            <Button
              className="filter-button"
              onClick={() => setFilterModalShow(true)}
            >
              Filter
            </Button>

            <Button className="export-button" onClick={exportToCSV}>
              Export
            </Button>

            <AssetTable
              assets={filteredAssets}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              searchQuery={searchQuery}
              filters={filters}
              onSort={handleSort}
            />
          </div>

          {selectedAsset?.id ? (
            <EditAssetModal
              show={showModal}
              onHide={() => setShowModal(false)}
              selectedAsset={selectedAsset}
              isAdding={false}
              onChange={handleChange}
              onSave={handleConfirmSave}
              onAdd={handleConfirmSave}
              onDelete={handleConfirmDelete}
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
            onDeleteConfirm={handleConfirmDelete}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
