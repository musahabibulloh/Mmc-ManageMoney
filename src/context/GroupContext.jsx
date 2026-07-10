import { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { generateInviteCode } from '../utils/balance';

const GroupContext = createContext(null);

export function GroupProvider({ children }) {
  const [currentGroup, setCurrentGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGroups = useCallback(async (userId) => {
    setLoading(true);
    const { data: memberData } = await supabase.from('group_members').select('group_id').eq('user_id', userId);
    if (!memberData || memberData.length === 0) { setGroups([]); setLoading(false); return; }
    const groupIds = memberData.map(m => m.group_id);
    const { data } = await supabase.from('groups').select('*').in('id', groupIds).order('created_at', { ascending: false });
    setGroups(data || []);
    setLoading(false);
  }, []);

  const createGroup = useCallback(async (nama, userId) => {
    const kode = generateInviteCode();
    const { data, error } = await supabase.from('groups').insert({ nama, kode_undangan: kode, dibuat_oleh: userId }).select().single();
    if (error) return { error: error.message };
    await supabase.from('group_members').insert({ group_id: data.id, user_id: userId });
    setGroups(prev => [data, ...prev]);
    return { group: data };
  }, []);

  const joinGroup = useCallback(async (kodeUndangan, userId) => {
    const { data: group, error } = await supabase.from('groups').select('*').eq('kode_undangan', kodeUndangan.toUpperCase().trim()).single();
    if (error || !group) return { error: 'Kode undangan tidak ditemukan' };
    const { data: existing } = await supabase.from('group_members').select('id').eq('group_id', group.id).eq('user_id', userId).single();
    if (existing) return { error: 'Kamu sudah bergabung di grup ini' };
    const { error: joinErr } = await supabase.from('group_members').insert({ group_id: group.id, user_id: userId });
    if (joinErr) return { error: joinErr.message };
    setGroups(prev => [group, ...prev]);
    return {};
  }, []);

  const selectGroup = useCallback(async (group) => {
    setCurrentGroup(group);
    await Promise.all([fetchMembers(group.id), fetchTransactions(group.id)]);
  }, []);

  async function fetchMembers(groupId) {
    const { data } = await supabase.from('group_members').select('*, profiles(*)').eq('group_id', groupId);
    if (data) setMembers(data.map(gm => gm.profiles).filter(Boolean));
  }

  async function fetchTransactions(groupId) {
    const { data } = await supabase.from('transactions')
      .select('*, peminjam:profiles!transactions_peminjam_id_fkey(*), pemberi_pinjaman:profiles!transactions_pemberi_pinjaman_id_fkey(*)')
      .eq('group_id', groupId).order('tanggal', { ascending: false });
    if (data) setTransactions(data);
  }

  const addTransaction = useCallback(async (txData) => {
    const { error } = await supabase.from('transactions').insert({ ...txData, status: 'belum_lunas' });
    if (error) return { error: error.message };
    await fetchTransactions(txData.group_id);
    return {};
  }, []);

  const markAsPaid = useCallback(async (id) => {
    const { error } = await supabase.from('transactions').update({ status: 'lunas' }).eq('id', id);
    if (error) return { error: error.message };
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'lunas' } : t));
    return {};
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) return { error: error.message };
    setTransactions(prev => prev.filter(t => t.id !== id));
    return {};
  }, []);

  return (
    <GroupContext.Provider value={{
      currentGroup, groups, members, transactions, loading,
      fetchGroups, createGroup, joinGroup, selectGroup,
      addTransaction, markAsPaid, deleteTransaction,
      fetchMembers, fetchTransactions,
    }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error('useGroup must be used within GroupProvider');
  return ctx;
}
