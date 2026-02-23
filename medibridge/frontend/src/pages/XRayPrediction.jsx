import { useState, useRef } from 'react';
import { FiUpload, FiImage, FiSettings, FiActivity, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './XRayPrediction.css';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const XRayPrediction = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const { getToken, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please upload an image file (PNG, JPG).');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB.');
                return;
            }
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    /**
     * Requirement 1 & 2: Click event listener + Validation
     * Requirement 3, 4, 5: FormData, /analyze-xray, async/await
     */
    const handleUpload = async () => {
        if (!image) {
            setError('Please select an image file first.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        // Requirement 3: Use FormData correctly
        const formData = new FormData();
        formData.append('file', image);

        try {
            const token = getToken();
            const response = await fetch(`${API_BASE}/analyze-xray`, {
                method: 'POST',
                headers: {
                    ...(isAuthenticated ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Server error');
            }

            const data = await response.json();

            // Requirement 7: Check success flag and handle data
            if (data.success) {
                setResult(data);
            } else {
                throw new Error(data.message || 'Analysis failed');
            }
        } catch (err) {
            console.error('[XRayPage] Error:', err);
            // Requirement 8: Generic error message
            setError('Unable to analyze the X-ray. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="xray-prediction section">
            <div className="container">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Back to Health Analyzer
                </button>

                <div className="section-title animate-on-scroll">
                    <h1>Chest X-Ray <span className="text-gradient">Analyzer</span></h1>
                    <p>Upload a chest X-ray image for instant AI-powered classification and analysis.</p>
                </div>

                <div className="xray-container">
                    <div className="upload-side card glass-card">
                        <div className="upload-header">
                            <FiImage /> <h3>Upload Scan</h3>
                        </div>

                        <div
                            className={`drop-zone ${preview ? 'has-image' : ''}`}
                            onClick={() => fileInputRef.current.click()}
                        >
                            {preview ? (
                                <img src={preview} alt="X-ray Preview" className="preview-img" />
                            ) : (
                                <div className="drop-content">
                                    <FiUpload className="upload-icon" />
                                    <p>Drop your X-ray here or click to browse</p>
                                    <span className="file-hint">Supports PNG, JPG (Max 5MB)</span>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>

                        {/* Start AI Analysis Button */}
                        <button
                            className="btn btn-primary upload-submit-btn"
                            disabled={!image || loading}
                            onClick={handleUpload}
                        >
                            {loading ? (
                                <><span className="spinner-small"></span> Analyzing Scan...</>
                            ) : (
                                <><FiActivity /> Start AI Analysis</>
                            )}
                        </button>

                        {error && <div className="error-box"><FiAlertTriangle /> {error}</div>}
                    </div>

                    <div className="result-side card glass-card">
                        <div className="result-header">
                            <FiSettings /> <h3>Analysis Report</h3>
                        </div>

                        {!result && !loading && (
                            <div className="result-placeholder">
                                <FiActivity className="pulse-icon" />
                                <p>Upload and analyze a scan to generate your report</p>
                            </div>
                        )}

                        {loading && (
                            <div className="result-loading">
                                <div className="analysis-steps">
                                    <div className="step active">Processing image pixel data...</div>
                                    <div className="step active">Running classification models...</div>
                                    <div className="step">Generating medical explanation...</div>
                                </div>
                            </div>
                        )}

                        {result && (
                            <div className="report-content animate-fadeIn">
                                <div className="report-main">
                                    <div className="explanation-box" style={{ marginTop: '0' }}>
                                        <label className="report-subtitle">
                                            <FiActivity /> AI Diagnostic Report
                                        </label>
                                        {/* Requirement 6: Display report text in container */}
                                        <div className="report-text-container card-scroll">
                                            {result.report}
                                        </div>
                                    </div>
                                </div>

                                <div className="report-disclaimer" style={{ marginTop: '2rem' }}>
                                    <FiAlertTriangle />
                                    <p>This AI-generated analysis is for informational purposes only. It is not a substitute for professional medical diagnosis or clinical judgment. Please consult a qualified radiologist or physician for a definitive diagnosis.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default XRayPrediction;
