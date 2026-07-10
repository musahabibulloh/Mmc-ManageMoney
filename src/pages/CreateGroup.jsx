import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';

export default function CreateGroup() {
  const [nama, setNama] = useState('');
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();
  const { createGroup } = useGroup();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nama.trim()) { alert('Masukkan nama grup'); return; }
    setLoading(true);
    const result = await createGroup(nama.trim(), session.user.id);
    if (result.error) { alert(result.error); setLoading(false); }
    else {
      alert(`Grup berhasil dibuat! 🎉\nKode undangan: ${result.group.kode_undangan}\n\nBagikan kode ini ke teman-teman.`);
      navigate('/');
    }
  }

  return (
    <div className="page">
      <div className="page-header" style={{textAlign:'center'}}>
        <div style={{fontSize:48}}>🏠</div>
        <h1>Buat Grup Baru</h1>
        <p>Buat grup untuk mencatat utang-piutang dengan teman-temanmu.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nama Grup</label>
          <input type="text" placeholder="Contoh: Kos Pak Budi" value={nama} onChange={e => setNama(e.target.value)} autoFocus />
        </div>
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Membuat...' : 'Buat Grup'}</button>
        <button type="button" className="btn btn-secondary" style={{marginTop:8}} onClick={() => navigate(-1)}>Batal</button>
      </form>
    </div>
  );
}
