import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { FiSearch, FiMapPin, FiPhone, FiStar, FiNavigation, FiActivity, FiX, FiExternalLink, FiClock, FiFilter } from 'react-icons/fi';
import './DoctorFinder.css';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1.25rem',
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060,
};

const DoctorFinder = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [searchType, setSearchType] = useState('doctor');
  const [filters, setFilters] = useState({
    rating: 0,
    distance: 50,
    openNow: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const sectionRef = useRef(null);
  const location = useLocation();

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);
          setMapCenter(pos);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setUserLocation(defaultCenter);
          setMapCenter(defaultCenter);
        },
        { timeout: 10000 }
      );
    } else {
      setUserLocation(defaultCenter);
      setMapCenter(defaultCenter);
    }
  }, []);

  const performSearch = useCallback(async (type, queryOverride = null) => {
    if (!userLocation) {
      console.warn('No user location available for search');
      return;
    }

    setLoading(true);
    setSearchType(type);

    try {
      const endpoint = type === 'hospital' ? '/hospitals' : '';
      const params = new URLSearchParams({
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius: filters.distance * 1000, // Convert km to meters
      });

      const activeQuery = queryOverride || searchQuery || specialty;

      if (type === 'doctor' && activeQuery) {
        params.append('specialty', activeQuery);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/doctors${endpoint}` : `/api/doctors${endpoint}`;
      const response = await fetch(`${apiUrl}?${params}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const results = type === 'hospital' ? data.hospitals : data.doctors;

      // Apply filters
      let filteredResults = results || [];

      if (filters.rating > 0) {
        filteredResults = filteredResults.filter(place =>
          (place.rating || 0) >= filters.rating
        );
      }

      if (filters.openNow) {
        filteredResults = filteredResults.filter(place =>
          place.open_now === true
        );
      }

      if (type === 'hospital') {
        setHospitals(filteredResults);
      } else {
        setDoctors(filteredResults);
      }

      if (filteredResults[0]?.location) {
        setMapCenter(filteredResults[0].location);
      }
    } catch (error) {
      console.error('Search error:', error);
      if (error.name === 'AbortError') {
        console.error('Search request timed out');
      }
    } finally {
      setLoading(false);
    }
  }, [userLocation, filters, searchQuery, specialty]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('query');
    if (query && userLocation && !loading && doctors.length === 0) {
      setSearchQuery(query);
      performSearch('doctor', query);
    }
  }, [location.search, userLocation, performSearch, loading, doctors.length]);

  const clearFilters = () => {
    setFilters({
      rating: 0,
      distance: 50,
      openNow: false
    });
  };

  if (loadError) return <div className="error-screen">Error loading Google Maps. Please check your API key.</div>;
  if (!isLoaded) return <div className="loading-screen"><div className="spinner"></div><p>Initialising Maps...</p></div>;

  return (
    <section className="doctor-finder section" ref={sectionRef}>
      <div className="container">
        <div className="search-header glass-card animate-on-scroll">
          <h2>Find <span className="text-gradient">Medical Care</span></h2>
          <p className="search-sub">Search for doctors and hospitals near you with advanced filters</p>

          <div className="search-controls">
            <div className="search-inputs">
              <div className="input-with-icon">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search by illness or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="input-with-icon">
                <FiActivity />
                <input
                  type="text"
                  placeholder="Specialty (e.g. Cardiologist, Dentist)"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-controls">
              <button
                className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <FiFilter /> Filters
              </button>
            </div>

            {showFilters && (
              <div className="filters-panel glass-card">
                <h4>Filters</h4>
                <div className="filter-group">
                  <label>Minimum Rating</label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters({ ...filters, rating: parseFloat(e.target.value) })}
                  >
                    <option value="0">Any Rating</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Max Distance: {filters.distance} km</label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={filters.distance}
                    onChange={(e) => setFilters({ ...filters, distance: parseInt(e.target.value) })}
                  />
                </div>
                <div className="filter-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={filters.openNow}
                      onChange={(e) => setFilters({ ...filters, openNow: e.target.checked })}
                    />
                    Open Now Only
                  </label>
                </div>
                <button className="btn btn-outline" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            )}

            <div className="search-buttons">
              <button
                className={`btn ${searchType === 'doctor' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => performSearch('doctor')}
                disabled={loading}
              >
                {loading && searchType === 'doctor' ? <span className="spinner-small"></span> : <><FiActivity /> Find Doctors</>}
              </button>
              <button
                className={`btn ${searchType === 'hospital' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => performSearch('hospital')}
                disabled={loading}
              >
                {loading && searchType === 'hospital' ? <span className="spinner-small"></span> : <><FiMapPin /> Nearby Hospitals</>}
              </button>
            </div>
          </div>
        </div>

        <div className="results-layout">
          <div className="list-side">
            {(searchType === 'doctor' ? doctors : hospitals).length > 0 ? (
              (searchType === 'doctor' ? doctors : hospitals).map((item, idx) => (
                <div key={item.id || idx} className="place-card glass-card" onClick={() => {
                  setSelectedPlace(item);
                  setMapCenter(item.location);
                }}>
                  <div className="place-header">
                    <h4>{item.name}</h4>
                    <div className="rating">
                      <FiStar /> {item.rating || 'N/A'} <span>({item.user_ratings_total || 0})</span>
                    </div>
                  </div>
                  <p className="address"><FiMapPin /> {item.address}</p>
                  {item.distance && (
                    <p className="distance"><FiNavigation /> {item.distance} km away</p>
                  )}
                  {item.phone && (
                    <p className="phone"><FiPhone /> {item.phone}</p>
                  )}

                  <div className="place-info-tags">
                    <span className={`status-tag ${item.open_now ? 'open' : 'closed'}`}>
                      <FiClock /> {item.open_now ? 'Open Now' : 'Closed'}
                    </span>
                    {item.types?.includes('health') && <span className="type-tag">Verified Health Provider</span>}
                  </div>

                  <div className="place-footer">
                    {item.phone ? (
                      <a href={`tel:${item.phone}`} className="contact-btn">
                        <FiPhone /> Call
                      </a>
                    ) : (
                      <button className="contact-btn" disabled>
                        <FiPhone /> No Phone
                      </button>
                    )}
                    <a href={item.directions_link || item.maps_link} target="_blank" rel="noreferrer" className="directions-link">
                      <FiExternalLink /> Directions
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="place-no-results glass-card">
                <div className="no-res-icon"><FiActivity /></div>
                <h3>No Results Found</h3>
                <p>Try adjusting your filters or search for a different specialty.</p>
              </div>
            )}
          </div>

          <div className="map-side glass-card">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={14}
              options={{
                styles: [
                  { "elementType": "geometry", "stylers": [{ "color": "#121212" }] },
                  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#121212" }] },
                  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
                  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#2c2c2c" }] }
                ]
              }}
            >
              {userLocation && (
                <Marker
                  position={userLocation}
                  icon={{
                    url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                  }}
                  title="Your Location"
                />
              )}
              {(searchType === 'doctor' ? doctors : hospitals).map(item => (
                <Marker
                  key={item.id}
                  position={item.location}
                  onClick={() => setSelectedPlace(item)}
                />
              ))}
              {selectedPlace && (
                <InfoWindow
                  position={selectedPlace.location}
                  onCloseClick={() => setSelectedPlace(null)}
                >
                  <div className="info-window-content">
                    <h5>{selectedPlace.name}</h5>
                    <p>{selectedPlace.address}</p>
                    {selectedPlace.phone && <p><FiPhone /> {selectedPlace.phone}</p>}
                    {selectedPlace.distance && <p><FiNavigation /> {selectedPlace.distance} km</p>}
                    <div className="info-window-footer">
                      <a href={selectedPlace.directions_link || selectedPlace.maps_link} target="_blank" rel="noreferrer">
                        Directions <FiExternalLink />
                      </a>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DoctorFinder;
