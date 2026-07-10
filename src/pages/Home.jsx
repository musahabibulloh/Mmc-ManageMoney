import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';
import { calculatePairBalances, calculateNetBalanceForUser, calculateTotals, formatRupiah } from '../utils/balance';

export default function Home() {
  const { session, profile } = useAuth();
  const { currentGroup, groups, members, transactions, fetchGroups, selectGroup, loading } = useGroup();
  const userId = session?.user?.id;

  useEffect(() => { if (userId) fetchGroups(userId); }, [userId]);
  useEffect(() => { if (!currentGroup && groups.length > 0) selectGroup(groups[0]); }, [groups, currentGroup]);

  const pairBalances = useMemo(() => calculatePairBalances(transactions, members), [transactions, members]);
  const myBalances = useMemo(() => userId ? calculateNetBalanceForUser(pairBalances, userId) : [], [pairBalances, userId]);
  const totals = useMemo(() => calculateTotals(myBalances), [myBalances]);
  const unpaidCount = transactions.filter(t => t.status === 'belum_lunas').length;

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
        <div className="member-badge">
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
        borderColor: totals.net >= 0 ? 'rgba(0,184,148,0.3)' : 'rgba(255,107,107,0.3)',
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
          <h3>Detail per Orang</h3>
          {myBalances.map(b => (
            <div key={b.userId} className="detail-row">
              <div className="detail-left">
                <div className="detail-avatar" style={{background: b.amount >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)'}}>
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
    </div>
  );
}
