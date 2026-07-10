import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function translateError(err) {
  if (!err) return 'Terjadi kesalahan yang tidak diketahui.';
  const msg = typeof err === 'string' ? err : err.message || JSON.stringify(err);
  const lowerMsg = msg.toLowerCase();
  
  if (lowerMsg.includes('email not confirmed')) return '⚠️ Akun belum aktif! Silakan cek kotak masuk (atau folder Spam) di email kamu dan klik link verifikasi sebelum login.';
  if (lowerMsg.includes('invalid login credentials')) return 'Email atau password yang kamu masukkan salah.';
  if (lowerMsg.includes('user already registered')) return 'Email ini sudah terdaftar. Silakan gunakan email lain atau langsung login.';
  if (lowerMsg.includes('password should be at least 6 characters')) return 'Password terlalu pendek, minimal 6 karakter.';
  if (lowerMsg.includes('rate limit')) return 'Terlalu banyak percobaan. Mohon tunggu beberapa menit dan coba lagi.';
  if (lowerMsg.includes('network') || lowerMsg.includes('fetch')) return 'Gangguan jaringan. Pastikan koneksi internetmu lancar.';
  
  return msg; // Fallback to original
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  }

  async function signUp(email, password, nama) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nama } }
      });
      
      if (error) return { error: translateError(error) };
      return {};
    } catch (err) {
      return { error: translateError(err) };
    }
  }

  async function signIn(email, password) {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: translateError(error) };
      return {};
    } catch (err) {
      return { error: translateError(err) };
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }

  async function updateProfile(nama) {
    if (!session?.user) return { error: 'Not authenticated' };
    const { error } = await supabase.from('profiles').update({ nama }).eq('id', session.user.id);
    if (error) return { error: error.message };
    setProfile(prev => prev ? { ...prev, nama } : null);
    return {};
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
