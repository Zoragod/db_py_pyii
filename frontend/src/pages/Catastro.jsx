import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Plus, Users, PlusCircle, Link, CheckCircle2 } from 'lucide-react';

export default function Catastro() {
  const { vehiculos, upsertVehiculo, asignarVehiculoASector, conductores, addConductor, sectores } = useFleet();
  const { canWrite, roleInfo } = useAuth();
  
  // Tab Switcher
  const [activeSubTab, setActiveSubTab] = useState('vehiculos');

  // Form States - Vehiculos
  const [vCodigo, setVCodigo] = useState('');
  const [vPlaca, setVPlaca] = useState('');
  const [vMarca, setVMarca] = useState('');
  const [vModelo, setVModelo] = useState('');
  const [vAnio, setVAnio] = useState(new Date().getFullYear());
  const [vCapacidad, setVCapacidad] = useState(0);
  const [vSector, setVSector] = useState(1);
  const [vValorNuevo, setVValorNuevo] = useState(15000);
  const [vVidaUtil, setVVidaUtil] = useState(8);
  const [vValorResidual, setVValorResidual] = useState(1500);
  const [vRendimiento, setVRendimiento] = useState(30);

  // Form States - Conductores
  const [cMatricula, setCMatricula] = useState('');
  const [cNombre, setCNombre] = useState('');
  const [cDocumento, setCDocumento] = useState('');

  // Form States - Asignación
  const [assignVeh, setAssignVeh] = useState(vehiculos[0]?.codigo_vehiculo || '');
  const [assignSec, setAssignSec] = useState(sectores[0]?.id_sector || 1);

  // Auto-select first loaded item from database
  React.useEffect(() => {
    if (vehiculos.length > 0 && (!assignVeh || !vehiculos.some(v => v.codigo_vehiculo === assignVeh))) {
      setAssignVeh(vehiculos[0].codigo_vehiculo);
    }
  }, [vehiculos, assignVeh]);

  React.useEffect(() => {
    if (sectores.length > 0 && (!assignSec || !sectores.some(s => s.id_sector === parseInt(assignSec)))) {
      setAssignSec(sectores[0].id_sector);
    }
  }, [sectores, assignSec]);

  const [message, setMessage] = useState({ text: '', type: '' });

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleAddVehiculo = (e) => {
    e.preventDefault();
    if (!canWrite('EDIT_VEHICULOS')) {
      showMsg('Permiso Denegado: Solo el Administrador de Flota puede modificar el catastro.', 'error');
      return;
    }
    if (vCodigo.length !== 6 || isNaN(vCodigo)) {
      showMsg('El código de vehículo debe ser numérico de 6 dígitos (ej: 971105).', 'error');
      return;
    }
    if (!vPlaca || !vMarca || !vModelo) {
      showMsg('Por favor completa todos los campos del vehículo.', 'error');
      return;
    }

    const nuevoVehiculo = {
      codigo_vehiculo: vCodigo,
      placa_rodaje: vPlaca.toUpperCase(),
      marca: vMarca,
      modelo: vModelo,
      anio_fabricacion: parseInt(vAnio),
      capacidad_carga_kg: parseFloat(vCapacidad),
      id_sector_asignado: parseInt(vSector),
      valor_nuevo: parseFloat(vValorNuevo),
      vida_util_anos: parseInt(vVidaUtil),
      valor_residual: parseFloat(vValorResidual),
      rendimiento_ref_kmpgal: parseFloat(vRendimiento)
    };

    upsertVehiculo(nuevoVehiculo);
    showMsg(`Vehículo ${vPlaca.toUpperCase()} registrado con éxito.`, 'success');
    
    // Reset
    setVCodigo('');
    setVPlaca('');
    setVMarca('');
    setVModelo('');
  };

  const handleAddConductor = (e) => {
    e.preventDefault();
    if (!canWrite('EDIT_VEHICULOS')) {
      showMsg('Permiso Denegado: Solo el Administrador de Flota puede registrar conductores.', 'error');
      return;
    }
    if (!cMatricula || !cNombre || !cDocumento) {
      showMsg('Por favor completa todos los campos del conductor.', 'error');
      return;
    }

    addConductor({
      matricula_conductor: cMatricula.toUpperCase(),
      nombre_conductor: cNombre,
      documento_identidad: cDocumento
    });

    showMsg(`Conductor ${cNombre} registrado con éxito.`, 'success');
    
    // Reset
    setCMatricula('');
    setCNombre('');
    setCDocumento('');
  };

  const handleAssignSector = (e) => {
    e.preventDefault();
    if (!canWrite('EDIT_VEHICULOS')) {
      showMsg('Permiso Denegado: Solo el Administrador de Flota puede asignar sectores.', 'error');
      return;
    }
    if (!assignVeh) return;

    asignarVehiculoASector(assignVeh, assignSec);
    showMsg(`Sector reasignado correctamente al vehículo ${assignVeh}.`, 'success');
  };

  return (
    <div className="space-y-8">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Catastro e Inventario Técnico</h1>
          <p className="text-xs text-slate-400 mt-1">
            Registro, alta y baja de unidades vehiculares, reasignaciones de sectores y padrón de conductores.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('vehiculos')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'vehiculos' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vehículos
          </button>
          <button
            onClick={() => setActiveSubTab('conductores')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'conductores' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Conductores
          </button>
        </div>
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

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: List of Items (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {activeSubTab === 'vehiculos' ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-5 border-b border-slate-850">
                <h3 className="text-sm font-bold text-slate-200">Listado Catastral de Vehículos</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/40 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-5 py-3">Código</th>
                      <th className="px-5 py-3">Placa</th>
                      <th className="px-5 py-3">Clase / Modelo</th>
                      <th className="px-5 py-3">Año</th>
                      <th className="px-5 py-3">Sector Asignado</th>
                      <th className="px-5 py-3 text-right">Rendimiento (KM/G)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {vehiculos.map((v) => {
                      const sec = sectores.find(s => s.id_sector === v.id_sector_asignado);
                      return (
                        <tr key={v.codigo_vehiculo} className="hover:bg-slate-850/35 transition-colors">
                          <td className="px-5 py-3.5 font-mono font-bold text-blue-400">{v.codigo_vehiculo}</td>
                          <td className="px-5 py-3.5 font-bold text-slate-200">{v.placa_rodaje}</td>
                          <td className="px-5 py-3.5">
                            <span className="font-semibold block text-slate-300">{v.marca}</span>
                            <span className="text-[10px] text-slate-500">{v.modelo}</span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-400">{v.anio_fabricacion}</td>
                          <td className="px-5 py-3.5">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-medium">
                              {sec ? sec.nombre_sector : 'Sin Sector'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right font-semibold text-emerald-500">{v.rendimiento_ref_kmpgal}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-5 border-b border-slate-850">
                <h3 className="text-sm font-bold text-slate-200">Conductores y Operarios Habilitados</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/40 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-5 py-3">Matrícula</th>
                      <th className="px-5 py-3">Nombre Completo</th>
                      <th className="px-5 py-3">Nº Documento Identidad (DNI)</th>
                      <th className="px-5 py-3 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {conductores.map((c) => (
                      <tr key={c.matricula_conductor} className="hover:bg-slate-850/35 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-emerald-400">{c.matricula_conductor}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-200">{c.nombre_conductor}</td>
                        <td className="px-5 py-3.5 text-slate-400">{c.documento_identidad}</td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="px-2 py-0.5 rounded bg-emerald-600/10 text-emerald-400 text-[10px] font-bold">
                            Activo
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Forms / Control actions */}
        <div className="space-y-6">
          
          {/* RBAC notice if user has no write access */}
          {!canWrite('EDIT_VEHICULOS') && (
            <div className="bg-slate-900/50 border border-red-500/20 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                <ShieldAlert size={16} />
                <span>ACCESO DE SOLO LECTURA</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Tu rol actual (<strong>{roleInfo.nombre}</strong>) no tiene permisos de administrador para dar de alta vehículos, registrar conductores o modificar el inventario catastral.
              </p>
            </div>
          )}

          {/* Form: Add Vehicle */}
          {activeSubTab === 'vehiculos' && canWrite('EDIT_VEHICULOS') && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-xs border-b border-slate-800 pb-3">
                <PlusCircle size={16} className="text-blue-500" />
                <span>ALTA DE NUEVO VEHÍCULO</span>
              </div>
              
              <form onSubmit={handleAddVehiculo} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-450 block mb-1 font-semibold">Código Patrimonial</label>
                    <input 
                      type="text" 
                      maxLength="6"
                      value={vCodigo}
                      onChange={(e) => setVCodigo(e.target.value)}
                      placeholder="971105"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-250 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-450 block mb-1 font-semibold">Placa de Rodaje</label>
                    <input 
                      type="text" 
                      value={vPlaca}
                      onChange={(e) => setVPlaca(e.target.value)}
                      placeholder="ABC-123"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-250 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-450 block mb-1 font-semibold">Marca</label>
                    <input 
                      type="text" 
                      value={vMarca}
                      onChange={(e) => setVMarca(e.target.value)}
                      placeholder="Chevrolet"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-250 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-450 block mb-1 font-semibold">Clase / Modelo</label>
                    <input 
                      type="text" 
                      value={vModelo}
                      onChange={(e) => setVModelo(e.target.value)}
                      placeholder="Sedan"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-250 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-slate-450 block mb-1 font-semibold">Año Fab.</label>
                    <input 
                      type="number" 
                      value={vAnio}
                      onChange={(e) => setVAnio(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-250 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-450 block mb-1 font-semibold">Cap. Carga (kg)</label>
                    <input 
                      type="number" 
                      value={vCapacidad}
                      onChange={(e) => setVCapacidad(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-250 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-450 block mb-1 font-semibold">Rend. (km/gl)</label>
                    <input 
                      type="number" 
                      value={vRendimiento}
                      onChange={(e) => setVRendimiento(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-250 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-850 my-2 pt-2 grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-slate-450 block mb-1 font-semibold">Valor Adq. ($)</label>
                    <input 
                      type="number" 
                      value={vValorNuevo}
                      onChange={(e) => setVValorNuevo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-250 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-450 block mb-1 font-semibold">Vida Útil (Años)</label>
                    <input 
                      type="number" 
                      value={vVidaUtil}
                      onChange={(e) => setVVidaUtil(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-250 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-450 block mb-1 font-semibold">Valor Resid. ($)</label>
                    <input 
                      type="number" 
                      value={vValorResidual}
                      onChange={(e) => setVValorResidual(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-250 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-450 block mb-1 font-semibold">Sector de Asignación Inicial</label>
                  <select 
                    value={vSector} 
                    onChange={(e) => setVSector(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-350 cursor-pointer"
                  >
                    {sectores.map(s => (
                      <option key={s.id_sector} value={s.id_sector}>{s.nombre_sector}</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-colors mt-2 cursor-pointer"
                >
                  Registrar Vehículo (Alta)
                </button>
              </form>
            </div>
          )}

          {/* Form: Add Driver */}
          {activeSubTab === 'conductores' && canWrite('EDIT_VEHICULOS') && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-xs border-b border-slate-800 pb-3">
                <Users size={16} className="text-emerald-500" />
                <span>REGISTRAR CONDUCTOR HABILITADO</span>
              </div>
              
              <form onSubmit={handleAddConductor} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-450 block mb-1 font-semibold">Código Matrícula</label>
                  <input 
                    type="text" 
                    value={cMatricula}
                    onChange={(e) => setCMatricula(e.target.value)}
                    placeholder="C005"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-250 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-450 block mb-1 font-semibold">Nombre Completo</label>
                  <input 
                    type="text" 
                    value={cNombre}
                    onChange={(e) => setCNombre(e.target.value)}
                    placeholder="Escriba el nombre"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-250 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-450 block mb-1 font-semibold">Documento de Identidad (DNI)</label>
                  <input 
                    type="text" 
                    value={cDocumento}
                    onChange={(e) => setCDocumento(e.target.value)}
                    placeholder="DNI del operario"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-250 outline-none focus:border-blue-500"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Registrar Conductor
                </button>
              </form>
            </div>
          )}

          {/* Form: Re-assign Vehicle Sector */}
          {canWrite('EDIT_VEHICULOS') && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-xs border-b border-slate-800 pb-3">
                <Link size={16} className="text-indigo-500" />
                <span>REASIGNACIÓN DE SECTOR / USO COMÚN</span>
              </div>
              
              <form onSubmit={handleAssignSector} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-450 block mb-1 font-semibold">Seleccionar Vehículo</label>
                  <select 
                    value={assignVeh} 
                    onChange={(e) => setAssignVeh(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-350 cursor-pointer"
                  >
                    <option value="">Seleccione vehículo...</option>
                    {vehiculos.map(v => (
                      <option key={v.codigo_vehiculo} value={v.codigo_vehiculo}>
                        {v.placa_rodaje} ({v.marca} {v.modelo})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-450 block mb-1 font-semibold">Nuevo Sector Destino</label>
                  <select 
                    value={assignSec} 
                    onChange={(e) => setAssignSec(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-350 cursor-pointer"
                  >
                    {sectores.map(s => (
                      <option key={s.id_sector} value={s.id_sector}>{s.nombre_sector}</option>
                    ))}
                  </select>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Confirmar Asignación
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
