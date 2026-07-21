import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError('Masukkan email dan password'); return; }
    setLoading(true); setError('');
    const result = await signIn(email.trim(), password);
    if (result.error) {
      setError(typeof result.error === 'string' ? result.error : JSON.stringify(result.error));
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-box">
          <div className="auth-header">
            <div className="logo">💰</div>
            <h1>Welcome Back</h1>
            <p>Kelola utang-piutang dengan mudah & akurat</p>
          </div>
          <form onSubmit={handleSubmit}>
            {error && <div className="toast error">{error}</div>}
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="nama@email.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Masukkan password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button className="btn btn-primary" disabled={loading} style={{width: '100%', marginTop: 16}}>
              {loading ? 'Memuat...' : 'Masuk'}
            </button>
          </form>
          <div className="auth-footer">
            Belum punya akun? <Link to="/register">Daftar sekarang</Link>
          </div>
        </div>
      </div>
      <div className="auth-right"></div>
    </div>
  );
}
