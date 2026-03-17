import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { FiMail, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import '../components/Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });

            if (error) {
                setError(error.message);
            } else {
                setMessage('A password reset link has been sent to your email.');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="auth-section">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Reset Password</h1>
                        <p>Enter your email and we'll send you a reset link.</p>
                    </div>

                    {error && (
                        <div className="auth-alert error">
                            <FiAlertCircle />
                            <span>{error}</span>
                        </div>
                    )}

                    {message && (
                        <div className="auth-alert success">
                            <FiCheckCircle />
                            <span>{message}</span>
                        </div>
                    )}

                    <form onSubmit={handleReset} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email"><FiMail /> Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                            {loading ? <span className="spinner-small"></span> : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className="auth-switch">
                        <p>Remembered it?{' '}
                            <Link to="/login" className="switch-btn">Sign In</Link>
                        </p>
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

export default ForgotPassword;
