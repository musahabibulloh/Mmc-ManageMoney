import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';

export default function Profile() {
  const { profile, signOut, updateProfile } = useAuth();
  const { currentGroup, members, groups } = useGroup();
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(profile?.nama || '');

  async function handleSave() {
    if (!newName.trim()) return;
    const result = await updateProfile(newName.trim());
    if (result.error) alert(result.error);
    else setEditing(false);
  }

  return (
    <div className="page">
      <div className="card" style={{textAlign:'center'}}>
        <div className="profile-avatar">{profile?.nama?.charAt(0)?.toUpperCase() || '?'}</div>
        {editing ? (
          <div style={{display:'flex',gap:8,justifyContent:'center',alignItems:'center'}}>
            <input style={{background:'var(--surface-elevated)',border:'1px solid var(--primary)',borderRadius:8,padding:10,color:'var(--text)',fontSize:16,flex:1,fontFamily:'inherit'}}
              value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
            <button className="btn btn-primary" style={{width:'auto',padding:'10px 16px'}} onClick={handleSave}>✓</button>
          </div>
        ) : (
          <div onClick={() => { setNewName(profile?.nama || ''); setEditing(true); }} style={{cursor:'pointer'}}>
            <div className="profile-name">{profile?.nama || 'User'}</div>
            <p style={{fontSize:11,color:'var(--text-tertiary)',marginTop:2}}>Ketuk untuk edit nama</p>
          </div>
        )}
        <div className="profile-email">{profile?.email}</div>
      </div>

      <div className="card">
        <h3 style={{fontSize:16,fontWeight:700,marginBottom:12}}>Grup Saya ({groups.length})</h3>
        {groups.map(g => (
          <div key={g.id} className="group-item">
            <div className="name">{g.nama}</div>
            <div className="code">Kode: {g.kode_undangan}</div>
          </div>
        ))}
        {groups.length === 0 && <p style={{color:'var(--text-tertiary)',fontSize:13}}>Belum ada grup</p>}
      </div>

      {currentGroup && (
        <div className="card">
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:12}}>Anggota: {currentGroup.nama}</h3>
          {members.map(m => (
            <div key={m.id} className="member-item">
              <div className="avatar">{m.nama.charAt(0).toUpperCase()}</div>
              <div>
                <div className="name">{m.nama}</div>
                <div className="email">{m.email}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="btn btn-danger" onClick={() => { if (confirm('Yakin ingin keluar?')) signOut(); }}>
        🚪 Keluar
      </button>
    </div>
  );
}
