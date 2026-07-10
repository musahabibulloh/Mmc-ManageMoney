import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end>
        <span className="nav-icon">🏠</span>
        <span>Ringkasan</span>
      </NavLink>
      <NavLink to="/transactions">
        <span className="nav-icon">📋</span>
        <span>Transaksi</span>
      </NavLink>
      <NavLink to="/matrix">
        <span className="nav-icon">📊</span>
        <span>Matriks</span>
      </NavLink>
      <NavLink to="/profile">
        <span className="nav-icon">👤</span>
        <span>Profil</span>
      </NavLink>
    </nav>
  );
}
