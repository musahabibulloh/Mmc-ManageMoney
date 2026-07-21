import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';
import { formatRupiah } from '../utils/balance';

export default function Transactions() {
  const { session } = useAuth();
  const { currentGroup, transactions, fetchTransactions, markAsPaid, deleteTransaction } = useGroup();
  const userId = session?.user?.id || '';
  const [filter, setFilter] = useState('semua');
  const [actionTx, setActionTx] = useState(null);

  const filtered = useMemo(() => {
    if (filter === 'semua') return transactions;
    return transactions.filter(t => t.status === filter);
  }, [transactions, filter]);

  if (!currentGroup) {
    return <div className="page"><div className="empty-state"><div className="icon">📋</div><p>Pilih grup terlebih dahulu di halaman Ringkasan</p></div></div>;
  }

  async function handleMarkPaid(id) {
    if (confirm('Tandai transaksi ini sudah lunas?')) {
      await markAsPaid(id); setActionTx(null);
    }
  }

  async function handleDelete(id) {
    if (confirm('Yakin ingin menghapus transaksi ini?')) {
      await deleteTransaction(id); setActionTx(null);
    }
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div className="page">
      <div className="page-header"><h1>📋 Transaksi</h1></div>

      <div className="filter-bar">
        {[['semua','Semua'],['belum_lunas','🔴 Belum Lunas'],['lunas','🟢 Lunas']].map(([key, label]) => (
          <button key={key} className={`filter-chip ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>{label}</button>
        ))}
      </div>

      <p style={{color:'var(--text-tertiary)',fontSize:12,marginBottom:12}}>{filtered.length} transaksi</p>

      {filtered.map(t => {
        const isLunas = t.status === 'lunas';
        const isPeminjam = t.peminjam_id === userId;
        const isPemberi = t.pemberi_pinjaman_id === userId;
        return (
          <div key={t.id} className={`tx-card ${isLunas ? 'lunas' : 'belum'}`} onClick={() => !isLunas && setActionTx(t)}>
            <div className="tx-header">
              <span className={`tx-badge ${isLunas ? 'lunas' : 'belum'}`}>{isLunas ? '✓ Lunas' : '○ Belum Lunas'}</span>
              <span className="tx-date">{formatDate(t.tanggal)}</span>
            </div>
            <div className="tx-body">
              <div className="tx-person">
                <span className="label">Peminjam</span>
                <span className={`name ${isPeminjam ? 'me-borrow' : ''}`}>{isPeminjam ? '🔴 Kamu' : t.peminjam?.nama}</span>
              </div>
              <div className="tx-arrow">↓</div>
              <div className="tx-person">
                <span className="label">Pemberi Pinjaman</span>
                <span className={`name ${isPemberi ? 'me-lend' : ''}`}>{isPemberi ? '🟢 Kamu' : t.pemberi_pinjaman?.nama}</span>
              </div>
            </div>
            <div className="tx-footer">
              <span className="tx-amount">{formatRupiah(t.jumlah)}</span>
              {t.keterangan && <span className="tx-note">📝 {t.keterangan}</span>}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="empty-state"><div className="icon">📭</div><p>{filter === 'semua' ? 'Belum ada transaksi' : 'Tidak ada transaksi ' + (filter === 'lunas' ? 'lunas' : 'belum lunas')}</p></div>
      )}

      {/* Action Sheet */}
      {actionTx && createPortal(
        <>
          <div className="overlay" onClick={() => setActionTx(null)} />
          <div className="tx-actions">
            <button className="btn btn-success" onClick={() => handleMarkPaid(actionTx.id)}>✅ Tandai Lunas</button>
            <button className="btn btn-danger" onClick={() => handleDelete(actionTx.id)}>🗑️ Hapus Transaksi</button>
            <button className="btn btn-secondary" onClick={() => setActionTx(null)}>Batal</button>
          </div>
        </>,
        document.body
      )}

      <Link to="/add-transaction"><button className="fab">+</button></Link>
    </div>
  );
}
