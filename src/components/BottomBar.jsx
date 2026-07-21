import { NavLink } from 'react-router-dom';

export default function BottomBar() {
  return (
    <nav className="bottom-bar">
      <NavLink to="/" end className="nav-item">
        <span className="icon">🏠</span>
        <span className="text">Beranda</span>
      </NavLink>
      <NavLink to="/transactions" className="nav-item">
        <span className="icon">📋</span>
        <span className="text">Transaksi</span>
      </NavLink>
      <NavLink to="/matrix" className="nav-item">
        <span className="icon">📊</span>
        <span className="text">Matriks</span>
      </NavLink>
      <NavLink to="/profile" className="nav-item">
        <span className="icon">👤</span>
        <span className="text">Profil</span>
      </NavLink>
    </nav>
  );
}
