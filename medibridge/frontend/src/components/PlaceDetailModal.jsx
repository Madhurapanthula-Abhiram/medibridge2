import { useState, useEffect } from 'react';
import { FiX, FiPhone, FiExternalLink, FiClock, FiStar, FiMapPin, FiGlobe, FiUsers, FiHome, FiCheckCircle, FiDollarSign, FiWifi, FiCar, FiNavigation } from 'react-icons/fi';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import './PlaceDetailModal.css';

const PlaceDetailModal = ({ place, isOpen, onClose }) => {
  const [showDirections, setShowDirections] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  // Get user location when modal opens
  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default location if geolocation fails
          setUserLocation({ lat: 40.7128, lng: -74.0060 });
        }
      );
    }
  }, [isOpen]);

  const formatOpeningHours = (opening_hours) => {
    if (!opening_hours || !opening_hours.periods) return 'Hours not available';
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();
    
    return opening_hours.periods
      .filter(period => period.open.day === today)
      .map(period => {
        const openTime = period.open.time.replace(/^(\d{2})(\d{2})$/, '$1:$2');
        const closeTime = period.close.time.replace(/^(\d{2})(\d{2})$/, '$1:$2');
        return `Today: ${openTime} - ${closeTime}`;
      })[0] || 'Hours not available';
  };

  const getPriceLevel = (level) => {
    const symbols = ['', '$', '$$', '$$$', '$$$$'];
    return symbols[level] || 'Price not available';
  };

  const toggleDirections = () => {
    setShowDirections(!showDirections);
  };

  if (!isOpen || !place) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content place-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <h2>{place.name}</h2>
            <div className="modal-rating">
              <FiStar /> {place.rating || 'N/A'} <span>({place.user_ratings_total || 0} reviews)</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <h3><FiMapPin /> Location & Contact</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <strong>Address:</strong>
                <p>{place.address}</p>
              </div>
              <div className="detail-item">
                <strong>Phone:</strong>
                <p>{place.phone || 'Phone not available'}</p>
              </div>
              <div className="detail-item">
                <strong>Distance:</strong>
                <p>{place.distance} km away</p>
              </div>
              {place.website && (
                <div className="detail-item">
                  <strong>Website:</strong>
                  <a href={place.website} target="_blank" rel="noreferrer" className="website-link">
                    <FiGlobe /> Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="detail-section">
            <h3><FiClock /> Hours & Availability</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <strong>Status:</strong>
                <span className={`status-badge ${place.open_now ? 'open' : 'closed'}`}>
                  {place.open_now ? 'Open Now' : 'Closed'}
                </span>
              </div>
              <div className="detail-item">
                <strong>Today's Hours:</strong>
                <p>{formatOpeningHours(place.opening_hours)}</p>
              </div>
              {place.price_level !== null && (
                <div className="detail-item">
                  <strong>Price Level:</strong>
                  <p>{getPriceLevel(place.price_level)}</p>
                </div>
              )}
            </div>
          </div>

          {place.services && place.services.length > 0 && (
            <div className="detail-section">
              <h3><FiCheckCircle /> Services</h3>
              <div className="services-list">
                {place.services.map((service, index) => (
                  <span key={index} className="service-tag">{service}</span>
                ))}
              </div>
            </div>
          )}

          {place.reviews && place.reviews.length > 0 && (
            <div className="detail-section">
              <h3><FiStar /> Recent Reviews</h3>
              <div className="reviews-list">
                {place.reviews.slice(0, 3).map((review, index) => (
                  <div key={index} className="review-item">
                    <div className="review-header">
                      <span className="review-author">{review.author_name}</span>
                      <div className="review-rating">
                        <FiStar /> {review.rating}
                      </div>
                    </div>
                    <p className="review-text">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h3>Amenities</h3>
            <div className="amenities-list">
              {place.wheelchair_accessible && (
                <div className="amenity-item">
                  <FiCheckCircle /> Wheelchair Accessible
                </div>
              )}
              <div className="amenity-item">
                <FiPhone /> Phone Booking Available
              </div>
              <div className="amenity-item">
                <FiCar /> Parking Available
              </div>
              <div className="amenity-item">
                <FiWifi /> WiFi Available
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {place.phone && (
            <a href={`tel:${place.phone}`} className="btn btn-primary">
              <FiPhone /> Call Now
            </a>
          )}
          <button 
            className="btn btn-outline"
            onClick={toggleDirections}
          >
            <FiNavigation /> {showDirections ? 'Hide Directions' : 'Show Directions'}
          </button>
        </div>

        {showDirections && isLoaded && userLocation && (
          <div className="directions-section">
            <div className="directions-header">
              <h3><FiNavigation /> Directions to {place.name}</h3>
              <p>From your current location</p>
            </div>
            <div className="directions-map">
              <GoogleMap
                mapContainerStyle={{
                  width: '100%',
                  height: '400px',
                  borderRadius: '0.75rem',
                }}
                center={{
                  lat: (userLocation.lat + place.location.lat) / 2,
                  lng: (userLocation.lng + place.location.lng) / 2,
                }}
                zoom={13}
                options={{
                  styles: [
                    { "elementType": "geometry", "stylers": [{ "color": "#121212" }] },
                    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#121212" }] },
                    { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
                    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#2c2c2c" }] }
                  ]
                }}
              >
                <Marker
                  position={userLocation}
                  icon={{
                    url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                  }}
                  title="Your Location"
                />
                <Marker
                  position={place.location}
                  icon={{
                    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                  }}
                  title={place.name}
                />
              </GoogleMap>
            </div>
            <div className="directions-info">
              <div className="directions-stats">
                <div className="stat-item">
                  <strong>Distance:</strong>
                  <span>{place.distance} km</span>
                </div>
                <div className="stat-item">
                  <strong>Estimated Time:</strong>
                  <span>~{Math.ceil(parseFloat(place.distance) * 3)} minutes by car</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceDetailModal;
