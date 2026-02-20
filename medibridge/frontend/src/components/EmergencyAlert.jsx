import React from 'react';
import { FiAlertOctagon, FiPhoneCall } from 'react-icons/fi';

const EmergencyAlert = ({ message }) => {
    return (
        <div className="emergency-alert-banner animate-pulse-subtle">
            <div className="alert-content">
                <h3>🚨 Emergency Warning</h3>
                <p>{message || "Your symptoms indicate a critical medical emergency. Please stop what you are doing and seek immediate professional help or call emergency services."}</p>
                <div className="emergency-actions">
                    <a href="tel:102" className="emergency-call-btn">
                        <FiPhoneCall /> Call Emergency Services
                    </a>
                </div>
            </div>
        </div>
    );
};

export default EmergencyAlert;
