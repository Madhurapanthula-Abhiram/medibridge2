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
            className={`illness-card glass-card animate-in severity-${severityClass}`}
            onClick={() => onClick(illness)}
        >
            <div className="illness-icon">{getIcon(illness.name)}</div>

            <div className="illness-content">
                <h3>{illness.name}</h3>
                <p>{illness.description}</p>
                <div className="illness-meta">
                    <span className={`severity-badge ${severityClass}`}>
                        {illness.severity}
                    </span>
                    <span className="specialty">{illness.specialty}</span>
                </div>
            </div>
        </div>
    );
};

export default IllnessCard;
