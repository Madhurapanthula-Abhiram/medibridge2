import React from 'react';
import { FiActivity, FiChevronRight } from 'react-icons/fi';

export const DISEASE_ICONS = {
    flu: '🤒', influenza: '🤒',
    cold: '🤧', 'common cold': '🤧',
    fever: '🌡️', covid: '🦠', pneumonia: '🫁',
    asthma: '💨', diabetes: '🩸', heart: '❤️',
    malaria: '🦟', dengue: '🦟', typhoid: '🦠',
    migraine: '🧠', stroke: '🧠', stomach: '🤢',
    skin: '🩹', allergy: '🤧', anxiety: '😰',
    headache: '🤕', tension: '🤕',
    default: '🩺',
};

export const getIcon = (name = '') => {
    const lower = name.toLowerCase();
    for (const [key, icon] of Object.entries(DISEASE_ICONS)) {
        if (lower.includes(key)) return icon;
    }
    return DISEASE_ICONS.default;
};

const IllnessCard = ({ illness, onClick }) => {
    const severityClass = (illness.severity || 'low').toLowerCase();

    return (
        <div
            className={`illness-card glass-card severity-${severityClass}`}
            onClick={() => onClick(illness)}
        >
            <div className="illness-icon">{getIcon(illness.name)}</div>

            <div className="illness-content">
                <div className="illness-card-header">
                    <div className="illness-info">
                        <h4>{illness.name}</h4>
                        <span className="illness-specialty">{illness.specialty}</span>
                    </div>
                    <div className="illness-match">
                        <span className="match-percentage">{illness.confidence}% Match</span>
                    </div>
                </div>

                <div className="illness-card-body">
                    <p className="illness-desc">{illness.description}</p>
                </div>

                <div className="illness-card-footer-meta">
                    <span className={`severity-badge badge-${severityClass}`}>
                        {illness.severity} SEVERITY
                    </span>
                    <span className="view-more">View Care Plan →</span>
                </div>
            </div>
        </div>
    );
};

export default IllnessCard;
