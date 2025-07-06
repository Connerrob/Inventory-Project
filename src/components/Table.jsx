import React, { useState } from "react";
import { Button, Table } from "react-bootstrap";

const AssetTable = ({
  assets = [],
  onEditClick,
  searchQuery,
  filters = {},
}) => {
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  const scoredAssets = assets
    .map((asset) => {
      const fields = [
        asset.partNumber,
        asset.category,
        asset.description,
        asset.quantity?.toString(),
        asset.price?.toString(),
        asset.retail?.toString(),
      ];

      const query = searchQuery.toLowerCase();
      let score = 0;

      fields.forEach((field) => {
        const value = (field || "").toLowerCase();
        if (value === query) score += 3;
        else if (value.startsWith(query)) score += 2;
        else if (value.includes(query)) score += 1;
      });

      return { ...asset, _score: score };
    })
    .filter((asset) => asset._score > 0 || searchQuery === "");

  // Sort the scored assets by relevance and then by selected column
  const sortedAssets = [...scoredAssets].sort((a, b) => {
    if (b._score !== a._score) return b._score - a._score;

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

  // Handle column sort click
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Get sort arrow indicator for the column
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  };

  // Render the asset table
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Actions</th>
          <th onClick={() => handleSort("partNumber")}>
            Part Number{getSortIndicator("partNumber")}
          </th>
          <th onClick={() => handleSort("category")}>
            Category{getSortIndicator("category")}
          </th>
          <th onClick={() => handleSort("description")}>
            Description{getSortIndicator("description")}
          </th>
          <th onClick={() => handleSort("quantity")}>
            Quantity{getSortIndicator("quantity")}
          </th>
          <th onClick={() => handleSort("price")}>
            Price{getSortIndicator("price")}
          </th>
          <th onClick={() => handleSort("retail")}>
            Retail{getSortIndicator("retail")}
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedAssets.map((asset) => (
          <tr key={asset.id}>
            <td>
              <Button onClick={() => onEditClick(asset)}>Edit</Button>
            </td>
            <td>{asset.partNumber}</td>
            <td>{asset.category}</td>
            <td>{asset.description}</td>
            <td>{asset.quantity}</td>
            <td>{asset.price ? `$${asset.price}` : ""}</td>
            <td>{asset.retail ? `$${asset.retail}` : ""}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default AssetTable;
