import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import './App.css';

// Simple Home Page
const Home = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>MediBridge Healthcare Platform</h1>
    <p>Your AI-powered healthcare assistant</p>
    <div style={{ marginTop: '2rem' }}>
      <h2>Features:</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li>✅ Symptom Prediction with AI</li>
        <li>✅ Doctor & Hospital Finder</li>
        <li>✅ Google Maps Integration</li>
        <li>✅ Detailed Medical Information</li>
      </ul>
    </div>
  </div>
);

// Simple Pages
const SymptomsPage = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>Symptom Prediction</h1>
    <p>AI-powered health analysis coming soon...</p>
  </div>
);

const DoctorsPage = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>Find Doctors</h1>
    <p>Healthcare provider search coming soon...</p>
  </div>
);

const IllnessPage = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>Common Illnesses</h1>
    <p>Medical conditions database coming soon...</p>
  </div>
);

const AboutPage = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>About MediBridge</h1>
    <p>Advanced healthcare platform powered by AI</p>
  </div>
);

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/symptom-prediction" element={<SymptomsPage />} />
          <Route path="/find-doctor" element={<DoctorsPage />} />
          <Route path="/illnesses" element={<IllnessPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
