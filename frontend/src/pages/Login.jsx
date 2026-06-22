import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { Shield, Truck, Wrench, Layers, User, Lock, AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

const roleConfig = {
  admin: {
    icon: Shield,
    nombre: 'Administrador',
    desc: 'Acceso completo. Catastro, KPIs, configuración.',
    color: 'border-red-500/40 text-red-400',
    bg: 'bg-red-500/10',
    glow: 'hover:shadow-red-500/10 hover:border-red-500/70'
  },
  operator: {
    icon: Truck,
    nombre: 'Operador de Garaje',
    desc: 'Movimientos diarios, combustible y asignaciones.',
    color: 'border-blue-500/40 text-blue-400',
    bg: 'bg-blue-500/10',
    glow: 'hover:shadow-blue-500/10 hover:border-blue-500/70'
  },
  mechanic: {
    icon: Wrench,
    nombre: 'Jefe de Taller',
    desc: 'Órdenes de servicio y mano de obra técnica.',
    color: 'border-amber-500/40 text-amber-400',
    bg: 'bg-amber-500/10',
    glow: 'hover:shadow-amber-500/10 hover:border-amber-500/70'
  },
  warehouse: {
    icon: Layers,
    nombre: 'Almacenero',
    desc: 'Inventario de repuestos e insumos del almacén.',
    color: 'border-purple-500/40 text-purple-400',
    bg: 'bg-purple-500/10',
    glow: 'hover:shadow-purple-500/10 hover:border-purple-500/70'
  },
  driver: {
    icon: User,
    nombre: 'Conductor / Chofer',
    desc: 'Registro de viajes diarios y checklists de unidad.',
    color: 'border-emerald-500/40 text-emerald-400',
    bg: 'bg-emerald-500/10',
    glow: 'hover:shadow-emerald-500/10 hover:border-emerald-500/70'
  }
};

export default function Login() {
  const { loginUser, loading, user } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Ya autenticado: ir al dashboard
  if (user) return <Navigate to="/" replace />;

  const handleSelectRole = (roleKey) => {
    setSelectedRole(roleKey);
    setUsername('');
    setPassword('');
    setError('');
  };

  const handleBack = () => {
    setSelectedRole(null);
    setUsername('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Ingresa usuario y contraseña.');
      return;
    }
    const result = await loginUser(username.trim(), password);
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error || 'Usuario o contraseña incorrectos.');
    }
  };

  const cfg = selectedRole ? roleConfig[selectedRole] : null;
  const Icon = cfg ? cfg.icon : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[480px] h-[480px] bg-purple-600/8 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex p-3.5 bg-blue-600/10 rounded-2xl border border-blue-500/20 text-blue-400 mb-2">
            <Truck size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">SIAFV</h1>
          <p className="text-[11px] text-slate-500">Sistema Administrativo de Flota Vehicular · Manual MA 122</p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl space-y-6">

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-xs text-red-400">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1 — Selección de rol */}
          {!selectedRole ? (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-slate-300">Selecciona tu Perfil de Acceso</p>
                <p className="text-[10px] text-slate-500">Elige tu cargo y luego ingresa tus credenciales.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {Object.entries(roleConfig).map(([key, c]) => {
                  const RoleIcon = c.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectRole(key)}
                      className={`border rounded-2xl p-4 text-left flex flex-col gap-3 transition-all hover:scale-[1.03] hover:shadow-xl cursor-pointer ${c.color} ${c.bg} ${c.glow}`}
                    >
                      <RoleIcon size={18} />
                      <div>
                        <p className="text-[11px] font-bold text-slate-200 leading-tight">{c.nombre}</p>
                        <p className="text-[9px] text-slate-500 mt-1 leading-tight">{c.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* STEP 2 — Formulario de acceso */
            <div className="space-y-5">
              {/* Rol seleccionado */}
              <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${cfg.color} ${cfg.bg}`}>
                <button
                  type="button"
                  onClick={handleBack}
                  className="p-1.5 rounded-lg bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer border border-slate-800 shrink-0"
                >
                  <ArrowLeft size={14} />
                </button>
                <div className={`p-2 rounded-lg border ${cfg.color} ${cfg.bg}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-200">{cfg.nombre}</p>
                  <p className="text-[10px] text-slate-500">Ingresa tus credenciales de acceso</p>
                </div>
                <CheckCircle2 size={16} className={cfg.color.split(' ')[1]} />
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Usuario */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Usuario</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Ingresa tu nombre de usuario"
                      autoFocus
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-100 placeholder-slate-600 focus:border-blue-500/70 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Contraseña */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contraseña</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-100 placeholder-slate-600 focus:border-blue-500/70 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-1 shadow-lg shadow-blue-600/10"
                >
                  {loading ? (
                    <><Loader2 size={14} className="animate-spin" /><span>Autenticando...</span></>
                  ) : (
                    <span>Iniciar Sesión</span>
                  )}
                </button>
              </form>

              {/* Cuentas de demo */}
              <details className="group">
                <summary className="text-[10px] text-slate-500 hover:text-slate-400 cursor-pointer font-semibold select-none list-none text-center">
                  Ver cuentas de demostración ▾
                </summary>
                <div className="mt-3 space-y-1.5 text-[10px]">
                  {[
                    { rol: 'Administrador', u: 'admin', p: 'admin123' },
                    { rol: 'Operador', u: 'operador', p: 'operador123' },
                    { rol: 'Mecánico', u: 'mecanico', p: 'mecanico123' },
                    { rol: 'Almacenero', u: 'almacenero', p: 'almacenero123' },
                    { rol: 'Conductor', u: 'conductor', p: 'conductor123' }
                  ].map(acc => (
                    <button
                      key={acc.u}
                      type="button"
                      onClick={() => { setUsername(acc.u); setPassword(acc.p); }}
                      className="w-full flex items-center justify-between px-3 py-2 bg-slate-950/50 hover:bg-slate-800/50 border border-slate-800 rounded-lg cursor-pointer transition-all text-left"
                    >
                      <span className="text-slate-400 font-semibold">{acc.rol}</span>
                      <span className="font-mono text-slate-500">{acc.u} / {acc.p}</span>
                    </button>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
