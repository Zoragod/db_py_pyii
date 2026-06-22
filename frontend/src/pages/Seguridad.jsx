import React from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import { Shield, ShieldAlert, Check, X, Users, Key } from 'lucide-react';

export default function Seguridad() {
  const { roleInfo } = useAuth();

  const mockUsers = [
    { usuario: 'jvaldivia', nombre: 'Jorge Valdivia', cargo: 'Jefe de Operaciones de Flota', rol: 'Operador de Flota / Encargado de Garaje' },
    { usuario: 'cflores', nombre: 'Clara Flores', cargo: 'Jefe del Subsistema de Logística', rol: 'Administrador de Flota' },
    { usuario: 'mcastro', nombre: 'Manuel Castro', cargo: 'Jefe de Taller Electromecánico', rol: 'Jefe de Taller / Mecánico' },
    { usuario: 'alopez', nombre: 'Augusto López', cargo: 'Auxiliar de Logística y Suministros', rol: 'Apoyo Administrativo / Almacenero' },
    { usuario: 'jperez', nombre: 'Juan Pérez', cargo: 'Conductor Operario de Distribución', rol: 'Conductor / Chofer' }
  ];

  // Mapeo de permisos por rol para dibujar la matriz de control de accesos
  const permissionMatrix = [
    { modulo: 'Dashboard de KPIs y Reportes', admin: true, operator: true, mechanic: false, warehouse: false, driver: false },
    { modulo: 'Alta, Baja y Edición de Vehículos', admin: true, operator: false, mechanic: false, warehouse: false, driver: false },
    { modulo: 'Asignación de Unidades a Sectores', admin: true, operator: true, mechanic: false, warehouse: false, driver: false },
    { modulo: 'Registro de Movimiento Diario (Bitácora)', admin: true, operator: true, mechanic: false, warehouse: false, driver: true },
    { modulo: 'Chequeo Físico de Unidad (Checklist)', admin: true, operator: true, mechanic: false, warehouse: false, driver: true },
    { modulo: 'Emisión de Órdenes de Combustible', admin: true, operator: true, mechanic: false, warehouse: false, driver: true },
    { modulo: 'Aprobación de Combustible / Servicentros', admin: true, operator: true, mechanic: false, warehouse: false, driver: false },
    { modulo: 'Apertura y Cierre de Órdenes de Servicio', admin: true, operator: false, mechanic: true, warehouse: false, driver: false },
    { modulo: 'Carga de Tarjetas de Mano de Obra', admin: true, operator: false, mechanic: true, warehouse: false, driver: false },
    { modulo: 'Solicitud de Piezas al Almacén', admin: true, operator: false, mechanic: true, warehouse: false, driver: false },
    { modulo: 'Despacho y Control de Insumos', admin: true, operator: false, mechanic: false, warehouse: true, driver: false },
    { modulo: 'Rotación y Ficha de Control de Llantas', admin: true, operator: false, mechanic: true, warehouse: false, driver: false },
    { modulo: 'Cálculo de CKV, IUV y Curva de Reemplazo', admin: true, operator: true, mechanic: false, warehouse: false, driver: false }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-100">Seguridad y Control de Accesos (RBAC)</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configuración de perfiles, matriz de permisos de navegación y asociación de roles a los trabajadores de la EPS.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Users Association (Span 1) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl self-start">
          <div className="p-5 border-b border-slate-850 flex items-center gap-2">
            <Users size={18} className="text-blue-500" />
            <h3 className="text-sm font-bold text-slate-200">Asociación de Perfiles a Trabajadores</h3>
          </div>
          
          <div className="divide-y divide-slate-850">
            {mockUsers.map((user) => (
              <div key={user.usuario} className="p-4 hover:bg-slate-850/20 transition-all text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200">{user.nombre}</span>
                  <span className="font-mono text-[9px] text-slate-500">@{user.usuario}</span>
                </div>
                <div className="text-[10px] text-slate-400">{user.cargo}</div>
                <div className="pt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-750 text-[9px] text-blue-400 font-bold">
                    {user.rol}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Permission Matrix (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Matrix Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-850 flex items-center gap-2">
              <Key size={18} className="text-amber-500" />
              <h3 className="text-sm font-bold text-slate-200">Matriz de Permisos por Rol y Módulo</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-5 py-3.5">Funcionalidad / Operación</th>
                    <th className="px-3 py-3.5 text-center w-16">Admin</th>
                    <th className="px-3 py-3.5 text-center w-16">Operador</th>
                    <th className="px-3 py-3.5 text-center w-16">Mecánico</th>
                    <th className="px-3 py-3.5 text-center w-16">Almacén</th>
                    <th className="px-3 py-3.5 text-center w-16">Conductor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {permissionMatrix.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/25 transition-colors">
                      <td className="px-5 py-3 font-semibold text-slate-300">{row.modulo}</td>
                      <td className="px-3 py-3 text-center">
                        {row.admin ? <Check size={14} className="text-emerald-500 mx-auto" /> : <X size={14} className="text-slate-655 mx-auto" />}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {row.operator ? <Check size={14} className="text-emerald-500 mx-auto" /> : <X size={14} className="text-slate-600 mx-auto" />}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {row.mechanic ? <Check size={14} className="text-emerald-500 mx-auto" /> : <X size={14} className="text-slate-600 mx-auto" />}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {row.warehouse ? <Check size={14} className="text-emerald-500 mx-auto" /> : <X size={14} className="text-slate-600 mx-auto" />}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {row.driver ? <Check size={14} className="text-emerald-500 mx-auto" /> : <X size={14} className="text-slate-600 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
              <Shield size={16} className="text-blue-500" />
              <span>CONTROL DE ACCESO SEGURO (RBAC)</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              El sistema emplea un esquema de <strong>Control de Acceso Basado en Roles (RBAC)</strong>. En esta versión de demostración en React, puedes alternar entre perfiles de usuario utilizando el control selector en la barra superior. Al cambiar de rol, las restricciones de la matriz superior se aplicarán de inmediato en los formularios y menús laterales.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
