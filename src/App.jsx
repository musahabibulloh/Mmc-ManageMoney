import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GroupProvider } from './context/GroupContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Transactions from './pages/Transactions';
import Matrix from './pages/Matrix';
import Profile from './pages/Profile';
import AddTransaction from './pages/AddTransaction';
import CreateGroup from './pages/CreateGroup';
import JoinGroup from './pages/JoinGroup';
import BottomNav from './components/BottomNav';

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Memuat...</p></div>;
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

function AuthRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Memuat...</p></div>;
  if (session) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { session } = useAuth();

  return (
    <div className="app-container">
      <Routes>
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/matrix" element={<ProtectedRoute><Matrix /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/add-transaction" element={<ProtectedRoute><AddTransaction /></ProtectedRoute>} />
        <Route path="/create-group" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
        <Route path="/join-group" element={<ProtectedRoute><JoinGroup /></ProtectedRoute>} />
      </Routes>
      {session && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GroupProvider>
          <AppRoutes />
        </GroupProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
