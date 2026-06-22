import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FleetProvider } from './context/FleetContext';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Catastro from './pages/Catastro';
import Operaciones from './pages/Operaciones';
import Mantenimiento from './pages/Mantenimiento';
import Almacen from './pages/Almacen';
import Seguridad from './pages/Seguridad';

// PrivateRoute: redirige al login si no hay sesión activa
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/catastro" element={<Catastro />} />
                <Route path="/operaciones" element={<Operaciones />} />
                <Route path="/mantenimiento" element={<Mantenimiento />} />
                <Route path="/almacen" element={<Almacen />} />
                <Route path="/seguridad" element={<Seguridad />} />
                <Route path="*" element={<div className="text-center py-12 text-slate-400 text-xs">Página no encontrada.</div>} />
              </Routes>
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FleetProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </FleetProvider>
    </AuthProvider>
  );
}
