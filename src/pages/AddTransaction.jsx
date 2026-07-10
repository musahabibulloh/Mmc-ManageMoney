import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';

export default function AddTransaction() {
  const { session } = useAuth();
  const { currentGroup, members, addTransaction } = useGroup();
  const navigate = useNavigate();
  const userId = session?.user?.id;

  const [peminjamId, setPeminjamId] = useState('');
  const [pemberiId, setPemberiId] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!currentGroup) {
    return <div className="page"><div className="empty-state"><div className="icon">⚠️</div><p>Pilih grup terlebih dahulu</p></div></div>;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!peminjamId) { setError('Pilih peminjam'); return; }
    if (!pemberiId) { setError('Pilih pemberi pinjaman'); return; }
    if (peminjamId === pemberiId) { setError('Peminjam dan pemberi tidak boleh sama'); return; }
    const amount = parseInt(jumlah.replace(/\D/g, ''), 10);
    if (!amount || amount <= 0) { setError('Masukkan jumlah yang valid'); return; }

    setLoading(true); setError('');
    const result = await addTransaction({
      group_id: currentGroup.id, peminjam_id: peminjamId,
      pemberi_pinjaman_id: pemberiId, jumlah: amount,
      keterangan: keterangan.trim() || null, tanggal,
    });
    if (result.error) { setError(result.error); setLoading(false); }
    else { alert('Transaksi berhasil dicatat! ✅'); navigate('/transactions'); }
  }

  function MemberSelector({ label, selected, onSelect, exclude }) {
    return (
      <div className="form-group">
        <label>{label}</label>
        <div className="member-grid">
          {members.filter(m => m.id !== exclude).map(m => (
            <button type="button" key={m.id}
              className={`member-chip ${selected === m.id ? 'selected' : ''}`}
              onClick={() => onSelect(m.id)}>
              {m.id === userId ? `${m.nama} (Kamu)` : m.nama}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>💸 Catat Transaksi</h1>
        <p>Grup: {currentGroup.nama}</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="toast error" style={{position:'relative',top:0,transform:'none',marginBottom:16}}>{error}</div>}

        <MemberSelector label="Siapa yang Meminjam? (Berutang)" selected={peminjamId} onSelect={setPeminjamId} exclude={pemberiId} />
        <MemberSelector label="Siapa yang Meminjamkan?" selected={pemberiId} onSelect={setPemberiId} exclude={peminjamId} />

        <div className="form-group">
          <label>Jumlah (Rp)</label>
          <input type="number" placeholder="50000" value={jumlah} onChange={e => setJumlah(e.target.value)} inputMode="numeric" />
        </div>
        <div className="form-group">
          <label>Keterangan (Opsional)</label>
          <input type="text" placeholder="Contoh: Bayarin makan siang" value={keterangan} onChange={e => setKeterangan(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Tanggal</label>
          <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} />
        </div>

        <button className="btn btn-primary" disabled={loading} style={{marginTop:8}}>
          {loading ? 'Menyimpan...' : '💰 Catat Transaksi'}
        </button>
        <button type="button" className="btn btn-secondary" style={{marginTop:8}} onClick={() => navigate(-1)}>Batal</button>
      </form>
    </div>
  );
}
