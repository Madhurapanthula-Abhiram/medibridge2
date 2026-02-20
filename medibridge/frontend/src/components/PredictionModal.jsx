import React from 'react';
import { FiX, FiAlertTriangle, FiActivity, FiShield, FiPlusCircle } from 'react-icons/fi';
import MedicationItem from './MedicationItem';
import { getIcon } from './IllnessCard';

const PredictionModal = ({ illness, onClose }) => {
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter' || e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!illness) return null;

    const severityClass = (illness.severity || 'low').toLowerCase();

    return (
        <div className="prediction-modal-overlay animate-fadeIn" onClick={onClose}>
            <div className="prediction-modal-container glass-card" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose} title="Press Enter to close">
                    <FiX />
                </button>

                <div className="modal-header">
                    <div className="header-top">
                        <div className="modal-header-icon">{getIcon(illness.name)}</div>
                        <span className="modal-specialty">{illness.specialty}</span>
                        <span className={`severity-badge badge-${severityClass}`}>
                            {illness.severity} SEVERITY
                        </span>
                    </div>
                    <h2 className="modal-illness-name">{illness.name}</h2>
                    <p className="modal-description">{illness.description}</p>
                </div>

                <div className="modal-content scroll-styled">
                    {/* Symptoms Section */}
                    <section className="modal-section">
                        <div className="section-title">
                            <FiActivity /> <span>Common Symptoms</span>
                        </div>
                        <div className="symptoms-grid">
                            {illness.symptoms?.map((s, i) => (
                                <div key={i} className="symptom-tag-v2">{s}</div>
                            ))}
                        </div>
                    </section>

                    {/* First Aid Section */}
                    <section className="modal-section">
                        <div className="section-title">
                            <FiShield /> <span>First Aid / Home Remedies</span>
                        </div>
                        <ul className="modal-list">
                            {illness.firstAid?.map((fa, i) => (
                                <li key={i}>{fa}</li>
                            ))}
                        </ul>
                    </section>

                    {/* Care Plan Section */}
                    <section className="modal-section">
                        <div className="section-title">
                            <FiPlusCircle /> <span>Care Plan</span>
                        </div>
                        <div className="care-plan-body">
                            <h5 className="subsection-label">OTC / MEDICATIONS</h5>
                            <div className="medication-list">
                                {illness.carePlan?.medications?.map((med, i) => (
                                    <MedicationItem key={i} med={med} />
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Emergency Signs Section */}
                    {illness.emergencySigns?.length > 0 && (
                        <section className="modal-section emergency-warning-box">
                            <div className="section-title text-emergency">
                                <FiAlertTriangle /> <span>When to Seek Medical Help</span>
                            </div>
                            <ul className="modal-list emergency-list">
                                {illness.emergencySigns.map((sign, i) => (
                                    <li key={i}>{sign}</li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-primary full-width" onClick={() => window.location.href = `/doctors?query=${encodeURIComponent(illness.specialty)}`}>
                        Find {illness.specialty} Nearby
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PredictionModal;
