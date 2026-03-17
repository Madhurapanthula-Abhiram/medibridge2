import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import './Auth.css';

const Auth = () => {
  // 'login' | 'signup' | 'forgot'
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If we have a success message from update-password
    if (location.state?.message) {
      setSuccess(location.state.message);
    }

    // Redirect if already logged in (Part 2)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        window.location.href = "/dashboard";
      }
    });

    return () => subscription.unsubscribe();
  }, [location, navigate]);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    if (mode === 'signup' && !formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (mode !== 'forgot' && !formData.password) return 'Password is required';
    if (mode === 'signup' && formData.password.length < 6) return 'Password must be at least 6 characters';
    if (mode === 'signup' && formData.password !== formData.confirmPassword) return 'Passwords do not match';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');
    setSuccess('');

    if (mode === 'login') {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    } else if (mode === 'signup') {
      const result = await signup({ name: formData.name, email: formData.email, password: formData.password });
      if (result.success) {
        setSuccess(result.message);
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        setMode('login');
      } else {
        setError(result.error);
      }
    } else if (mode === 'forgot') {
      const result = await forgotPassword(formData.email);
      if (result.success) {
        setSuccess(result.message);
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      } else {
        setError(result.error);
      }
    }

    setLoading(false);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const titles = {
    login: 'Welcome Back',
    signup: 'Create Account',
    forgot: 'Reset Password'
  };
  const subtitles = {
    login: 'Sign in to access your health profile and saved predictions.',
    signup: 'Join MediBridge to get personalized health insights and connect with doctors.',
    forgot: 'Enter your email and we\'ll send you a reset link.'
  };

  return (
    <section className="auth-section">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>{titles[mode]}</h1>
            <p>{subtitles[mode]}</p>
          </div>

          {error && (
            <div className="auth-alert error">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-alert success">
              <FiCheckCircle />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'signup' && (
              <div className="form-group">
                <label htmlFor="name"><FiUser /> Full Name</label>
                <input type="text" id="name" name="name" value={formData.name}
                  onChange={handleChange} placeholder="Enter your full name" />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email"><FiMail /> Email Address</label>
              <input type="email" id="email" name="email" value={formData.email}
                onChange={handleChange} placeholder="Enter your email" />
            </div>

            {mode !== 'forgot' && (
              <div className="form-group">
                <label htmlFor="password"><FiLock /> Password</label>
                <div className="password-input">
                  <input type={showPassword ? 'text' : 'password'} id="password" name="password"
                    value={formData.password} onChange={handleChange}
                    placeholder={mode === 'login' ? 'Enter your password' : 'Create a password'} />
                  <button type="button" className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="form-group">
                <label htmlFor="confirmPassword"><FiLock /> Confirm Password</label>
                <input type={showPassword ? 'text' : 'password'} id="confirmPassword"
                  name="confirmPassword" value={formData.confirmPassword}
                  onChange={handleChange} placeholder="Confirm your password" />
              </div>
            )}

            {mode === 'login' && (
              <div className="form-options">
                <Link to="/forgot-password" data-testid="forgot-password-link" className="forgot-password"
                  style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'var(--accent-teal)', cursor: 'pointer', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
            )}

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading
                ? <span className="spinner-small"></span>
                : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Email'
              }
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <button
            type="button"
            className="btn btn-google"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
            <span>Sign in with Google</span>
          </button>

          <div className="auth-switch">
            {mode === 'login' && (
              <p>Don&apos;t have an account?{' '}
                <button type="button" className="switch-btn" onClick={() => switchMode('signup')}>Sign Up</button>
              </p>
            )}
            {mode === 'signup' && (
              <p>Already have an account?{' '}
                <button type="button" className="switch-btn" onClick={() => switchMode('login')}>Sign In</button>
              </p>
            )}
            {mode === 'forgot' && (
              <p>Remembered it?{' '}
                <button type="button" className="switch-btn" onClick={() => switchMode('login')}>Sign In</button>
              </p>
            )}
          </div>
        </div>

        <div className="auth-info">
          <div className="info-content">
            <h2>Your Health Journey Starts Here</h2>
            <ul className="benefits-list">
              <li><FiCheckCircle /><span>Save your symptom predictions</span></li>
              <li><FiCheckCircle /><span>Bookmark favorite doctors</span></li>
              <li><FiCheckCircle /><span>Access your health history</span></li>
              <li><FiCheckCircle /><span>Get personalized recommendations</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Auth;
