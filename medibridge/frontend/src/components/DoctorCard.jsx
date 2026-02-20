import React, { useState } from 'react';
import {
    FiMapPin, FiPhone, FiStar, FiNavigation,
    FiExternalLink, FiClock, FiHeart, FiGlobe, FiChevronDown, FiChevronUp
} from 'react-icons/fi';

const DoctorCard = ({ doctor }) => {
    const [isHoursExpanded, setIsHoursExpanded] = useState(false);

    return (
        <div className="doctor-card-v2 glass-card animate-fadeIn">
            <div className="doctor-card-main">
                <div className="doctor-image-container">
                    {doctor.photo ? (
                        <img src={doctor.photo} alt={doctor.name} loading="lazy" className="doctor-photo-v2" />
                    ) : (
                        <div className="doctor-photo-placeholder-v2">👨‍⚕️</div>
                    )}
                    {doctor.rating > 0 && (
                        <div className="rating-badge-v2">
                            <FiStar /> {doctor.rating.toFixed(1)}
                        </div>
                    )}
                </div>

                <div className="doctor-info-v2">
                    <div className="doctor-title-row">
                        <h3 className="doctor-name-v2">👨‍⚕️ {doctor.name}</h3>
                        <button className="favorite-btn-v2">
                            <FiHeart />
                        </button>
                    </div>

                    <p className="doctor-category-v2">{doctor.types?.[0]?.replace(/_/g, ' ') || 'Medical Facility'}</p>

                    <div className="doctor-meta-v2">
                        <span className="distance-badge-v2"><FiMapPin /> {doctor.distance} km away</span>
                        {doctor.open_now !== null && (
                            <span className={`open-status-v2 ${doctor.open_now ? 'open' : 'closed'}`}>
                                <FiClock /> {doctor.open_now ? 'Open Now' : 'Closed'}
                            </span>
                        )}
                    </div>

                    <p className="doctor-address-v2"><FiMapPin /> {doctor.address}</p>

                    {doctor.phone && (
                        <p className="doctor-phone-v2"><FiPhone /> {doctor.phone}</p>
                    )}

                    <div className="doctor-actions-v2">
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => window.open(doctor.directions_link, '_blank')}
                        >
                            <FiNavigation /> Directions
                        </button>
                        {doctor.phone && (
                            <a href={`tel:${doctor.phone}`} className="btn btn-outline btn-sm">
                                <FiPhone /> Call
                            </a>
                        )}
                        <a href={doctor.website || doctor.maps_link} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                            <FiExternalLink /> {doctor.website ? 'Website' : 'View on Maps'}
                        </a>
                    </div>
                </div>
            </div>

            {doctor.opening_hours && (
                <div className="doctor-hours-section">
                    <button
                        className="toggle-hours-btn"
                        onClick={() => setIsHoursExpanded(!isHoursExpanded)}
                    >
                        <FiClock /> <span>View Working Hours</span>
                        {isHoursExpanded ? <FiChevronUp /> : <FiChevronDown />}
                    </button>

                    {isHoursExpanded && (
                        <div className="hours-dropdown animate-slideDown">
                            {doctor.opening_hours.weekday_text?.map((day, i) => (
                                <div key={i} className="hour-row">{day}</div>
                            )) || <div className="hour-row">Hours information unavailable</div>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DoctorCard;
