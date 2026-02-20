import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './Auth.css';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Supabase redirects back with a session in the URL hash; it's auto-handled
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (!data.session) {
                setError('Invalid or expired reset link. Please request a new one.');
            }
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
        if (password !== confirm) { setError('Passwords do not match'); return; }

        setLoading(true);
        setError('');
        const { error } = await supabase.auth.updateUser({ password });
        setLoading(false);

        if (error) {
            setError(error.message);
        } else {
            setSuccess('Password changed! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2500);
        }
    };

    return (
        <section className="auth-section">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Set New Password</h1>
                        <p>Enter your new password below.</p>
                    </div>

                    {error && <div className="auth-alert error"><FiAlertCircle /><span>{error}</span></div>}
                    {success && <div className="auth-alert success"><FiCheckCircle /><span>{success}</span></div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="rp-password"><FiLock /> New Password</label>
                            <div className="password-input">
                                <input type={showPw ? 'text' : 'password'} id="rp-password"
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter new password" />
                                <button type="button" className="toggle-password" onClick={() => setShowPw(!showPw)}>
                                    {showPw ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="rp-confirm"><FiLock /> Confirm Password</label>
                            <input type={showPw ? 'text' : 'password'} id="rp-confirm"
                                value={confirm} onChange={e => setConfirm(e.target.value)}
                                placeholder="Confirm new password" />
                        </div>
                        <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                            {loading ? <span className="spinner-small"></span> : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ResetPassword;
