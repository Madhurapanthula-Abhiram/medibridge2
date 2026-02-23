import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { illnesses, getCategories } from '../data/illnesses';
import { FiSearch, FiX, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import './CommonIllnesses.css';

const CommonIllnesses = ({ limit = 6, showViewAll = true }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIllness, setSelectedIllness] = useState(null);
  const [visibleCount, setVisibleCount] = useState(limit);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const categories = ['All', ...getCategories()];

  const filteredIllnesses = illnesses.filter((illness) => {
    const matchesCategory = selectedCategory === 'All' || illness.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      illness.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      illness.symptoms.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const displayedIllnesses = filteredIllnesses.slice(0, visibleCount);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'mild': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'severe': return '#ef4444';
      case 'chronic': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  return (
    <section className="common-illnesses section" ref={sectionRef}>
      <div className="container">
        <div className="section-title animate-on-scroll">
          <h2>Common <span className="text-gradient">Illnesses</span></h2>
          <p>
            Quick access to specialists for the most common health issues.
          </p>
        </div>

        <div className="illnesses-filter animate-on-scroll">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search conditions or symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery('')}>
                <FiX />
              </button>
            )}
          </div>

          <div className="category-tabs">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="illnesses-grid">
          {displayedIllnesses.map((illness, index) => (
            <div
              key={illness.id}
              className="illness-card animate-on-scroll"
              style={{ transitionDelay: `${index * 0.05}s` }}
              onClick={() => setSelectedIllness(illness)}
            >
              <div className="illness-icon">{illness.icon}</div>
              <div className="illness-content">
                <h3>{illness.name}</h3>
                <p>{illness.shortDescription}</p>
                <div className="illness-meta">
                  <span
                    className="severity-badge"
                    style={{ backgroundColor: `${getSeverityColor(illness.severity)}20`, color: getSeverityColor(illness.severity) }}
                  >
                    {illness.severity}
                  </span>
                  <span className="specialty">{illness.specialty.split(',')[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showViewAll && visibleCount < filteredIllnesses.length && (
          <div className="view-all-container animate-on-scroll">
            <button
              className="btn btn-outline view-all-btn"
              onClick={() => setVisibleCount(prev => prev + 6)}
            >
              View All Conditions
              <FiArrowRight />
            </button>
          </div>
        )}

        {filteredIllnesses.length === 0 && (
          <div className="no-results">
            <FiAlertCircle />
            <p>No conditions found matching your search.</p>
          </div>
        )}
      </div>

      {selectedIllness && (
        <IllnessModal
          illness={selectedIllness}
          onClose={() => setSelectedIllness(null)}
        />
      )}
    </section>
  );
};

const IllnessModal = ({ illness, onClose }) => {
  const navigate = useNavigate();
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'mild': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'severe': return '#ef4444';
      case 'chronic': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const handleFindDoctor = () => {
    const specialty = illness.specialty.split(',')[0].trim();
    navigate(`/find-doctor?query=${encodeURIComponent(specialty)}`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content illness-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FiX />
        </button>

        <div className="modal-header">
          <div className="modal-icon">{illness.icon}</div>
          <div className="modal-title">
            <h2>{illness.name}</h2>
            <span className="modal-category">{illness.category}</span>
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <p className="modal-description">{illness.shortDescription}</p>
            <span
              className="severity-badge large"
              style={{ backgroundColor: `${getSeverityColor(illness.severity)}20`, color: getSeverityColor(illness.severity) }}
            >
              {illness.severity} severity
            </span>
          </div>

          <div className="modal-section">
            <h3>Common Symptoms</h3>
            <ul className="symptoms-list">
              {illness.symptoms.map((symptom, index) => (
                <li key={index}>{symptom}</li>
              ))}
            </ul>
          </div>

          <div className="modal-section">
            <h3>First Aid / Home Remedies</h3>
            <ul className="remedies-list">
              {illness.firstAid.map((remedy, index) => (
                <li key={index}>{remedy}</li>
              ))}
            </ul>
          </div>

          <div className="modal-section red-flags">
            <h3>When to Seek Medical Help</h3>
            <ul className="red-flags-list">
              {illness.redFlags.map((flag, index) => (
                <li key={index}>{flag}</li>
              ))}
            </ul>
          </div>

          <div className="modal-section">
            <h3>Treatment</h3>
            <p>{illness.treatment}</p>
          </div>

          <div className="modal-section">
            <h3>Recommended Specialist</h3>
            <p className="specialist">{illness.specialty}</p>
          </div>

          <div className="modal-section mt-4">
            <button className="btn btn-primary w-full" onClick={handleFindDoctor}>
              Find Doctors/Hospitals Nearby
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <p className="disclaimer">
            <FiAlertCircle />
            Not a substitute for professional medical advice. Always consult a healthcare provider.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommonIllnesses;