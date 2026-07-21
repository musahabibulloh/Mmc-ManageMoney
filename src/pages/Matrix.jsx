import { useMemo } from 'react';
import { useGroup } from '../context/GroupContext';
import { buildMatrix, formatCompactRupiah } from '../utils/balance';

export default function Matrix() {
  const { currentGroup, members, transactions } = useGroup();
  const { matrix, memberNames } = useMemo(() => buildMatrix(transactions, members), [transactions, members]);

  if (!currentGroup) {
    return <div className="page"><div className="empty-state"><div className="icon">📊</div><p>Pilih grup terlebih dahulu di halaman Ringkasan</p></div></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>📊 Tampilan Matriks</h1>
        <p>Baris = peminjam, Kolom = pemberi pinjaman. Hanya transaksi belum lunas.</p>
      </div>

      {memberNames.length === 0 ? (
        <div className="card" style={{textAlign:'center',padding:32}}>
          <div style={{fontSize:40}}>📊</div>
          <p style={{color:'var(--text-secondary)',marginTop:8}}>Belum ada data untuk ditampilkan</p>
        </div>
      ) : (
        <div className="card" style={{padding:0,overflow:'hidden'}}>
          <div className="matrix-wrapper">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th className="corner">↓Pinjam<br/>→Beri</th>
                  {memberNames.map((n, i) => <th key={i} title={n}>{n.length > 6 ? n.substring(0, 6) + '..' : n}</th>)}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, ri) => (
                  <tr key={ri}>
                    <td className="row-header" title={memberNames[ri]}>{memberNames[ri].length > 6 ? memberNames[ri].substring(0, 6) + '..' : memberNames[ri]}</td>
                    {row.map((val, ci) => (
                      <td key={ci} className={ri === ci ? 'diagonal' : val > 0 ? 'has-value' : ''}>
                        {ri === ci ? '—' : val > 0 ? formatCompactRupiah(val) : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="legend" style={{marginTop:12}}>
        <h4>Cara Baca:</h4>
        <p>• Baris = Orang yang <strong style={{color:'var(--danger)'}}>meminjam</strong> (berutang)</p>
        <p>• Kolom = Orang yang <strong style={{color:'var(--success)'}}>meminjamkan</strong> (piutang)</p>
        <p>• Contoh: Baris "DAYAT" kolom "RIDHO" = Rp37.500 → DAYAT berutang ke RIDHO Rp37.500</p>
      </div>
    </div>
  );
}
