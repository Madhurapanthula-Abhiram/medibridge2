import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Bootstrap: listen to Supabase auth state changes ───────────────────────
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.access_token);
      setLoading(false);
    });

    // Subscribe to auth events (LOGIN, LOGOUT, TOKEN_REFRESHED, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.access_token);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (token) => {
    try {
      console.log(`[AuthContext] Fetching profile from: ${API_URL}/profile`);
      const res = await fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error('[AuthContext] Profile fetch error:', res.status, errData);
      }
    } catch (err) {
      console.warn('[AuthContext] Profile fetch aborted/failed:', err.message);
    }
  };

  // ── Signup ──────────────────────────────────────────────────────────────────
  const signup = async ({ name, email, password }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });
      if (error) return { success: false, error: error.message };
      return {
        success: true,
        message: 'Account created! Please check your email to confirm your account.'
      };
    } catch (err) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  // ── Forgot Password ─────────────────────────────────────────────────────────
  const forgotPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) return { success: false, error: error.message };
      return { success: true, message: 'Password reset email sent!' };
    } catch (err) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // ── Update Profile (via backend API) ────────────────────────────────────────
  const updateProfile = async (updates) => {
    try {
      const token = session?.access_token;
      if (!token) return { success: false, error: 'Not authenticated' };

      const res = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        return { success: true, data };
      }
      const err = await res.json();
      return { success: false, error: err.message || 'Update failed' };
    } catch (err) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // ── Get auth token (for API calls from other components) ────────────────────
  const getToken = () => session?.access_token || null;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      forgotPassword,
      updateProfile,
      getToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
