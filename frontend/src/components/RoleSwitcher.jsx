import React, { useState } from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import { ShieldAlert, ChevronDown, Check } from 'lucide-react';

export default function RoleSwitcher() {
  const { currentRole, changeRole, roleInfo } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 hover:bg-slate-850 hover:border-slate-700 transition-all text-xs font-semibold text-slate-200 cursor-pointer"
      >
        <span className={`w-2 h-2 rounded-full ${roleInfo.id === 'admin' ? 'bg-red-500' : roleInfo.id === 'operator' ? 'bg-blue-500' : roleInfo.id === 'mechanic' ? 'bg-amber-500' : roleInfo.id === 'warehouse' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
        <span>Rol: {roleInfo.nombre}</span>
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="p-3 border-b border-slate-800 bg-slate-950/40">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <ShieldAlert size={14} className="text-blue-400" />
                <span>SIMULADOR DE ROLES (RBAC)</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Cambia de rol para probar los permisos y ver cómo se adaptan la barra lateral y los controles.
              </p>
            </div>
            <div className="py-1">
              {Object.values(ROLES).map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    changeRole(role.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start justify-between px-3 py-2 text-left hover:bg-slate-850 transition-all cursor-pointer ${
                    currentRole === role.id ? 'bg-slate-850/50' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">{role.nombre}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 max-w-[200px] leading-tight">
                      {role.descripcion}
                    </span>
                  </div>
                  {currentRole === role.id && (
                    <Check size={14} className="text-blue-500 mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
