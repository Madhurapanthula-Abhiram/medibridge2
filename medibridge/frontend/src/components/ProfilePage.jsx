import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { FiEdit2, FiSave, FiX, FiUser, FiMail, FiCalendar, FiActivity, FiCamera, FiUpload } from 'react-icons/fi';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user, profile, updateProfile } = useAuth();

    const [editMode, setEditMode] = useState(false);
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const fileInputRef = useRef(null);

    const blankForm = { dob: '', gender: '', height: '', weight: '' };
    const [form, setForm] = useState(blankForm);
    const [saved, setSaved] = useState(blankForm);

    useEffect(() => {
        if (profile) {
            const data = {
                dob: profile.date_of_birth || profile.dob || '',
                gender: profile.gender || '',
                height: profile.height || '',
                weight: profile.weight || '',
            };
            setForm(data);
            setSaved(data);
            if (profile.avatar) setAvatarUrl(profile.avatar);
        }
    }, [profile]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    // ── Avatar upload ──────────────────────────────────────────────────────────
    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            showToast('Image must be under 2 MB', 'error');
            return;
        }

        setUploading(true);
        try {
            const ext = file.name.split('.').pop();
            const filePath = `${user.id}/avatar.${ext}`;

            const { error: uploadErr } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadErr) throw uploadErr;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const cacheBusted = `${publicUrl}?t=${Date.now()}`;
            setAvatarUrl(cacheBusted);

            // Save avatar URL to profile
            await updateProfile({ avatar: cacheBusted });
            showToast('Profile picture updated!');
        } catch (err) {
            showToast('Upload failed: ' + (err.message || 'Unknown error'), 'error');
        } finally {
            setUploading(false);
        }
    };

    // ── Validation ─────────────────────────────────────────────────────────────
    const validate = () => {
        const e = {};
        if (!form.dob) e.dob = 'Date of birth is required';
        if (!form.gender) e.gender = 'Gender is required';
        if (!form.height) e.height = 'Height is required';
        if (!form.weight) e.weight = 'Weight is required';
        if (form.height && (parseFloat(form.height) < 50 || parseFloat(form.height) > 300))
            e.height = 'Enter a valid height (50–300 cm)';
        if (form.weight && (parseFloat(form.weight) < 10 || parseFloat(form.weight) > 500))
            e.weight = 'Enter a valid weight (10–500 kg)';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        const { success, error } = await updateProfile({
            date_of_birth: form.dob,
            gender: form.gender,
            height: parseFloat(form.height),
            weight: parseFloat(form.weight),
        });
        setSaving(false);
        if (success) {
            setSaved({ ...form });
            setEditMode(false);
            showToast('Profile updated successfully');
        } else {
            showToast(error || 'Update failed', 'error');
        }
    };

    const handleCancel = () => {
        setForm({ ...saved });
        setErrors({});
        setEditMode(false);
    };

    // ── Display helpers ────────────────────────────────────────────────────────
    const displayName =
        profile?.full_name ||
        profile?.name ||
        user?.user_metadata?.name ||
        user?.email?.split('@')[0] ||
        'User';

    const avatarLetter = displayName.charAt(0).toUpperCase();

    return (
        <section className="profile-page section">
            <div className="container">
                <div className="profile-page-header animate-on-scroll">
                    <h1>My <span className="text-gradient">Profile</span></h1>
                    <p>Manage your personal health information</p>
                </div>

                {toast && (
                    <div className={`profile-toast ${toast.type}`}>
                        {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
                    </div>
                )}

                <div className="profile-card glass-card animate-on-scroll">
                    {/* ── Avatar + identity ── */}
                    <div className="profile-top">
                        {/* Avatar with upload overlay */}
                        <div className="profile-avatar-wrap" onClick={handleAvatarClick} title="Change profile picture">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="profile-avatar-img" />
                            ) : (
                                <div className="profile-avatar-large">{avatarLetter}</div>
                            )}
                            <div className="avatar-overlay">
                                {uploading
                                    ? <span className="spinner-small" />
                                    : <><FiCamera /><span>Change</span></>}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleAvatarChange}
                            />
                        </div>

                        <div className="profile-identity">
                            <h2>{displayName}</h2>
                            <p className="profile-role">MediBridge Member</p>
                        </div>
                    </div>

                    <div className="profile-divider" />

                    {/* ── Fields ── */}
                    <div className="profile-fields">
                        {/* Read-only: Name */}
                        <div className="profile-field">
                            <label><FiUser /> Full Name</label>
                            <div className="field-value locked">{displayName}</div>
                        </div>

                        {/* Read-only: Email */}
                        <div className="profile-field">
                            <label><FiMail /> Email</label>
                            <div className="field-value locked">{user?.email}</div>
                        </div>

                        {/* Editable: DOB */}
                        <div className={`profile-field ${errors.dob ? 'has-error' : ''}`}>
                            <label><FiCalendar /> Date of Birth</label>
                            {editMode ? (
                                <>
                                    <input
                                        type="date"
                                        value={form.dob}
                                        onChange={(e) => setForm({ ...form, dob: e.target.value })}
                                        className="profile-input dark-date"
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                    {errors.dob && <span className="field-error">{errors.dob}</span>}
                                </>
                            ) : (
                                <div className="field-value">{form.dob || '—'}</div>
                            )}
                        </div>

                        {/* Editable: Gender — only Male / Female */}
                        <div className={`profile-field ${errors.gender ? 'has-error' : ''}`}>
                            <label><FiUser /> Gender</label>
                            {editMode ? (
                                <>
                                    <select
                                        value={form.gender}
                                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                        className="profile-input"
                                    >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                    {errors.gender && <span className="field-error">{errors.gender}</span>}
                                </>
                            ) : (
                                <div className="field-value">
                                    {form.gender ? form.gender.charAt(0).toUpperCase() + form.gender.slice(1) : '—'}
                                </div>
                            )}
                        </div>

                        {/* Editable: Height */}
                        <div className={`profile-field ${errors.height ? 'has-error' : ''}`}>
                            <label><FiActivity /> Height (cm)</label>
                            {editMode ? (
                                <>
                                    <input
                                        type="number"
                                        value={form.height}
                                        onChange={(e) => setForm({ ...form, height: e.target.value })}
                                        className="profile-input"
                                        placeholder="e.g. 170"
                                        min="50" max="300"
                                    />
                                    {errors.height && <span className="field-error">{errors.height}</span>}
                                </>
                            ) : (
                                <div className="field-value">{form.height ? `${form.height} cm` : '—'}</div>
                            )}
                        </div>

                        {/* Editable: Weight */}
                        <div className={`profile-field ${errors.weight ? 'has-error' : ''}`}>
                            <label><FiActivity /> Weight (kg)</label>
                            {editMode ? (
                                <>
                                    <input
                                        type="number"
                                        value={form.weight}
                                        onChange={(e) => setForm({ ...form, weight: e.target.value })}
                                        className="profile-input"
                                        placeholder="e.g. 65"
                                        min="10" max="500"
                                    />
                                    {errors.weight && <span className="field-error">{errors.weight}</span>}
                                </>
                            ) : (
                                <div className="field-value">{form.weight ? `${form.weight} kg` : '—'}</div>
                            )}
                        </div>
                    </div>

                    {/* ── Actions ── */}
                    <div className="profile-actions">
                        {!editMode ? (
                            <button className="btn btn-primary" onClick={() => setEditMode(true)}>
                                <FiEdit2 /> Edit Profile
                            </button>
                        ) : (
                            <>
                                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                    {saving ? <span className="spinner-small" /> : <><FiSave /> Save Profile</>}
                                </button>
                                <button className="btn btn-secondary" onClick={handleCancel}>
                                    <FiX /> Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProfilePage;
