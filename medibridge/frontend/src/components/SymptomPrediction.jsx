import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiActivity, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './SymptomPrediction.css';

// Components
import IllnessCard from './IllnessCard';
import PredictionModal from './PredictionModal';
import EmergencyAlert from './EmergencyAlert';
import SkeletonLoader from './SkeletonLoader';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const SymptomPrediction = () => {
  const [symptoms, setSymptoms] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIllness, setSelectedIllness] = useState(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const { getToken, isAuthenticated } = useAuth();

  // Local Emergency Detection
  const detectEmergency = (text) => {
    const keywords = [
      'chest pain', 'breathing', 'bleeding', 'unconscious',
      'bluish', 'confusion', 'stroke', 'seizure', 'passed out'
    ];
    const lower = text.toLowerCase();
    return keywords.some(k => lower.includes(k));
  };

  const savePredictionToHistory = async (predictionData) => {
    if (!isAuthenticated) return;
    try {
      const token = getToken();
      const symptomArr = symptoms.split(',').map(s => s.trim()).filter(Boolean);
      await fetch(`${API_BASE}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          symptoms_input: symptomArr,
          predicted_disease: predictionData.predictions?.[0]?.name || '',
          confidence_score: (predictionData.predictions?.[0]?.confidence || 0) / 100,
          severity: predictionData.predictions?.[0]?.severity || 'Low',
          full_response: predictionData,
        }),
      });
    } catch (err) {
      console.error('[SymptomPrediction] save history failed:', err);
    }
  };

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) { setError('Please describe your symptoms'); return; }

    setLoading(true);
    setError(null);
    setPrediction(null);
    setSelectedIllness(null);

    const hasEmergency = detectEmergency(symptoms);
    setIsEmergency(hasEmergency);

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/predict-symptoms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isAuthenticated ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ symptoms }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      // Handle Emergency Override (if backend didn't catch it or for consistency)
      if (hasEmergency || data.isEmergency) {
        setIsEmergency(true);
        if (data.predictions?.length > 0) {
          data.predictions[0].severity = 'Emergency';
        }
      }

      setPrediction(data);
      savePredictionToHistory(data);
    } catch (err) {
      console.error('[SymptomPrediction] error:', err);
      setError(err.message || 'Unable to connect to service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="symptom-prediction section">
      <div className="container">
        <div className="section-title animate-on-scroll">
          <h2>Health <span className="text-gradient">Analyzer</span></h2>
          <p>Describe your symptoms for an AI-powered medical analysis and care plan guidance.</p>
          <button
            className="btn btn-outline mt-4"
            onClick={() => window.location.href = '/x-ray-prediction'}
            style={{ marginTop: '1.5rem', borderRadius: '2rem', padding: '0.75rem 2rem' }}
          >
            Predict with X-Ray
          </button>
        </div>

        <div className="prediction-container">
          {/* 🔍 Input Section */}
          <div className="symptom-input-wrapper glass-card animate-on-scroll">
            <div className="input-header">
              <FiActivity /> Diagnostic Input
            </div>
            <textarea
              placeholder="Describe your symptoms (e.g., 'Sharp pain in lower abdomen and fever for 2 days')"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  analyzeSymptoms();
                }
              }}
              className="symptom-textarea"
              rows={4}
            />
            <div className="input-footer">
              <div className="hints">
                <span><FiCheckCircle /> Be descriptive</span>
                <span><FiCheckCircle /> Mention duration</span>
              </div>
              <button
                className="btn btn-primary"
                onClick={analyzeSymptoms}
                disabled={loading || !symptoms.trim()}
              >
                {loading ? <span className="spinner-small" /> : <><FiSearch /> Analyze</>}
              </button>
            </div>
          </div>

          {/* 🚨 Emergency Alert */}
          {isEmergency && <EmergencyAlert />}

          {/* ⚠️ Error */}
          {error && (
            <div className="error-message animate-fadeIn">
              <FiAlertCircle /> {error}
            </div>
          )}

          {/* ⏳ Loading State */}
          {loading && <SkeletonLoader type="card" count={3} />}

          {/* ✨ Prediction Results Section */}
          {prediction && !loading && (
            <div className="results-section animate-fadeIn">
              <div className="results-header-info">
                <h3>Predicted Conditions</h3>
                <span className="results-count">Top {prediction.predictions?.length || 0} Possibilities</span>
              </div>

              <div className="results-container">
                {Array.isArray(prediction.predictions) && prediction.predictions.length > 0 ? (
                  <div className="illness-cards-list">
                    {[...prediction.predictions]
                      .sort((a, b) => b.confidence - a.confidence)
                      .map((ill, i) => (
                        <IllnessCard
                          key={i}
                          illness={ill}
                          onClick={(item) => setSelectedIllness(item)}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="no-results-box">
                    <FiAlertCircle />
                    <p>No specific conditions identified. Please refine your symptoms or seek professional advice.</p>
                  </div>
                )}
              </div>

              <div className="disclaimer-modern mt-8">
                <div className="disclaimer-title">Medical Disclaimer</div>
                <p>{prediction.disclaimer}</p>
              </div>
            </div>
          )}
        </div>

        {/* 📦 Details Modal */}
        {selectedIllness && (
          <PredictionModal
            illness={selectedIllness}
            onClose={() => setSelectedIllness(null)}
          />
        )}
      </div>
    </section>
  );
};

export default SymptomPrediction;
