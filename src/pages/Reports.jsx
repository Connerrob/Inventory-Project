import React, { useEffect, useState } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import { db } from '../firebase';
import Sidebar from '../components/Sidebar';
import { Container, Row, Col, Table, Alert } from 'react-bootstrap';
import Pagination from '../components/Pagination';
import '../styles/Reports.css';

const Reports = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  const location = useLocation();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const logsSnapshot = await getDocs(collection(db, 'assetLogs'));
        const logsList = [];

        for (const doc of logsSnapshot.docs) {
          const logData = doc.data();
          const userDoc = logData.user ? logData.user : 'Unknown';

          logsList.push({
            id: doc.id,
            ...logData,
            user: userDoc,
          });
        }

        logsList.sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());

        setLogs(logsList);
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    fetchLogs();
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') return 'Invalid Date';
    return timestamp.toDate().toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const formatFieldName = (field) => {
    const fieldNames = {
      serviceTag: 'Service Tag',
      model: 'Model',
      status: 'Status',
      location: 'Location',
      notes: 'Notes',
      macAddress: 'MAC Address',
      name: 'Item Name',
      category: 'Category',
      description: 'Description',
      quantity: 'Quantity',
      decal: 'Decal',
    };
    return fieldNames[field] || field;
  };

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(logs.length / logsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Container fluid className="reports-container">
      <Row>
        <Col xs={2}>
          <Sidebar collapsed={collapsed} toggleSidebar={() => setCollapsed(!collapsed)} location={location} />
        </Col>
        <Col xs={10}>
          <div className="reports-content">
            <h2 className="section-title">Activity Logs</h2>
            {logs.length === 0 ? (
              <Alert variant="info">No activity logged yet. Check back later!</Alert>
            ) : (
              <>
                <Table striped bordered hover className="styled-table">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Item</th>
                      <th>Changes</th>
                      <th>Timestamp</th>
                      <th>User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLogs.map((log, index) => (
                      <tr key={index}>
                        <td>{log.actionType}</td>
                        <td>{log.assetName || log.serviceTag || 'Unknown'}</td>
                        <td>
                          {log.changes && Object.keys(log.changes).length > 0 ? (
                            Object.entries(log.changes).map(([field, change], i) => (
                              <div key={i} className="change-item">
                                <strong>{formatFieldName(field)}:</strong> {change.from} → {change.to}
                              </div>
                            ))
                          ) : log.changes === null ? (
                            'No changes'
                          ) : (
                            'No changes recorded'
                          )}
                        </td>
                        <td>{formatTimestamp(log.timestamp)}</td>
                        <td>{log.user || 'Unknown'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Reports;
