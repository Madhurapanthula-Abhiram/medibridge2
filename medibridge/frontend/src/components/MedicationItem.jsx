import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiInfo } from 'react-icons/fi';

const MedicationItem = ({ med }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`medication-item-wrapper ${isExpanded ? 'expanded' : ''}`}>
            <button
                className="med-pill-btn"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span>{med.name}</span>
                {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
            </button>

            {isExpanded && (
                <div className="med-details-expanded animate-fadeIn">
                    <div className="med-detail-row">
                        <strong><FiInfo /> Purpose:</strong>
                        <span>{med.purpose}</span>
                    </div>
                    <div className="med-detail-row">
                        <strong>📌 Usage:</strong>
                        <span>{med.usage}</span>
                    </div>
                    <div className="med-detail-row">
                        <strong>⚠️ Guidance:</strong>
                        <span>{med.guidance}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicationItem;
