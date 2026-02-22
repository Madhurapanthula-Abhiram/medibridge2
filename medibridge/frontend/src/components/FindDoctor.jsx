import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiActivity, FiMapPin, FiSearch, FiMap } from 'react-icons/fi';
import './FindDoctor.css';

// Components
import DoctorCard from './DoctorCard';
import SearchBar from './SearchBar';
import SkeletonLoader from './SkeletonLoader';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

const FindDoctor = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [mapQuery, setMapQuery] = useState('');

  // Get User Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        async (err) => {
          console.warn('[FindDoctor] Geolocation failed, attempting IP-based lookup:', err.message);
          try {
            const resp = await fetch('https://ipapi.co/json/');
            const data = await resp.json();
            if (data.latitude && data.longitude) {
              setUserLocation({ lat: data.latitude, lng: data.longitude });
            }
          } catch (ipErr) {
            console.error('[FindDoctor] IP lookup failed:', ipErr);
          }
        }
      );
    }
  }, []);

  const fetchDoctors = useCallback(async (searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (userLocation) {
        params.append('lat', userLocation.lat);
        params.append('lng', userLocation.lng);
      }

      const response = await fetch(`${API_BASE}/doctors?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch doctors: ${response.statusText}`);
      }

      const data = await response.json();
      setDoctors(data.doctors || []);
      setUsingMockData(data.usingMockData || false);

      // Build the Google Maps query for the embed
      const mq = searchQuery
        ? `${searchQuery} medical`
        : userLocation
          ? `doctors near ${userLocation.lat},${userLocation.lng}`
          : 'doctors near me';
      setMapQuery(mq);

    } catch (err) {
      console.error('[FindDoctor] Fetch error:', err);
      setError('Unable to reach medical database. Showing fallback data.');
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  // Initial search from URL or default
  useEffect(() => {
    if (userLocation || query) {
      fetchDoctors(query);
    }
  }, [userLocation, query, fetchDoctors]);

  // Build Google Maps Embed URL
  const getMapEmbedUrl = () => {
    if (!GOOGLE_MAPS_KEY) {
      // Fallback: use public search embed (no key needed for basic embed)
      const q = encodeURIComponent(mapQuery || 'doctors near me');
      return `https://www.google.com/maps/embed/v1/search?key=AIzaSyD2LJ3k776KaAojuP49rToRYYFb0zWHcYs&q=${q}${userLocation ? `&center=${userLocation.lat},${userLocation.lng}&zoom=13` : ''}`;
    }
    const q = encodeURIComponent(mapQuery || 'doctors near me');
    return `https://www.google.com/maps/embed/v1/search?key=${GOOGLE_MAPS_KEY}&q=${q}${userLocation ? `&center=${userLocation.lat},${userLocation.lng}&zoom=13` : ''}`;
  };

  return (
    <div className="find-doctor">
      <div className="fd-container">
        {/* ── Header ── */}
        <header className="search-header-v2">
          <h2>Find <span className="text-gradient">Medical Care</span></h2>
          <p>Locate top-rated doctors, hospitals, and clinics in your area.</p>
        </header>

        {/* ── Search Bar ── */}
        <SearchBar
          onSearch={(val) => {
            setQuery(val);
            fetchDoctors(val);
          }}
          initialValue={query}
        />

        {/* ── Mock Data Notice ── */}
        {usingMockData && (
          <div className="mock-data-notice animate-fadeIn">
            📍 Showing sample data (Google Maps API key not configured or unavailable)
          </div>
        )}

        {/* ── Google Maps Embed ── */}
        {mapQuery && (
          <div className="fd-map-section animate-fadeIn">
            <div className="fd-map-header">
              <FiMap />
              <span>Map Results for: <strong>{mapQuery}</strong></span>
            </div>
            <div className="fd-map-wrapper">
              <iframe
                title="Find Doctor Map"
                src={getMapEmbedUrl()}
                className="fd-map-iframe"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        )}

        {/* ── Results Container ── */}
        <div className="results-container-v2">
          {loading ? (
            <SkeletonLoader type="doctor" count={5} />
          ) : doctors.length > 0 ? (
            <div className="results-list-v2">
              <div className="results-meta-v2">
                <span className="results-count-v2">{doctors.length} Results Found</span>
              </div>
              {doctors.map((doc) => (
                <DoctorCard key={doc.id} doctor={doc} />
              ))}
            </div>
          ) : !loading && (
            <div className="fd-empty-state animate-fadeIn">
              <div className="empty-icon"><FiSearch /></div>
              <h3>No Medical Care Found</h3>
              <p>Try searching for a different specialty or area.</p>
            </div>
          )}

          {error && !loading && (
            <div className="error-message">
              <FiActivity /> {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindDoctor;
