/**
 * Format angka ke Rupiah
 */
export function formatRupiah(amount) {
  const abs = Math.abs(amount);
  return 'Rp' + abs.toLocaleString('id-ID');
}

/**
 * Generate kode undangan unik (6 karakter)
 */
export function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Hitung saldo bersih antara semua pasangan dari transaksi belum lunas
 */
export function calculatePairBalances(transactions, members) {
  const balanceMap = new Map();
  const unpaid = transactions.filter(t => t.status === 'belum_lunas');

  for (const t of unpaid) {
    const key = `${t.peminjam_id}->${t.pemberi_pinjaman_id}`;
    const reverseKey = `${t.pemberi_pinjaman_id}->${t.peminjam_id}`;

    if (balanceMap.has(reverseKey)) {
      const current = balanceMap.get(reverseKey);
      const newVal = current - t.jumlah;
      if (newVal > 0) {
        balanceMap.set(reverseKey, newVal);
      } else if (newVal < 0) {
        balanceMap.delete(reverseKey);
        balanceMap.set(key, Math.abs(newVal));
      } else {
        balanceMap.delete(reverseKey);
      }
    } else {
      const current = balanceMap.get(key) || 0;
      balanceMap.set(key, current + t.jumlah);
    }
  }

  const memberMap = new Map(members.map(m => [m.id, m.nama]));
  const results = [];

  balanceMap.forEach((amount, key) => {
    if (amount === 0) return;
    const [fromId, toId] = key.split('->');
    results.push({
      fromUserId: fromId,
      fromUserName: memberMap.get(fromId) || 'Unknown',
      toUserId: toId,
      toUserName: memberMap.get(toId) || 'Unknown',
      amount,
    });
  });

  return results.sort((a, b) => b.amount - a.amount);
}

/**
 * Hitung ringkasan saldo untuk satu user
 */
export function calculateNetBalanceForUser(pairBalances, userId) {
  const balances = [];
  for (const pb of pairBalances) {
    if (pb.fromUserId === userId) {
      balances.push({ userId: pb.toUserId, userName: pb.toUserName, amount: -pb.amount });
    } else if (pb.toUserId === userId) {
      balances.push({ userId: pb.fromUserId, userName: pb.fromUserName, amount: pb.amount });
    }
  }
  return balances.sort((a, b) => a.amount - b.amount);
}

/**
 * Hitung total utang & piutang
 */
export function calculateTotals(netBalances) {
  let totalOwed = 0;
  let totalOwe = 0;
  for (const nb of netBalances) {
    if (nb.amount > 0) totalOwed += nb.amount;
    else totalOwe += Math.abs(nb.amount);
  }
  return { totalOwed, totalOwe, net: totalOwed - totalOwe };
}

/**
 * Build matrix: baris = peminjam, kolom = pemberi
 */
export function buildMatrix(transactions, members) {
  const memberIds = members.map(m => m.id);
  const memberNames = members.map(m => m.nama);
  const size = members.length;
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));
  const unpaid = transactions.filter(t => t.status === 'belum_lunas');

  for (const t of unpaid) {
    const rowIdx = memberIds.indexOf(t.peminjam_id);
    const colIdx = memberIds.indexOf(t.pemberi_pinjaman_id);
    if (rowIdx !== -1 && colIdx !== -1) {
      matrix[rowIdx][colIdx] += t.jumlah;
    }
  }

  return { matrix, memberNames, memberIds };
}
