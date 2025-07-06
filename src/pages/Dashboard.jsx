import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

import Sidebar from "../components/Sidebar";
import NavbarComponent from "../components/Navbar";
import AssetTable from "../components/Table";
import AddAssetModal from "../components/AddAssetModal";
import EditAssetModal from "../components/EditAssetModal";
import FilterModal from "../components/FilterModal";
import ConfirmationModal from "../components/ConfirmationModal";
import { logAction } from "../utils";

import "../styles/Dashboard.css";

const Dashboard = ({ handleSignOut }) => {
  const location = useLocation();

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

  const initialAssetState = {
    partNumber: "",
    category: "",
    description: "",
    quantity: "",
    price: "",
    retail: "",
  };

  // Fetch assets
  useEffect(() => {
    const fetchAssets = async () => {
      const snapshot = await getDocs(collection(db, "assets"));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAssets(list);
      setFilteredAssets(list);
    };
    fetchAssets();
  }, []);

  // Update filtered assets when search/filter/sort changes
  useEffect(() => {
    const filtered = assets
      .filter((asset) => {
        if (searchQuery) {
          return Object.values(asset).some((value) =>
            value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        return true;
      })
      .filter((asset) =>
        Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          return asset[key]?.toString().toLowerCase() === value.toLowerCase();
        })
      )
      .sort((a, b) => {
        if (!sortConfig.key) return 0;
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
      });

    setFilteredAssets(filtered);
  }, [assets, searchQuery, filters, sortConfig]);

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
      const ref = doc(db, "assets", selectedAsset.id);
      const oldItem = assets.find((a) => a.id === selectedAsset.id);
      await updateDoc(ref, selectedAsset);
      setAssets((prev) =>
        prev.map((a) => (a.id === selectedAsset.id ? selectedAsset : a))
      );
      await logAction("edit", { oldItem, newItem: selectedAsset });
    } else {
      const ref = await addDoc(collection(db, "assets"), selectedAsset);
      const newAsset = { ...selectedAsset, id: ref.id };
      setAssets((prev) => [...prev, newAsset]);
      await logAction("add", newAsset);
    }
    setShowModal(false);
    setShowConfirmation(false);
  };

  const handleConfirmDelete = async (assetToDelete) => {
    const id = assetToDelete?.id || deleteAssetId?.id;
    if (!id) return;

    const ref = doc(db, "assets", id);
    const oldItem = assets.find((a) => a.id === id);
    await deleteDoc(ref);
    await logAction("delete", oldItem);

    setAssets((prev) => prev.filter((a) => a.id !== id));
    setDeleteAssetId(null);
    setShowModal(false);
    setShowConfirmation(false);
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleFilter = (filters) => setFilters(filters);

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

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
      [headers, ...rows].map((row) => row.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "assets_export.csv";
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
