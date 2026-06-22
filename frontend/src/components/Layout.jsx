import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Truck,
  MapPin,
  Wrench,
  Layers,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  ChevronDown,
  User,
} from 'lucide-react';

export default function Layout({ children }) {
  const { hasAccess, roleInfo, user, logoutUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard',     label: 'Dashboard Gerencial',   path: '/',             icon: LayoutDashboard },
    { id: 'catastro',      label: 'Catastro e Inventario', path: '/catastro',     icon: Truck           },
    { id: 'operaciones',   label: 'Movimiento y Operación',path: '/operaciones',  icon: MapPin          },
    { id: 'mantenimiento', label: 'Mantenimiento Técnico', path: '/mantenimiento',icon: Wrench          },
    { id: 'almacen',       label: 'Inventario de Almacén', path: '/almacen',      icon: Layers          },
    { id: 'seguridad',     label: 'Seguridad y Roles',     path: '/seguridad',    icon: ShieldCheck     },
  ];

  const allowedMenuItems = menuItems.filter(item => hasAccess(item.id));

  const handleLogout = () => {
    logoutUser();
    navigate('/login', { replace: true });
  };

  const SidebarNav = ({ onClickItem }) => (
    <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
      {allowedMenuItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={onClickItem}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all border ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
              }`
            }
          >
            <Icon size={16} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">

      {/* Sidebar — Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800 bg-slate-950/20">
          <Truck className="text-blue-500 w-6 h-6 animate-pulse" />
          <span className="font-bold text-sm tracking-wider uppercase text-slate-200">Flota Vehicular</span>
        </div>

        <SidebarNav />

        <div className="p-4 border-t border-slate-800 bg-slate-950/30 text-center">
          <div className="text-[10px] text-slate-500 font-medium">SISTEMA ADMINISTRATIVO</div>
          <div className="text-[9px] text-slate-600 mt-0.5">V1.0.0 (MA 122 Series)</div>
        </div>
      </aside>

      {/* Sidebar — Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-64 max-w-xs bg-slate-900 border-r border-slate-800 h-full p-4">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 cursor-pointer">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-8 mt-2 px-2">
              <Truck className="text-blue-500 w-6 h-6" />
              <span className="font-bold text-sm tracking-wider uppercase text-slate-200">Flota Vehicular</span>
            </div>
            <SidebarNav onClickItem={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-6 h-16 bg-slate-900/40 border-b border-slate-800 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 text-slate-400 hover:text-slate-100 md:hidden cursor-pointer">
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-sm font-bold text-slate-200 leading-tight">Flota Vehicular</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Control y Administración de Unidades EPS</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Rol badge */}
            <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full border ${roleInfo?.color}`}>
              <span>{roleInfo?.nombre}</span>
            </div>

            {/* User info + logout */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-[11px] font-bold text-slate-200">{user?.nombre || user?.username || 'Usuario'}</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-wide">{user?.rol || roleInfo?.nombre}</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <User size={13} className="text-blue-400" />
              </div>
              <button
                onClick={handleLogout}
                title="Cerrar Sesión"
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-red-400 hover:text-white hover:bg-red-600 border border-red-500/30 hover:border-red-600 rounded-lg transition-all cursor-pointer"
              >
                <LogOut size={12} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
