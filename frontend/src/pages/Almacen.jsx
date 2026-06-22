import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { useAuth } from '../context/AuthContext';
import { Layers, ShieldCheck, CheckCircle2, PackageCheck, AlertCircle } from 'lucide-react';

export default function Almacen() {
  const { repuestos, detallesSolicitudMaterial, despacharMaterial, ordenesServicioTaller } = useFleet();
  const { roleInfo, currentRole } = useAuth();
  
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const pendingRequests = detallesSolicitudMaterial.filter(d => !d.despachado);
  const dispatchedRequests = detallesSolicitudMaterial.filter(d => d.despachado);

  const canApprove = currentRole === 'warehouse' || currentRole === 'admin';

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-100">Inventario y Solicitudes de Almacén</h1>
        <p className="text-xs text-slate-400 mt-1">
          Control de existencias de repuestos, catálogo de piezas e ingresos/salidas de materiales solicitados por el taller.
        </p>
      </div>

      {/* Messages */}
      {message.text && (
        <div className={`p-4 rounded-xl border text-xs font-medium ${
          message.type === 'success' 
            ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-600/10 border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Catalog (Span 1) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl self-start">
          <div className="p-5 border-b border-slate-850">
            <h3 className="text-sm font-bold text-slate-200">Catálogo de Repuestos y Costos</h3>
          </div>
          <div className="divide-y divide-slate-850">
            {repuestos.map((r) => (
              <div key={r.codigo_repuesto} className="p-4 hover:bg-slate-850/20 transition-all flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-slate-350 block">{r.descripcion}</span>
                  <span className="font-mono text-[10px] text-slate-500">{r.codigo_repuesto}</span>
                </div>
                <div className="font-bold text-emerald-400">
                  ${r.costo_unitario.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Pending Dispatch Requests & History (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pending Material Orders Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
                <Layers size={18} className="text-purple-500" />
                <span>Despacho de Materiales Pendiente (MA 113 01 01)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-bold">
                {pendingRequests.length} pendientes
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-5 py-3">Código Sol.</th>
                    <th className="px-5 py-3">OS Solicitante</th>
                    <th className="px-5 py-3">Insumo Requerido</th>
                    <th className="px-5 py-3">Cantidad</th>
                    <th className="px-5 py-3">Costo Est.</th>
                    <th className="px-5 py-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {pendingRequests.map((req) => {
                    const rep = repuestos.find(r => r.codigo_repuesto === req.codigo_repuesto);
                    return (
                      <tr key={req.id_detalle} className="hover:bg-slate-850/35 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-slate-400">#{req.id_detalle}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-200">OS #{req.numero_os}</td>
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-slate-300 block">{rep ? rep.descripcion : req.codigo_repuesto}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({req.codigo_repuesto})</span>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-350">{req.cantidad} unidades</td>
                        <td className="px-5 py-3.5 font-bold text-slate-200">${req.costo_total_repuesto.toFixed(2)}</td>
                        <td className="px-5 py-3.5 text-right">
                          {canApprove ? (
                            <button
                              onClick={() => {
                                despacharMaterial(req.id_detalle);
                                showMsg(`Repuesto ${rep?.descripcion} despachado. Costo cargado a la OS #${req.numero_os}.`, 'success');
                              }}
                              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1 rounded text-[10px] transition-colors cursor-pointer"
                            >
                              Despachar
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-550 flex items-center gap-1 justify-end">
                              <AlertCircle size={12} /> Requiere Almacenero
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {pendingRequests.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-5 py-8 text-center text-slate-450 italic">
                        No hay solicitudes pendientes de despacho en este momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dispatched History Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-850">
              <h3 className="text-sm font-bold text-slate-200">Historial de Salidas / Insumos Entregados</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-5 py-3">Código Sol.</th>
                    <th className="px-5 py-3">OS Destino</th>
                    <th className="px-5 py-3">Repuesto Entregado</th>
                    <th className="px-5 py-3">Cantidad</th>
                    <th className="px-5 py-3">Costo Final</th>
                    <th className="px-5 py-3 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {dispatchedRequests.map((req) => {
                    const rep = repuestos.find(r => r.codigo_repuesto === req.codigo_repuesto);
                    return (
                      <tr key={req.id_detalle} className="hover:bg-slate-850/35 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-slate-500">#{req.id_detalle}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-350">OS #{req.numero_os}</td>
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-slate-300 block">{rep ? rep.descripcion : req.codigo_repuesto}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({req.codigo_repuesto})</span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400">{req.cantidad} uds</td>
                        <td className="px-5 py-3.5 font-bold text-emerald-400">${req.costo_total_repuesto.toFixed(2)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/10 text-emerald-400 text-[9px] font-bold flex items-center gap-1 w-fit ml-auto">
                            <PackageCheck size={12} /> Entregado
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
