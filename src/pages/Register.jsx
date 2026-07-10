import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nama.trim() || !email.trim() || !password.trim()) { setError('Semua field harus diisi'); return; }
    if (password !== confirm) { setError('Password tidak cocok'); return; }
    if (password.length < 6) { setError('Password minimal 6 karakter'); return; }
    setLoading(true); setError('');
    const result = await signUp(email.trim(), password, nama.trim());
    if (result.error) {
      setError(typeof result.error === 'string' ? result.error : JSON.stringify(result.error));
      setLoading(false);
    }
    else { alert('Berhasil! Silakan cek email untuk verifikasi, lalu login.'); navigate('/login'); }
  }

  return (
    <div className="auth-page">
      <div className="auth-header">
        <div className="logo">✨</div>
        <h1>Buat Akun Baru</h1>
        <p>Daftar untuk mulai mencatat utang-piutang</p>
      </div>
      <form onSubmit={handleSubmit}>
        {error && <div className="toast error" style={{position:'relative',top:0,transform:'none',marginBottom:16}}>{error}</div>}
        <div className="form-group">
          <label>Nama Lengkap</label>
          <input type="text" placeholder="Nama kamu" value={nama} onChange={e => setNama(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="nama@email.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="Minimal 6 karakter" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Konfirmasi Password</label>
          <input type="password" placeholder="Ulangi password" value={confirm} onChange={e => setConfirm(e.target.value)} />
        </div>
        <button className="btn btn-primary" disabled={loading} style={{marginTop:8}}>
          {loading ? 'Memuat...' : 'Daftar'}
        </button>
      </form>
      <div className="auth-footer">
        Sudah punya akun? <Link to="/login">Masuk</Link>
      </div>
    </div>
  );
}
