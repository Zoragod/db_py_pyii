import { useState, useEffect } from 'react';
import { getSession, clearSession, type UsuarioInfo } from './api';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Vehiculos } from './components/Vehiculos';
import { Bitacora } from './components/Bitacora';
import { 
  LogOut, 
  LayoutDashboard, 
  Truck, 
  FileText, 
  UserCheck 
} from 'lucide-react';

type Tab = 'dashboard' | 'vehiculos' | 'bitacora';

function App() {
  const [user, setUser] = useState<UsuarioInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  useEffect(() => {
    const session = getSession();
    if (session.token && session.user) {
      setToken(session.token);
      setUser(session.user);
    }
  }, []);

  const handleLoginSuccess = (usuario: UsuarioInfo) => {
    const session = getSession();
    setToken(session.token);
    setUser(usuario);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    clearSession();
    setToken(null);
    setUser(null);
  };

  // Si no está autenticado, renderiza la vista de Login
  if (!token || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar de navegación */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <div style={{
            background: 'var(--color-catastro)',
            color: '#fff',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '18px'
          }}>
            S
          </div>
          <span style={{ fontWeight: '700', fontSize: '18px', letterSpacing: '0.5px' }}>SIAFV Portal</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: '1' }}>
          {/* Dashboard (Todos los roles) */}
          <button 
            onClick={() => setActiveTab('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              background: activeTab === 'dashboard' ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: activeTab === 'dashboard' ? 'var(--color-catastro)' : 'var(--text-secondary)',
              textAlign: 'left',
              fontSize: '14.5px',
              fontWeight: activeTab === 'dashboard' ? '600' : '500'
            }}
          >
            <LayoutDashboard size={18} />
            Dashboard KPIs
          </button>

          {/* Catastro de Vehículos (Todos los roles, Admin puede agregar) */}
          <button 
            onClick={() => setActiveTab('vehiculos')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              background: activeTab === 'vehiculos' ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: activeTab === 'vehiculos' ? 'var(--color-catastro)' : 'var(--text-secondary)',
              textAlign: 'left',
              fontSize: '14.5px',
              fontWeight: activeTab === 'vehiculos' ? '600' : '500'
            }}
          >
            <Truck size={18} />
            Fichas Vehiculares
          </button>

          {/* Bitácora de Viajes / Checklist (Conductores, Operadores, Admins) */}
          <button 
            onClick={() => setActiveTab('bitacora')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              background: activeTab === 'bitacora' ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: activeTab === 'bitacora' ? 'var(--color-catastro)' : 'var(--text-secondary)',
              textAlign: 'left',
              fontSize: '14.5px',
              fontWeight: activeTab === 'bitacora' ? '600' : '500'
            }}
          >
            <FileText size={18} />
            Registrar Bitácora
          </button>
        </nav>

        {/* Footer del Sidebar (Usuario y Logout) */}
        <div style={{ 
          borderTop: '1px solid var(--border-card)', 
          paddingTop: '20px',
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-card)',
              color: 'var(--text-secondary)'
            }}>
              <UserCheck size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.nombre}
              </div>
              <span style={{ 
                fontSize: '10px', 
                background: 'rgba(59,130,246,0.1)', 
                color: 'var(--color-catastro)', 
                padding: '1px 5px', 
                borderRadius: '4px',
                fontWeight: '600'
              }}>
                {user.rol}
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(239, 68, 68, 0.06)',
              color: 'var(--color-costos)',
              border: '1px solid rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: '500'
            }}
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Panel principal de contenido */}
      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'vehiculos' && <Vehiculos userRole={user.rol} />}
        {activeTab === 'bitacora' && <Bitacora />}
      </main>
    </div>
  );
}

export default App;
