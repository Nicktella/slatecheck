import React, { useEffect, useState } from "react";
import axios from "axios";
import Upload from "./Upload";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import { AuthProvider, useAuth } from "./AuthContext";
import { 
  Search, 
  Download, 
  Filter, 
  Calendar, 
  AlertCircle, 
  FileText, 
  TrendingUp, 
  Users, 
  Settings,
  Bell,
  ChevronDown,
  RefreshCw,
  MoreVertical,
  LogOut,
  User
} from "lucide-react";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <RefreshCw className="icon-lg spinning" />
        <span>Loading...</span>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AuditDashboard() {
  const { user, logout } = useAuth();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalLogs: 0,
    todayErrors: 0,
    criticalErrors: 0,
    filesProcessed: 0
  });

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("http://localhost:3001/audit");
      console.log("📦 Server response:", res.data);
      if (Array.isArray(res.data.logs)) {
        setLogs(res.data.logs);
        setFilteredLogs(res.data.logs);
        calculateStats(res.data.logs);
      } else {
        console.warn("❗ res.data.logs is not an array");
        setLogs([]);
        setFilteredLogs([]);
      }
    } catch (err) {
      console.error("🔥 Error fetching logs:", err);
      if (err.response?.status === 401) {
        console.log("Authentication required - user should login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (logsData) => {
    const today = new Date().toDateString();
    const todayErrors = logsData.filter(log => 
      new Date(log.created_at).toDateString() === today
    ).length;
    
    const uniqueFiles = new Set(logsData.map(log => log.filename)).size;
    
    setStats({
      totalLogs: logsData.length,
      todayErrors,
      criticalErrors: logsData.filter(log => 
        log.error_message.toLowerCase().includes('critical') || 
        log.error_message.toLowerCase().includes('fatal')
      ).length,
      filesProcessed: uniqueFiles
    });
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    filterLogs(term, filterBy);
  };

  const handleFilter = (filter) => {
    setFilterBy(filter);
    filterLogs(searchTerm, filter);
  };

  const filterLogs = (search, filter) => {
    let filtered = logs;

    if (search) {
      filtered = filtered.filter(log =>
        log.filename.toLowerCase().includes(search.toLowerCase()) ||
        log.error_message.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filter !== "all") {
      const today = new Date().toDateString();
      switch (filter) {
        case "today":
          filtered = filtered.filter(log => 
            new Date(log.created_at).toDateString() === today
          );
          break;
        case "critical":
          filtered = filtered.filter(log =>
            log.error_message.toLowerCase().includes('critical') ||
            log.error_message.toLowerCase().includes('fatal')
          );
          break;
      }
    }

    setFilteredLogs(filtered);
  };

  const exportToCSV = () => {
    if (!filteredLogs.length) return;

    const headers = ["filename", "row_number", "error_message", "created_at"];
    const csvRows = [
      headers.join(","),
      ...filteredLogs.map(log =>
        [
          `"${log.filename}"`,
          log.row_number,
          `"${log.error_message.replace(/"/g, '""')}"`,
          new Date(log.created_at).toLocaleString(),
        ].join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getErrorSeverity = (errorMessage) => {
    const msg = errorMessage.toLowerCase();
    if (msg.includes('critical') || msg.includes('fatal')) return 'critical';
    if (msg.includes('warning') || msg.includes('warn')) return 'warning';
    return 'error';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'severity-critical';
      case 'warning': return 'severity-warning';
      default: return 'severity-error';
    }
  };

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="nav-content">
          <div className="nav-left">
            <div className="brand">
              <div className="brand-icon">
                <FileText className="icon-sm" />
              </div>
              <div className="brand-text">
                <h1 className="brand-title">SlateCheck</h1>
                <p className="brand-subtitle">Audit Management System</p>
              </div>
            </div>
          </div>
          
          <div className="nav-right">
            <button className="notification-btn">
              <Bell className="icon-sm" />
              <span className="notification-badge"></span>
            </button>
            <div className="user-menu">
              <div className="user-info">
                <User className="icon-sm" />
                <span className="user-email">{user?.email}</span>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut className="icon-sm" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-text">
                <p className="stat-label">Total Logs</p>
                <p className="stat-value">{stats.totalLogs.toLocaleString()}</p>
              </div>
              <div className="stat-icon stat-icon-blue">
                <FileText className="icon-md" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-text">
                <p className="stat-label">Today's Errors</p>
                <p className="stat-value">{stats.todayErrors}</p>
              </div>
              <div className="stat-icon stat-icon-orange">
                <AlertCircle className="icon-md" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-text">
                <p className="stat-label">Critical Errors</p>
                <p className="stat-value">{stats.criticalErrors}</p>
              </div>
              <div className="stat-icon stat-icon-red">
                <TrendingUp className="icon-md" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-text">
                <p className="stat-label">Files Processed</p>
                <p className="stat-value">{stats.filesProcessed}</p>
              </div>
              <div className="stat-icon stat-icon-green">
                <Users className="icon-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Panel */}
        <div className="main-panel">
          {/* Panel Header */}
          <div className="panel-header">
            <div className="panel-header-content">
              <div className="panel-title">
                <h2 className="panel-heading">Audit Logs</h2>
                <p className="panel-description">Monitor and analyze system audit logs</p>
              </div>
              
              <div className="panel-actions">
                <div className="search-container">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                <div className="action-buttons">
                  <select
                    value={filterBy}
                    onChange={(e) => handleFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Logs</option>
                    <option value="today">Today</option>
                    <option value="critical">Critical</option>
                  </select>
                  
                  <button
                    onClick={fetchLogs}
                    disabled={isLoading}
                    className="refresh-btn"
                  >
                    <RefreshCw className={`icon-sm ${isLoading ? 'spinning' : ''}`} />
                  </button>
                  
                  <button
                    onClick={exportToCSV}
                    className="export-btn"
                  >
                    <Download className="icon-sm" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="upload-section">
            <div className="upload-content">
              <h3 className="upload-title">Upload CSV File</h3>
              <p className="upload-description">Upload your CSV files for audit processing and error detection.</p>
              <Upload onUploadComplete={fetchLogs} />
            </div>
          </div>

          {/* Table Section */}
          <div className="table-container">
            {isLoading ? (
              <div className="loading-state">
                <RefreshCw className="icon-lg spinning" />
                <span className="loading-text">Loading audit logs...</span>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="audit-table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-th">File Details</th>
                      <th className="table-th">Row</th>
                      <th className="table-th">Error Details</th>
                      <th className="table-th">Timestamp</th>
                      <th className="table-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="empty-state">
                          <div className="empty-content">
                            <FileText className="empty-icon" />
                            <h3 className="empty-title">No audit logs found</h3>
                            <p className="empty-description">
                              {searchTerm || filterBy !== 'all' 
                                ? 'Try adjusting your search or filter criteria.' 
                                : 'Upload a CSV file to get started with audit logging.'
                              }
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log, i) => {
                        const severity = getErrorSeverity(log.error_message);
                        return (
                          <tr key={i} className="table-row">
                            <td className="table-td">
                              <div className="file-info">
                                <div className="file-icon">
                                  <FileText className="icon-sm" />
                                </div>
                                <div className="file-details">
                                  <p className="file-name" title={log.filename}>
                                    {log.filename}
                                  </p>
                                  <p className="file-type">CSV File</p>
                                </div>
                              </div>
                            </td>
                            <td className="table-td">
                              <span className="row-badge">
                                Row {log.row_number}
                              </span>
                            </td>
                            <td className="table-td">
                              <div className="error-info">
                                <span className={`severity-badge ${getSeverityColor(severity)}`}>
                                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                                </span>
                                <p className="error-message" title={log.error_message}>
                                  {log.error_message.length > 100 
                                    ? `${log.error_message.substring(0, 100)}...` 
                                    : log.error_message
                                  }
                                </p>
                              </div>
                            </td>
                            <td className="table-td">
                              <div className="timestamp-info">
                                <div className="timestamp-date">
                                  {new Date(log.created_at).toLocaleDateString()}
                                </div>
                                <div className="timestamp-time">
                                  {new Date(log.created_at).toLocaleTimeString()}
                                </div>
                              </div>
                            </td>
                            <td className="table-td">
                              <button className="action-btn">
                                <MoreVertical className="icon-sm" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Table Footer */}
          {filteredLogs.length > 0 && (
            <div className="table-footer">
              <div className="footer-content">
                <p className="result-count">
                  Showing <span className="count-highlight">{filteredLogs.length}</span> of{' '}
                  <span className="count-highlight">{logs.length}</span> audit logs
                </p>
                <div className="last-updated">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute>
            <AuditDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;