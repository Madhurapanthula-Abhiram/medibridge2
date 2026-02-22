import { useState, useRef } from 'react';
import { FiUpload, FiImage, FiSettings, FiActivity, FiAlertTriangle, FiArrowLeft, FiPlusCircle, FiShield } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './XRayPrediction.css';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const XRayPrediction = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
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

    const handleUpload = async () => {
        if (!image) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await fetch(`${API_BASE}/predict-xray`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Analysis failed');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error('[XRayPage] Error:', err);
            setError(err.message || 'Failed to analyze X-ray. Please try again.');
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
                                    <div className="condition-row">
                                        <div className="condition-box">
                                            <label>Primary Finding</label>
                                            <h4>{result.condition}</h4>
                                        </div>
                                        <div className="confidence-box">
                                            <label>Confidence</label>
                                            <div className="confidence-pill" style={{ '--conf': `${result.confidence}` }}>
                                                {result.confidence}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="explanation-box">
                                        <label><FiActivity /> Analysis Explanation</label>
                                        <p>{result.explanation}</p>
                                    </div>

                                    <div className="specialist-box">
                                        <label>Recommended Specialist</label>
                                        <span className="specialty-tag">{result.specialist}</span>
                                    </div>
                                </div>

                                <div className="report-details">
                                    <div className="detail-section">
                                        <h5><FiPlusCircle /> Care Plan</h5>
                                        <ul>
                                            {result.carePlan?.map((item, i) => <li key={i}>{item}</li>)}
                                        </ul>
                                    </div>

                                    <div className="detail-section">
                                        <h5><FiShield /> Red Flags</h5>
                                        <ul className="emergency-list">
                                            {result.emergencySigns?.map((item, i) => <li key={i}>{item}</li>)}
                                        </ul>
                                    </div>
                                </div>

                                <div className="report-disclaimer">
                                    <FiAlertTriangle />
                                    <p>{result.disclaimer}</p>
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
