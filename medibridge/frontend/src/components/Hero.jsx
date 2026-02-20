import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiActivity } from 'react-icons/fi';
import Hero3DAnimation from './Hero3DAnimation';
import './Hero.css';

const Hero = () => {
  const heroRef = useRef(null);

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

    const elements = heroRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);



  return (
    <section className="hero" ref={heroRef}>
      <div className="hero-bg">
        <div className="hero-gradient"></div>
        <div className="hero-grid"></div>
      </div>

      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge animate-on-scroll">
            <FiActivity className="badge-icon" />
            <span>Your Health, Our Priority</span>
          </div>

          <h1 className="hero-title animate-on-scroll">
            <span className="title-line">AI-Powered Care,</span>
            <span className="title-line text-gradient">Personalized For You</span>
          </h1>

          <p className="hero-description animate-on-scroll">
            MediBridge connects you with the right doctors and hospitals based on your symptoms.
            Quick, accurate, and always nearby. Get personalized health insights and find
            verified healthcare professionals in your area.
          </p>

          <div className="hero-cta animate-on-scroll">
            <Link to="/symptom-prediction" className="btn btn-primary hero-btn-primary">
              Check My Symptoms
              <FiArrowRight />
            </Link>
            <Link to="/how-it-works" className="btn btn-secondary hero-btn-secondary">
              Learn More
            </Link>
          </div>

          <div className="hero-stats animate-on-scroll">
            <div className="stat-item">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Verified Doctors</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Happy Patients</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">25+</span>
              <span className="stat-label">Illness Guides</span>
            </div>
          </div>
        </div>

        <div className="hero-visual animate-on-scroll">
          <Hero3DAnimation />
        </div>
      </div>

      <div className="hero-wave">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path
            d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z"
            fill="var(--bg-primary)"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
