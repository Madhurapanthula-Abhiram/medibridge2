import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiClock, FiTrash2, FiAlertTriangle, FiActivity, FiShield } from 'react-icons/fi';
import './HistoryPage.css';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const SEVERITY_COLORS = {
    low: 'severity-low',
    mild: 'severity-low',
    medium: 'severity-medium',
    moderate: 'severity-medium',
    high: 'severity-high',
    severe: 'severity-high',
    critical: 'severity-critical',
};

const HistoryPage = () => {
    const { getToken } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);
    const [toast, setToast] = useState(null);
    const [showWarning, setShowWarning] = useState(false);
    const [confirmClear, setConfirmClear] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchHistory = async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const token = getToken();
            const res = await fetch(`${API_BASE}/history`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || `Server error ${res.status}`);
            }
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.history || []);
            setRecords(list);
            if (list.length > 30) setShowWarning(true);
        } catch (err) {
            console.error('[HistoryPage] fetch error:', err);
            setFetchError(err.message || 'Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const deleteRecord = async (id) => {
        setDeleting(id);
        try {
            const token = getToken();
            const res = await fetch(`${API_BASE}/history/${id}`, {
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) throw new Error('Delete failed');
            setRecords(prev => prev.filter(r => r.id !== id));
            showToast('Record deleted');
        } catch {
            showToast('Failed to delete record', 'error');
        } finally {
            setDeleting(null);
        }
    };

    const deleteAll = async () => {
        setConfirmClear(false);
        try {
            const token = getToken();
            // Delete each record individually (backend may not support bulk DELETE)
            await Promise.all(
                records.map(r =>
                    fetch(`${API_BASE}/history/${r.id}`, {
                        method: 'DELETE',
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                    })
                )
            );
            setRecords([]);
            setShowWarning(false);
            showToast('All records cleared');
        } catch {
            showToast('Failed to clear history', 'error');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            return new Intl.DateTimeFormat('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
            }).format(new Date(dateStr));
        } catch { return dateStr; }
    };

    const confPct = (val) => {
        if (val === undefined || val === null) return null;
        const n = parseFloat(val);
        if (isNaN(n)) return null;
        return `${(n <= 1 ? n * 100 : n).toFixed(0)}%`;
    };

    return (
        <section className="history-page section">
            <div className="container">

                {/* ── Header ── */}
                <div className="history-header animate-on-scroll">
                    <div className="history-title-row">
                        <div>
                            <h1>Prediction <span className="text-gradient">History</span></h1>
                            <p>{loading ? 'Loading...' : `${records.length} record${records.length !== 1 ? 's' : ''} found`}</p>
                        </div>
                        {records.length > 0 && (
                            <button className="btn-danger-outline" onClick={() => setConfirmClear(true)}>
                                <FiTrash2 /> Clear All
                            </button>
                        )}
                    </div>

                    {showWarning && (
                        <div className="history-warning">
                            <FiAlertTriangle />
                            Your history is growing large. Consider deleting old records.
                            <button onClick={() => setShowWarning(false)}>✕</button>
                        </div>
                    )}
                </div>

                {/* ── Confirm clear dialog ── */}
                {confirmClear && (
                    <div className="confirm-overlay">
                        <div className="confirm-dialog glass-card">
                            <FiAlertTriangle className="confirm-icon" />
                            <h3>Delete All Records?</h3>
                            <p>This cannot be undone. All your prediction history will be permanently removed.</p>
                            <div className="confirm-actions">
                                <button className="btn-danger" onClick={deleteAll}>Yes, Delete All</button>
                                <button className="btn btn-secondary" onClick={() => setConfirmClear(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Toast ── */}
                {toast && (
                    <div className={`history-toast ${toast.type}`}>
                        {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
                    </div>
                )}

                {/* ── States ── */}
                {loading ? (
                    <div className="history-loading">
                        <div className="spinner" />
                        <p>Loading your history...</p>
                    </div>
                ) : fetchError ? (
                    <div className="history-empty glass-card animate-on-scroll">
                        <FiAlertTriangle className="empty-icon" style={{ color: '#f87171' }} />
                        <h3>Could Not Load History</h3>
                        <p>{fetchError}</p>
                        <button className="btn btn-primary" onClick={fetchHistory} style={{ marginTop: '1rem' }}>
                            Retry
                        </button>
                    </div>
                ) : records.length === 0 ? (
                    <div className="history-empty glass-card animate-on-scroll">
                        <FiClock className="empty-icon" />
                        <h3>No History Yet</h3>
                        <p>Your symptom predictions will appear here once you use the analyzer.</p>
                    </div>
                ) : (
                    <div className="history-list animate-on-scroll">
                        {records.map((record) => {
                            const sev = (record.severity || '').toLowerCase();
                            const pct = confPct(record.confidence_score);
                            const symptomsList = Array.isArray(record.symptoms_input)
                                ? record.symptoms_input
                                : (record.symptoms_input ? [record.symptoms_input] : []);

                            return (
                                <div key={record.id} className="history-card glass-card">
                                    <div className="history-card-top">
                                        <div className="history-disease-info">
                                            <div className="history-disease-header">
                                                <h3 className="history-disease-name">
                                                    {record.predicted_disease || 'Unknown Condition'}
                                                </h3>
                                                {sev && (
                                                    <span className={`severity-badge ${SEVERITY_COLORS[sev] || 'severity-medium'}`}>
                                                        {sev.charAt(0).toUpperCase() + sev.slice(1)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="history-meta">
                                                <span className="history-date">
                                                    <FiClock /> {formatDate(record.created_at)}
                                                </span>
                                                {pct && (
                                                    <span className="confidence-chip">
                                                        <FiShield /> {pct} match
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            className="delete-btn"
                                            onClick={() => deleteRecord(record.id)}
                                            disabled={deleting === record.id}
                                            title="Delete record"
                                        >
                                            {deleting === record.id
                                                ? <span className="spinner-small" />
                                                : <FiTrash2 />}
                                        </button>
                                    </div>

                                    {/* Symptoms */}
                                    {symptomsList.length > 0 && (
                                        <div className="history-symptoms">
                                            <span className="symptom-label"><FiActivity /> Symptoms:</span>
                                            <div className="symptom-pills">
                                                {symptomsList.map((s, i) => (
                                                    <span key={i} className="symptom-pill">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default HistoryPage;
