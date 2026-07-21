import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';
import { calculatePairBalances, calculateNetBalanceForUser, calculateTotals, formatRupiah } from '../utils/balance';

export default function Home() {
  const { session, profile } = useAuth();
  const { currentGroup, groups, members, transactions, fetchGroups, selectGroup, loading, markMultipleAsPaid, kickMember } = useGroup();
  const userId = session?.user?.id;
  const [selectedDetailUser, setSelectedDetailUser] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);

  useEffect(() => { if (userId) fetchGroups(userId); }, [userId]);
  useEffect(() => { if (!currentGroup && groups.length > 0) selectGroup(groups[0]); }, [groups, currentGroup]);

  const pairBalances = useMemo(() => calculatePairBalances(transactions, members), [transactions, members]);
  const myBalances = useMemo(() => userId ? calculateNetBalanceForUser(pairBalances, userId) : [], [pairBalances, userId]);
  const totals = useMemo(() => calculateTotals(myBalances), [myBalances]);
  const unpaidCount = transactions.filter(t => t.status === 'belum_lunas').length;

  if (loading && groups.length === 0) {
    return <div className="page"><div className="empty-state">Memuat data...</div></div>;
  }

  if (groups.length === 0 && !loading) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="icon">👋</div>
          <h2>Halo, {profile?.nama || 'User'}!</h2>
          <p>Kamu belum bergabung di grup manapun.<br/>Buat grup baru atau gabung dengan kode undangan.</p>
          <Link to="/create-group" className="btn btn-primary" style={{display:'block',textDecoration:'none',marginBottom:12}}>➕ Buat Grup Baru</Link>
          <Link to="/join-group" className="btn btn-secondary" style={{display:'block',textDecoration:'none'}}>🔗 Gabung dengan Kode</Link>
        </div>
      </div>
    );
  }

  function handleGroupSwitch() {
    if (groups.length <= 1) return;
    const name = prompt('Pilih grup (ketik nomor):\n' + groups.map((g, i) => `${i + 1}. ${g.nama}${g.id === currentGroup?.id ? ' ✓' : ''}`).join('\n'));
    const idx = parseInt(name) - 1;
    if (idx >= 0 && idx < groups.length) selectGroup(groups[idx]);
  }

  return (
    <div className="page">
      {/* Group Header */}
      <div className="card group-header" onClick={handleGroupSwitch} style={{cursor: groups.length > 1 ? 'pointer' : 'default'}}>
        <div>
          <div className="greeting">Halo, {profile?.nama || 'User'} 👋</div>
          <div className="group-name">
            {currentGroup?.nama || 'Memuat...'}
            {groups.length > 1 && <span className="switch-hint" style={{marginLeft:8}}>▾ ganti</span>}
          </div>
        </div>
        <div className="member-badge" onClick={(e) => { e.stopPropagation(); setShowMembersModal(true); }} style={{cursor: 'pointer'}}>
          <div className="count">{members.length}</div>
          <div className="label">Anggota</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card" style={{background:'var(--info-bg)'}}>
          <div className="number" style={{color:'var(--info)'}}>{transactions.length}</div>
          <div className="label" style={{color:'var(--info)'}}>Total Transaksi</div>
        </div>
        <div className="stat-card" style={{background: unpaidCount > 0 ? 'var(--warning-bg)' : 'var(--success-bg)'}}>
          <div className="number" style={{color: unpaidCount > 0 ? 'var(--warning)' : 'var(--success)'}}>{unpaidCount}</div>
          <div className="label" style={{color: unpaidCount > 0 ? 'var(--warning)' : 'var(--success)'}}>Belum Lunas</div>
        </div>
      </div>

      {/* Balance Summary */}
      <div className="summary-row">
        <div className="summary-card" style={{background:'var(--danger-bg)'}}>
          <div className="label" style={{color:'var(--danger)'}}>Kamu Berutang</div>
          <div className="amount" style={{color:'var(--danger)'}}>{formatRupiah(totals.totalOwe)}</div>
        </div>
        <div className="summary-card" style={{background:'var(--success-bg)'}}>
          <div className="label" style={{color:'var(--success)'}}>Piutang Kamu</div>
          <div className="amount" style={{color:'var(--success)'}}>{formatRupiah(totals.totalOwed)}</div>
        </div>
      </div>

      <div className="net-card" style={{
        background: totals.net >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
        borderColor: totals.net >= 0 ? 'var(--success)' : 'var(--danger)',
      }}>
        <div className="label" style={{color: totals.net >= 0 ? 'var(--success)' : 'var(--danger)'}}>
          {totals.net >= 0 ? '✨ Net Positif' : '⚠️ Net Negatif'}
        </div>
        <div className="amount" style={{color: totals.net >= 0 ? 'var(--success)' : 'var(--danger)'}}>
          {totals.net >= 0 ? '+' : '-'}{formatRupiah(Math.abs(totals.net))}
        </div>
      </div>

      {/* Detail per Orang */}
      {myBalances.length > 0 && (
        <div className="card detail-section">
          <h3>Detail per Orang <span style={{fontSize:12, fontWeight:'normal', color:'var(--text-tertiary)'}}>(ketuk untuk rincian)</span></h3>
          {myBalances.map(b => (
            <div key={b.userId} className="detail-row" style={{cursor: 'pointer'}} onClick={() => setSelectedDetailUser(b)}>
              <div className="detail-left">
                <div className="detail-avatar" style={{background: b.amount >= 0 ? 'var(--success-gradient)' : 'var(--danger-gradient)'}}>
                  {b.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="detail-name">{b.userName}</div>
                  <div className="detail-desc">{b.amount >= 0 ? 'Berutang ke kamu' : 'Kamu berutang'}</div>
                </div>
              </div>
              <div className="detail-amount" style={{color: b.amount >= 0 ? 'var(--success)' : 'var(--danger)'}}>
                {b.amount >= 0 ? '+' : '-'}{formatRupiah(Math.abs(b.amount))}
              </div>
            </div>
          ))}
        </div>
      )}

      {myBalances.length === 0 && (
        <div className="card" style={{textAlign:'center',padding:32}}>
          <div style={{fontSize:40}}>🎉</div>
          <p style={{color:'var(--text-secondary)',marginTop:8}}>Tidak ada utang-piutang belum lunas</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/add-transaction" className="action-btn"><div className="icon">💸</div><div className="text">Catat Utang</div></Link>
        <Link to="/create-group" className="action-btn"><div className="icon">➕</div><div className="text">Buat Grup</div></Link>
        <Link to="/join-group" className="action-btn"><div className="icon">🔗</div><div className="text">Gabung</div></Link>
      </div>

      {/* Invite */}
      {currentGroup && (
        <div className="invite-card" onClick={() => {
          if (navigator.share) navigator.share({ text: `Gabung grup ${currentGroup.nama} di MMC Money! Kode: ${currentGroup.kode_undangan}` });
          else { navigator.clipboard?.writeText(currentGroup.kode_undangan); alert('Kode disalin: ' + currentGroup.kode_undangan); }
        }}>
          <div className="label">📩 Kode Undangan Grup</div>
          <div className="code">{currentGroup.kode_undangan}</div>
          <div className="hint">Ketuk untuk bagikan / salin</div>
        </div>
      )}

      {/* Modal Detail Perhitungan Mutual */}
      {selectedDetailUser && createPortal(
        <div className="overlay" onClick={() => setSelectedDetailUser(null)}>
          <div className="tx-actions" onClick={e => e.stopPropagation()} style={{padding: '32px 24px'}}>
            <h3 style={{marginBottom: 20, fontSize: 20, fontWeight: 800}}>Rincian dengan {selectedDetailUser.userName}</h3>
            {(() => {
              const iOweThem = transactions
                .filter(t => t.peminjam_id === userId && t.pemberi_pinjaman_id === selectedDetailUser.userId && t.status === 'belum_lunas')
                .reduce((sum, t) => sum + t.jumlah, 0);
              const theyOweMe = transactions
                .filter(t => t.peminjam_id === selectedDetailUser.userId && t.pemberi_pinjaman_id === userId && t.status === 'belum_lunas')
                .reduce((sum, t) => sum + t.jumlah, 0);
              
              const unpaidTxs = transactions.filter(t => t.status === 'belum_lunas' && 
                ((t.peminjam_id === userId && t.pemberi_pinjaman_id === selectedDetailUser.userId) || 
                 (t.peminjam_id === selectedDetailUser.userId && t.pemberi_pinjaman_id === userId)));

              async function handleMarkAllPaid() {
                if (confirm(`Yakin ingin melunaskan SEMUA utang/piutang (${unpaidTxs.length} transaksi) dengan ${selectedDetailUser.userName}?`)) {
                  const txIds = unpaidTxs.map(t => t.id);
                  const res = await markMultipleAsPaid(txIds);
                  if (res.error) alert(res.error);
                  else setSelectedDetailUser(null);
                }
              }

              return (
                <>
                  <div style={{display:'flex', flexDirection:'column', gap: 12, marginBottom: 24}}>
                    <div style={{display:'flex', justifyContent:'space-between', padding: '16px', background: 'var(--bg-dark)', borderRadius: 12, border: '1px solid var(--border)'}}>
                      <span style={{color: 'var(--text-secondary)'}}>Kamu berutang:</span>
                      <strong style={{color: 'var(--danger)'}}>{formatRupiah(iOweThem)}</strong>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', padding: '16px', background: 'var(--bg-dark)', borderRadius: 12, border: '1px solid var(--border)'}}>
                      <span style={{color: 'var(--text-secondary)'}}>{selectedDetailUser.userName} berutang:</span>
                      <strong style={{color: 'var(--success)'}}>{formatRupiah(theyOweMe)}</strong>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', padding: '16px', background: 'var(--bg-panel)', border: '1px solid var(--border-light)', borderRadius: 12}}>
                      <span style={{fontWeight: 700}}>Sisa (Netto):</span>
                      <strong style={{color: selectedDetailUser.amount >= 0 ? 'var(--success)' : 'var(--danger)'}}>
                        {selectedDetailUser.amount >= 0 ? `${selectedDetailUser.userName} bayar ke kamu ` : `Kamu bayar ke ${selectedDetailUser.userName} `}
                        {formatRupiah(Math.abs(selectedDetailUser.amount))}
                      </strong>
                    </div>
                    <p style={{fontSize: 13, color: 'var(--text-tertiary)', marginTop: 8, lineHeight: 1.5}}>
                      *Sistem otomatis mengurangi utang timbal balik (saling potong) sehingga kamu cukup membayar atau menagih selisihnya saja.
                    </p>
                  </div>
                  <button className="btn btn-success" onClick={handleMarkAllPaid} style={{marginBottom: 12, width: '100%'}}>✅ Lunas Semua ({unpaidTxs.length} Transaksi)</button>
                  <button className="btn btn-secondary" onClick={() => setSelectedDetailUser(null)} style={{width: '100%'}}>Tutup</button>
                </>
              );
            })()}
          </div>
        </div>,
        document.body
      )}

      {/* Modal Daftar Anggota & Admin */}
      {showMembersModal && createPortal(
        <div className="overlay" onClick={() => setShowMembersModal(false)}>
          <div className="tx-actions" onClick={e => e.stopPropagation()} style={{padding: '32px 24px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20}}>
              <h3 style={{fontSize: 20, fontWeight: 800}}>Daftar Anggota</h3>
              {currentGroup?.dibuat_oleh === userId && <span style={{fontSize: 12, background: 'var(--primary-bg)', color: 'var(--primary-light)', padding: '4px 8px', borderRadius: 8, fontWeight: 700}}>👑 Admin</span>}
            </div>
            
            <div style={{display:'flex', flexDirection:'column', gap: 12, marginBottom: 24, maxHeight: '50vh', overflowY: 'auto'}}>
              {members.map(m => (
                <div key={m.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding: '16px', background: 'var(--bg-dark)', borderRadius: 12, border: '1px solid var(--border)'}}>
                  <div style={{display:'flex', alignItems:'center', gap: 12}}>
                    <div className="detail-avatar" style={{width: 36, height: 36, fontSize: 16, background: 'var(--surface-hover)'}}>
                      {m.nama.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{fontWeight: 600, color: 'var(--text-primary)'}}>{m.id === userId ? `${m.nama} (Kamu)` : m.nama}</div>
                      {currentGroup?.dibuat_oleh === m.id && <div style={{fontSize: 11, color: 'var(--text-tertiary)'}}>Pembuat Grup</div>}
                    </div>
                  </div>
                  
                  {currentGroup?.dibuat_oleh === userId && m.id !== userId && (
                    <button 
                      onClick={async () => {
                        if (confirm(`Yakin ingin mengeluarkan ${m.nama} dari grup? (Transaksi sebelumnya tidak akan terhapus)`)) {
                          const res = await kickMember(currentGroup.id, m.id);
                          if (res.error) alert(res.error);
                        }
                      }}
                      style={{
                        background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', 
                        padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      Keluarkan
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button className="btn btn-secondary" onClick={() => setShowMembersModal(false)} style={{width: '100%'}}>Tutup</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
