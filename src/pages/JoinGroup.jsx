import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';

export default function JoinGroup() {
  const [kode, setKode] = useState('');
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();
  const { joinGroup } = useGroup();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!kode.trim()) { alert('Masukkan kode undangan'); return; }
    setLoading(true);
    const result = await joinGroup(kode.trim(), session.user.id);
    if (result.error) { alert(result.error); setLoading(false); }
    else { alert('Berhasil bergabung! 🎉'); navigate('/'); }
  }

  return (
    <div className="page">
      <div className="page-header" style={{textAlign:'center'}}>
        <div style={{fontSize:48}}>🔗</div>
        <h1>Gabung Grup</h1>
        <p>Masukkan kode undangan dari temanmu.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Kode Undangan</label>
          <input type="text" placeholder="XXXXXX" value={kode}
            onChange={e => setKode(e.target.value.toUpperCase())}
            maxLength={6} autoFocus
            style={{textAlign:'center',fontSize:24,letterSpacing:4,fontWeight:800}} />
        </div>
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Bergabung...' : 'Gabung'}</button>
        <button type="button" className="btn btn-secondary" style={{marginTop:8}} onClick={() => navigate(-1)}>Batal</button>
      </form>
    </div>
  );
}
