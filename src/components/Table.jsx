import React from 'react';
import { Button, Table } from 'react-bootstrap';

const AssetTable = ({ assets = [], onEditClick, searchQuery, filters = {} }) => {
  const filteredAssets = assets.filter((asset) =>
    (asset.serviceTag || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (asset.model || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (asset.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (asset.status || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (asset.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (asset.notes || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (asset.macAddress || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (asset.decal || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validFilters = {
    serviceTag: filters.serviceTag || '',
    model: filters.model || '',
    category: filters.category || '',
    status: filters.status || '',
    location: filters.location || '',
    notes: filters.notes || '',
    macAddress: filters.macAddress || '',
    decal: filters.decal || ''
  };

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Action</th>
          <th>Service Tag</th>
          <th>Model</th>
          <th>Category</th>
          <th>Status</th>
          <th>Location</th>
          <th>Notes</th>
          <th>MAC Address</th>
          <th>Decal</th>
        </tr>
      </thead>
      <tbody>
        {filteredAssets.map((asset) => (
          <tr key={asset.id}>
            <td><Button onClick={() => onEditClick(asset)} variant="warning">Edit</Button></td>
            <td>{asset.serviceTag || "-"}</td>
            <td>{asset.model || "-"}</td>
            <td>{asset.category || "-"}</td>
            <td>{asset.status || "-"}</td>
            <td>{asset.location || "-"}</td>
            <td>{asset.notes || "-"}</td>
            <td>{asset.macAddress || "-"}</td>
            <td>{asset.decal || "-"}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default AssetTable;
