import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { FiLock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import '../components/Auth.css';

const UpdatePassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // If user lands here without a session (not from a reset link), redirect to forgot-password
        if (!user && !window.location.hash.includes('access_token')) {
            setTimeout(() => {
                setError('Invalid or expired reset link. Please request a new one.');
            }, 500);
        }
    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) {
                setError(updateError.message);
            } else {
                setSuccess('Password updated successfully. Redirecting to login...');
                setTimeout(() => {
                    navigate('/login', { state: { message: 'Password updated successfully.' } });
                }, 2000);
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
                        <h1>Update Password</h1>
                        <p>Set a new password for your account.</p>
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

                    <form onSubmit={handleUpdate} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="password"><FiLock /> New Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New password"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword"><FiLock /> Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                            {loading ? <span className="spinner-small"></span> : 'Update password'}
                        </button>
                    </form>

                    <div className="auth-switch">
                        <p>
                            <Link to="/login" className="switch-btn">Back to Login</Link>
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

export default UpdatePassword;
