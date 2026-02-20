import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiLogIn, FiUser, FiLogOut, FiClock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, profile, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/symptom-prediction', label: 'Symptoms' },
    { path: '/find-doctor', label: 'Doctors' },
    { path: '/illnesses', label: 'Illness' },
    { path: '/about', label: 'About' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/');
  };

  const displayName = profile?.full_name || profile?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const avatarSrc = profile?.avatar || profile?.avatar_url || profile?.profile_pic || profile?.picture || profile?.image || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || profile?.image_url;

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        <Link to="/" className="header-logo">
          <div className="pulse-logo">
            <svg viewBox="0 0 100 60" className="pulse-svg">
              <path
                className="pulse-line"
                d="M5 30 L20 30 L25 10 L35 50 L45 5 L55 55 L65 30 L95 30"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="logo-text">MediBridge</span>
        </Link>

        <nav className={`header-nav ${isMobileMenuOpen ? 'nav-open' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="nav-label">{link.label.toUpperCase()}</span>
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <div className="profile-menu" ref={dropdownRef}>
              <button
                className="avatar-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User menu"
              >
                <div className="avatar-ring">
                  <div className="avatar-circle">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="Avatar" className="avatar-img-small" />
                    ) : (
                      avatarLetter
                    )}
                  </div>
                </div>
              </button>

              {dropdownOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {avatarSrc ? (
                        <img src={avatarSrc} alt="Avatar" className="avatar-img-dropdown" />
                      ) : (
                        avatarLetter
                      )}
                    </div>
                    <div className="dropdown-user-info">
                      <span className="dropdown-name">{displayName}</span>
                      <span className="dropdown-email">{user?.email}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <FiUser /> Profile
                  </Link>
                  <Link to="/history" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <FiClock /> Prediction History
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              <FiLogIn /> Login
            </Link>
          )}

          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;