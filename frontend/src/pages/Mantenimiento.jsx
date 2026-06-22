import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { useAuth } from '../context/AuthContext';
import { Wrench, Clock, FileInput, RotateCcw, AlertTriangle, ShieldCheck, Plus, CheckCircle, ExternalLink } from 'lucide-react';

export default function Mantenimiento() {
  const { 
    vehiculos, 
    repuestos, 
    mecanicos, 
    llantas, 
    ordenesServicioTaller, 
    registrarOrdenServicio, 
    actualizarEstadoOS,
    tarjetasManoObra, 
    agregarManoObra,
    detallesSolicitudMaterial, 
    solicitarMaterialesOS,
    autorizacionesServicioExterno, 
    detallesServicioExterno, 
    registrarServicioExterno,
    talleresTerceros,
    instalarLlanta,
    historialFichaControl
  } = useFleet();
  const { canWrite, roleInfo } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState('taller');
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // ==========================================
  // FORM STATES: ORDEN DE SERVICIO (TALLER PROPIO)
  // ==========================================
  const [osVehiculo, setOsVehiculo] = useState(vehiculos[0]?.codigo_vehiculo || '');
  const [osFechaEmision, setOsFechaEmision] = useState(new Date().toISOString().split('T')[0]);
  const [osTipo, setOsTipo] = useState('Preventivo');
  const [osKmEntrada, setOsKmEntrada] = useState('');
  const [osHoraEntrada, setOsHoraEntrada] = useState('08:30');
  const [osFalla, setOsFalla] = useState('');

  // Complete OS states
  const [completeOsId, setCompleteOsId] = useState('');
  const [completeKmSalida, setCompleteKmSalida] = useState('');
  const [completeHoraSalida, setCompleteHoraSalida] = useState('17:00');

  // ==========================================
  // FORM STATES: TARJETA DE MANO DE OBRA
  // ==========================================
  const [moOs, setMoOs] = useState('');
  const [moMecanico, setMoMecanico] = useState(mecanicos[0]?.matricula_mecanico || '');
  const [moFecha, setMoFecha] = useState(new Date().toISOString().split('T')[0]);
  const [moCodServicio, setMoCodServicio] = useState('01 - MOTOR');
  const [moHoraInicio, setMoHoraInicio] = useState('09:00');
  const [moHoraFinal, setMoHoraFinal] = useState('12:00');
  const [moCosto, setMoCosto] = useState('50.00');

  // ==========================================
  // FORM STATES: SOLICITUD DE MATERIALES
  // ==========================================
  const [matOs, setMatOs] = useState('');
  const [matRepuesto, setMatRepuesto] = useState(repuestos[0]?.codigo_repuesto || '');
  const [matCantidad, setMatCantidad] = useState(1);

  // ==========================================
  // FORM STATES: SERVICIO EXTERNO (TALLER TERCEROS)
  // ==========================================
  const [extOs, setExtOs] = useState('');
  const [extTaller, setExtTaller] = useState(talleresTerceros[0]?.id_taller_tercero || 1);
  const [extFecha, setExtFecha] = useState(new Date().toISOString().split('T')[0]);
  const [extKm, setExtKm] = useState('');
  // Item detail builder
  const [extItemDesc, setExtItemDesc] = useState('');
  const [extItemCosto, setExtItemCosto] = useState('');
  const [extItems, setExtItems] = useState([]);

  // ==========================================
  // FORM STATES: ROTACIÓN / CONTROL DE LLANTAS
  // ==========================================
  const [llVehiculo, setLlVehiculo] = useState(vehiculos[0]?.codigo_vehiculo || '');
  const [llLlanta, setLlLlanta] = useState(llantas[0]?.numero_fabrica || '');
  const [llPosicion, setLlPosicion] = useState(1);
  const [llKmInstalacion, setLlKmInstalacion] = useState('');

  // Handlers
  const handleOpenOS = (e) => {
    e.preventDefault();
    if (!canWrite('EDIT_OS')) {
      showMsg('Permiso Denegado: Solo el Jefe de Taller / Mecánico puede abrir órdenes de servicio.', 'error');
      return;
    }
    if (!osVehiculo || !osKmEntrada || !osFalla) {
      showMsg('Por favor completa todos los campos de la orden.', 'error');
      return;
    }

    const nuevaOs = {
      codigo_vehiculo: osVehiculo,
      fecha_emision: osFechaEmision,
      tipo_mantenimiento: osTipo,
      km_entrada: parseFloat(osKmEntrada),
      km_salida: null,
      hora_entrada: osHoraEntrada,
      hora_salida: null,
      descripcion_falla: osFalla
    };

    const res = registrarOrdenServicio(nuevaOs);
    showMsg(`Orden de servicio Taller Propio #${res.numero_os} creada correctamente.`, 'success');
    
    // Reset
    setOsKmEntrada('');
    setOsFalla('');
  };

  const handleCompleteOS = (e) => {
    e.preventDefault();
    if (!canWrite('EDIT_OS')) {
      showMsg('Permiso Denegado: Tu rol no puede completar órdenes de servicio.', 'error');
      return;
    }
    if (!completeOsId || !completeKmSalida) {
      showMsg('Completa la Orden Seleccionada y el Kilometraje de Salida.', 'error');
      return;
    }

    const selectedOSObj = ordenesServicioTaller.find(o => o.numero_os === parseInt(completeOsId));
    if (selectedOSObj && parseFloat(completeKmSalida) < selectedOSObj.km_entrada) {
      showMsg('El kilometraje de salida no puede ser menor al de entrada.', 'error');
      return;
    }

    // Actualiza en el estado
    actualizarEstadoOS(parseInt(completeOsId), 'Completado');
    showMsg(`Orden de servicio Taller Propio #${completeOsId} completada con éxito.`, 'success');
    setCompleteOsId('');
    setCompleteKmSalida('');
  };

  const handleAddManoObra = (e) => {
    e.preventDefault();
    if (!canWrite('EDIT_MANO_OBRA')) {
      showMsg('Permiso Denegado: Solo mecánicos pueden registrar tarjetas de mano de obra.', 'error');
      return;
    }
    if (!moOs || !moCosto) {
      showMsg('Completa todos los campos de la tarjeta de mano de obra.', 'error');
      return;
    }

    agregarManoObra({
      numero_os: parseInt(moOs),
      matricula_mecanico: moMecanico,
      fecha_trabajo: moFecha,
      codigo_servicio_ejecutado: moCodServicio,
      hora_inicio: moHoraInicio,
      hora_final: moHoraFinal,
      costo_mano_obra: parseFloat(moCosto)
    });

    showMsg('Tarjeta de Mano de Obra (MA 122 02 04) registrada con éxito.', 'success');
    setMoCosto('50.00');
  };

  const handleAddMaterial = (e) => {
    e.preventDefault();
    if (!canWrite('EDIT_MANO_OBRA')) {
      showMsg('Permiso Denegado: Solo mecánicos pueden solicitar materiales.', 'error');
      return;
    }
    if (!matOs || !matCantidad) {
      showMsg('Ingresa la Orden de Servicio y la Cantidad.', 'error');
      return;
    }

    solicitarMaterialesOS(matOs, matRepuesto, matCantidad);
    showMsg('Solicitud de materiales (MA 113 01 01) enviada al almacenero.', 'success');
  };

  const handleAddExtItem = () => {
    if (!extItemDesc || !extItemCosto) return;
    setExtItems([...extItems, { descripcion: extItemDesc, costo: extItemCosto }]);
    setExtItemDesc('');
    setExtItemCosto('');
  };

  const handleAddServicioExterno = (e) => {
    e.preventDefault();
    if (!canWrite('EDIT_OS')) {
      showMsg('Permiso Denegado: No tienes autorización para derivar servicios.', 'error');
      return;
    }
    if (!extOs || !extKm || extItems.length === 0) {
      showMsg('Ingresa la OS interna, el KM y añade al menos un ítem al presupuesto.', 'error');
      return;
    }

    const auth = {
      numero_os: parseInt(extOs),
      id_taller_tercero: parseInt(extTaller),
      fecha_emision: extFecha,
      fecha_entrada_taller: extFecha,
      hora_entrada_taller: '09:00',
      km_entrada: parseFloat(extKm),
      fecha_salida_taller: null,
      hora_salida_taller: null,
      km_salida: null,
      nombre_responsable_recepcion: 'Recepcionista Taller',
      fecha_aprobacion: new Date().toISOString().split('T')[0]
    };

    registrarServicioExterno(auth, extItems);
    showMsg('Autorización de Servicio Externo (MA 122 02 02) registrada y enviada.', 'success');

    // Reset
    setExtItems([]);
    setExtKm('');
  };

  const handleInstallLlanta = (e) => {
    e.preventDefault();
    if (!canWrite('EDIT_LLANTAS')) {
      showMsg('Permiso Denegado: Solo personal de mantenimiento puede rotar llantas.', 'error');
      return;
    }
    if (!llVehiculo || !llLlanta || !llKmInstalacion) {
      showMsg('Completa todos los campos para registrar la rotación.', 'error');
      return;
    }

    instalarLlanta(llLlanta, llVehiculo, llPosicion, llKmInstalacion);
    showMsg(`Llanta ${llLlanta} instalada correctamente en la posición ${llPosicion}.`, 'success');
    
    // Reset
    setLlKmInstalacion('');
  };

  const activeOSList = ordenesServicioTaller.filter(o => o.estado === 'En Curso');

  return (
    <div className="space-y-8">
      {/* Header tab switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Mantenimiento Técnico y Taller</h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión del taller propio (MA 122 02 01), control de mano de obra (MA 122 02 04), repuestos, llantas y servicios externos (MA 122 02 02).
          </p>
        </div>

        {/* Tab Sub selectors */}
        <div className="flex flex-wrap bg-slate-900 border border-slate-800 rounded-xl p-1 self-start md:self-auto gap-1">
          <button
            onClick={() => setActiveSubTab('taller')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'taller' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Taller Propio (OS)
          </button>
          <button
            onClick={() => setActiveSubTab('mano_obra')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'mano_obra' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tarjeta Mano de Obra
          </button>
          <button
            onClick={() => setActiveSubTab('materiales')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'materiales' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Materiales (Almacén)
          </button>
          <button
            onClick={() => setActiveSubTab('servicio_externo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'servicio_externo' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Terceros (Serv. Externo)
          </button>
          <button
            onClick={() => setActiveSubTab('llantas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'llantas' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Control de Llantas
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

      {/* RBAC alert */}
      {!canWrite('EDIT_OS') && (
        <div className="bg-slate-900/50 border border-amber-500/20 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <AlertTriangle size={16} />
            <span>ACCESO DE LECTURA LIMITADO</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Tu rol de <strong>{roleInfo.nombre}</strong> no posee permisos de escritura/apertura de órdenes de servicio en el taller. Mostrando registros históricos de solo lectura.
          </p>
        </div>
      )}

      {/* RENDER ACTIVE SUB-TAB FORM & TABLES */}
      {activeSubTab === 'taller' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form: Open OS */}
          {canWrite('EDIT_OS') && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-xs border-b border-slate-800 pb-3">
                <Plus size={16} className="text-blue-500" />
                <span>APERTURA ORDEN DE SERVICIO (MA 122 02 01)</span>
              </div>
              
              <form onSubmit={handleOpenOS} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Seleccionar Vehículo</label>
                  <select 
                    value={osVehiculo} 
                    onChange={(e) => setOsVehiculo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-350 cursor-pointer"
                  >
                    {vehiculos.map(v => (
                      <option key={v.codigo_vehiculo} value={v.codigo_vehiculo}>
                        {v.placa_rodaje} ({v.marca} {v.modelo})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Fecha Emisión</label>
                    <input 
                      type="date" 
                      value={osFechaEmision}
                      onChange={(e) => setOsFechaEmision(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Tipo Mantenimiento</label>
                    <select 
                      value={osTipo}
                      onChange={(e) => setOsTipo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-350 cursor-pointer"
                    >
                      <option value="Preventivo">Preventivo</option>
                      <option value="Correctivo">Correctivo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">KM de Entrada</label>
                    <input 
                      type="number" 
                      value={osKmEntrada}
                      onChange={(e) => setOsKmEntrada(e.target.value)}
                      placeholder="Ej. 120800"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Hora Entrada</label>
                    <input 
                      type="time" 
                      value={osHoraEntrada}
                      onChange={(e) => setOsHoraEntrada(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Descripción de la Falla / Trabajo</label>
                  <textarea 
                    value={osFalla}
                    onChange={(e) => setOsFalla(e.target.value)}
                    placeholder="Detalla los trabajos requeridos..."
                    rows="3"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 outline-none focus:border-blue-500"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Abrir Orden de Trabajo
                </button>
              </form>

              {/* Complete OS Sub-section */}
              {activeOSList.length > 0 && (
                <div className="border-t border-slate-850 pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-slate-200 font-bold text-xs pb-1">
                    <CheckCircle size={16} className="text-emerald-500" />
                    <span>CIERRE / COMPLETADO DE ORDEN</span>
                  </div>
                  <form onSubmit={handleCompleteOS} className="space-y-3">
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">Seleccionar OS Activa</label>
                      <select 
                        value={completeOsId} 
                        onChange={(e) => setCompleteOsId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-350 cursor-pointer"
                      >
                        <option value="">Selecciona...</option>
                        {activeOSList.map(o => {
                          const veh = vehiculos.find(v => v.codigo_vehiculo === o.codigo_vehiculo);
                          return (
                            <option key={o.numero_os} value={o.numero_os}>
                              OS #{o.numero_os} - {veh?.placa_rodaje} ({o.tipo_mantenimiento})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-400 block mb-1 font-semibold">KM de Salida</label>
                        <input 
                          type="number" 
                          value={completeKmSalida}
                          onChange={(e) => setCompleteKmSalida(e.target.value)}
                          placeholder="KM Salida"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1 font-semibold">Hora Salida</label>
                        <input 
                          type="time" 
                          value={completeHoraSalida}
                          onChange={(e) => setCompleteHoraSalida(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 outline-none"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Cerrar y Registrar Salida
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* List: OS history */}
          <div className={`${canWrite('EDIT_OS') ? 'lg:col-span-2' : 'lg:col-span-3'} bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl`}>
            <div className="p-5 border-b border-slate-850">
              <h3 className="text-sm font-bold text-slate-200">Historial de Órdenes de Servicio</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-5 py-3">OS Nº</th>
                    <th className="px-5 py-3">Vehículo / Placa</th>
                    <th className="px-5 py-3">Fecha / Tipo</th>
                    <th className="px-5 py-3">Odómetro Entrada/Salida</th>
                    <th className="px-5 py-3">Falla Reportada</th>
                    <th className="px-5 py-3 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {ordenesServicioTaller.map((o) => {
                    const veh = vehiculos.find(v => v.codigo_vehiculo === o.codigo_vehiculo);
                    return (
                      <tr key={o.numero_os} className="hover:bg-slate-850/35 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-300">#{o.numero_os}</td>
                        <td className="px-5 py-3.5 font-semibold text-slate-200">{veh ? veh.placa_rodaje : 'N/A'}</td>
                        <td className="px-5 py-3.5">
                          <span className="block font-semibold text-slate-300">{o.fecha_emision}</span>
                          <span className="text-[10px] text-slate-500">{o.tipo_mantenimiento}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="block font-bold text-slate-300">{o.km_entrada} km</span>
                          <span className="text-[10px] text-slate-500">Salida: {o.km_salida ? `${o.km_salida} km` : 'Taller'}</span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-450 max-w-[200px] truncate">{o.descripcion_falla}</td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            o.estado === 'Completado' 
                              ? 'bg-emerald-600/10 text-emerald-400' 
                              : 'bg-blue-600/10 text-blue-400'
                          }`}>
                            {o.estado}
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
      )}

      {activeSubTab === 'mano_obra' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form: Add Hand labor */}
          {canWrite('EDIT_MANO_OBRA') ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-xs border-b border-slate-800 pb-3">
                <Clock size={16} className="text-amber-500" />
                <span>REGISTRO TARJETA MANO DE OBRA (MA 122 02 04)</span>
              </div>
              
              <form onSubmit={handleAddManoObra} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Seleccionar OS Activa</label>
                  <select 
                    value={moOs} 
                    onChange={(e) => setMoOs(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-350 cursor-pointer"
                  >
                    <option value="">Selecciona...</option>
                    {activeOSList.map(o => (
                      <option key={o.numero_os} value={o.numero_os}>OS #{o.numero_os} - Vehículo {o.codigo_vehiculo}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Técnico Mecánico</label>
                  <select 
                    value={moMecanico} 
                    onChange={(e) => setMoMecanico(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-350 cursor-pointer"
                  >
                    {mecanicos.map(m => (
                      <option key={m.matricula_mecanico} value={m.matricula_mecanico}>{m.nombre_mecanico}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Fecha Trabajo</label>
                    <input 
                      type="date" 
                      value={moFecha}
                      onChange={(e) => setMoFecha(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Costo Mano Obra ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={moCosto}
                      onChange={(e) => setMoCosto(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Código de Servicio Ejecutado</label>
                  <select 
                    value={moCodServicio}
                    onChange={(e) => setMoCodServicio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-350 cursor-pointer"
                  >
                    <option value="01 - MOTOR">01 - Motor</option>
                    <option value="02 - FRENOS">02 - Frenos</option>
                    <option value="03 - DIRECCION">03 - Dirección</option>
                    <option value="04 - EMBRAGUE">04 - Embrague</option>
                    <option value="08 - ELECTRICA">08 - Eléctrica</option>
                    <option value="15 - RUEDAS/LLANTAS">15 - Ruedas/Llantas</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Hora Inicio</label>
                    <input 
                      type="time" 
                      value={moHoraInicio}
                      onChange={(e) => setMoHoraInicio(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Hora Final</label>
                    <input 
                      type="time" 
                      value={moHoraFinal}
                      onChange={(e) => setMoHoraFinal(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Registrar Mano de Obra
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 text-xs text-slate-400">
              <ShieldCheck size={18} className="text-blue-500 mb-2" />
              Ingresa como Técnico Mecánico para poder registrar horas de trabajo de tarjetas de mano de obra.
            </div>
          )}

          {/* List: Labor cards */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-850">
              <h3 className="text-sm font-bold text-slate-200">Tarjetas de Mano de Obra Cargadas</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">OS Vinculada</th>
                    <th className="px-5 py-3">Mecánico</th>
                    <th className="px-5 py-3">Servicio Ejecutado</th>
                    <th className="px-5 py-3">Horas (Inicio/Fin)</th>
                    <th className="px-5 py-3 text-right">Costo Mano Obra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {tarjetasManoObra.map((mo) => {
                    const mec = mecanicos.find(m => m.matricula_mecanico === mo.matricula_mecanico);
                    return (
                      <tr key={mo.id_mano_obra} className="hover:bg-slate-850/35 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-slate-400">#{mo.id_mano_obra}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-200">OS #{mo.numero_os}</td>
                        <td className="px-5 py-3.5 font-medium text-slate-350">{mec ? mec.nombre_mecanico : mo.matricula_mecanico}</td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-amber-400 font-bold">
                            {mo.codigo_servicio_ejecutado}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="block font-semibold text-slate-300">{mo.fecha_trabajo}</span>
                          <span className="text-[10px] text-slate-500">{mo.hora_inicio} - {mo.hora_final}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-emerald-400">${mo.costo_mano_obra.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'materiales' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Request Material form */}
          {canWrite('EDIT_MANO_OBRA') ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-xs border-b border-slate-800 pb-3">
                <FileInput size={16} className="text-purple-500" />
                <span>SOLICITUD DE MATERIALES (ALMACÉN - MA 113 01 01)</span>
              </div>
              
              <form onSubmit={handleAddMaterial} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Seleccionar OS Activa</label>
                  <select 
                    value={matOs} 
                    onChange={(e) => setMatOs(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-350 cursor-pointer"
                  >
                    <option value="">Selecciona...</option>
                    {activeOSList.map(o => (
                      <option key={o.numero_os} value={o.numero_os}>OS #{o.numero_os} - Vehículo {o.codigo_vehiculo}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Repuesto Requerido</label>
                  <select 
                    value={matRepuesto} 
                    onChange={(e) => setMatRepuesto(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-350 cursor-pointer"
                  >
                    {repuestos.map(r => (
                      <option key={r.codigo_repuesto} value={r.codigo_repuesto}>
                        {r.descripcion} (${r.costo_unitario.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Cantidad Solicitada</label>
                  <input 
                    type="number" 
                    value={matCantidad}
                    onChange={(e) => setMatCantidad(e.target.value)}
                    min="1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300 outline-none focus:border-blue-500"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Enviar Requerimiento
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 text-xs text-slate-400">
              <ShieldCheck size={18} className="text-blue-500 mb-2" />
              Inicia sesión como Técnico Mecánico para poder cargar requerimientos de materiales al almacén.
            </div>
          )}

          {/* Table: Requested materials */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-850 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200">Requerimientos de Repuestos Enviados</h3>
              <span className="text-[10px] text-slate-450 italic">El almacenero debe despachar los items para acumular al costo</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-5 py-3">ID Detalle</th>
                    <th className="px-5 py-3">OS Vinculada</th>
                    <th className="px-5 py-3">Repuesto / Catálogo</th>
                    <th className="px-5 py-3">Cantidad</th>
                    <th className="px-5 py-3">Costo Total</th>
                    <th className="px-5 py-3 text-right">Despacho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {detallesSolicitudMaterial.map((d) => {
                    const rep = repuestos.find(r => r.codigo_repuesto === d.codigo_repuesto);
                    return (
                      <tr key={d.id_detalle} className="hover:bg-slate-850/35 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-slate-400">#{d.id_detalle}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-200">OS #{d.numero_os}</td>
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-slate-350 block">{rep ? rep.descripcion : d.codigo_repuesto}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({d.codigo_repuesto})</span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-300 font-semibold">{d.cantidad} uds</td>
                        <td className="px-5 py-3.5 font-bold text-emerald-400">${d.costo_total_repuesto.toFixed(2)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            d.despachado 
                              ? 'bg-emerald-600/10 text-emerald-400' 
                              : 'bg-amber-600/10 text-amber-400'
                          }`}>
                            {d.despachado ? 'Despachado' : 'Pendiente'}
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
      )}

      {activeSubTab === 'servicio_externo' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* External service form */}
          {canWrite('EDIT_OS') ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-xs border-b border-slate-800 pb-3">
                <ExternalLink size={16} className="text-indigo-500" />
                <span>DERIVAR A TALLER EXTERNO (MA 122 02 02)</span>
              </div>
              
              <form onSubmit={handleAddServicioExterno} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Seleccionar OS Interna</label>
                  <select 
                    value={extOs} 
                    onChange={(e) => setExtOs(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-350 cursor-pointer"
                  >
                    <option value="">Selecciona...</option>
                    {activeOSList.map(o => (
                      <option key={o.numero_os} value={o.numero_os}>OS #{o.numero_os} - Vehículo {o.codigo_vehiculo}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Taller de Terceros Acreditado</label>
                  <select 
                    value={extTaller} 
                    onChange={(e) => setExtTaller(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-350 cursor-pointer"
                  >
                    {talleresTerceros.map(t => (
                      <option key={t.id_taller_tercero} value={t.id_taller_tercero}>{t.nombre_taller}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Fecha Envío</label>
                    <input 
                      type="date" 
                      value={extFecha}
                      onChange={(e) => setExtFecha(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Odómetro Envío (Km)</label>
                    <input 
                      type="number" 
                      value={extKm}
                      onChange={(e) => setExtKm(e.target.value)}
                      placeholder="KM Entrada"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Items Builder */}
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-850 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400">DESGLOSE DE SERVICIOS</div>
                  
                  <div className="grid grid-cols-3 gap-1">
                    <input 
                      type="text" 
                      placeholder="Ej. Rectificar"
                      value={extItemDesc}
                      onChange={(e) => setExtItemDesc(e.target.value)}
                      className="col-span-2 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 text-[10px] outline-none"
                    />
                    <input 
                      type="number" 
                      placeholder="Costo $"
                      value={extItemCosto}
                      onChange={(e) => setExtItemCosto(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 text-[10px] outline-none"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleAddExtItem}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-1 rounded text-[10px] font-bold cursor-pointer"
                  >
                    Añadir Ítem al Presupuesto
                  </button>

                  {/* List of draft items */}
                  {extItems.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-900 max-h-24 overflow-y-auto">
                      {extItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[10px] text-slate-350">
                          <span>• {item.descripcion}</span>
                          <span className="font-bold text-slate-200">${parseFloat(item.costo).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Registrar Envío Externo
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 text-xs text-slate-400">
              <ShieldCheck size={18} className="text-blue-500 mb-2" />
              Inicia sesión como Jefe de Taller para poder derivar trabajos a talleres de terceros.
            </div>
          )}

          {/* List: External services */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-850">
              <h3 className="text-sm font-bold text-slate-200">Autorizaciones de Trabajo Externo Activas</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-5 py-3">Auth Nº</th>
                    <th className="px-5 py-3">OS Origen</th>
                    <th className="px-5 py-3">Taller Externo</th>
                    <th className="px-5 py-3">Servicios Detallados</th>
                    <th className="px-5 py-3 text-right">Presupuesto Aprobado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {autorizacionesServicioExterno.map((auth) => {
                    const tal = talleresTerceros.find(t => t.id_taller_tercero === auth.id_taller_tercero);
                    const items = detallesServicioExterno.filter(d => d.numero_autorizacion === auth.numero_autorizacion);
                    const totalCost = items.reduce((sum, d) => sum + d.valor_presupuestado, 0);

                    return (
                      <tr key={auth.numero_autorizacion} className="hover:bg-slate-850/35 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-indigo-400">#{auth.numero_autorizacion}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-200">OS #{auth.numero_os}</td>
                        <td className="px-5 py-3.5 font-medium text-slate-350">{tal ? tal.nombre_taller : auth.id_taller_tercero}</td>
                        <td className="px-5 py-3.5 text-slate-400">
                          {items.map(i => i.descripcion_servicio).join(', ')}
                        </td>
                        <td className="px-5 py-3.5 text-right font-black text-emerald-400">${totalCost.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                  {autorizacionesServicioExterno.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-5 py-6 text-center text-slate-450 italic">
                        No hay autorizaciones de talleres externos registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'llantas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rotate/install tire form */}
          {canWrite('EDIT_LLANTAS') ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-xs border-b border-slate-800 pb-3">
                <RotateCcw size={16} className="text-amber-500" />
                <span>ROTACIÓN E INSTALACIÓN DE LLANTA</span>
              </div>
              
              <form onSubmit={handleInstallLlanta} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Seleccionar Vehículo</label>
                  <select 
                    value={llVehiculo} 
                    onChange={(e) => setLlVehiculo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-350 cursor-pointer"
                  >
                    {vehiculos.map(v => (
                      <option key={v.codigo_vehiculo} value={v.codigo_vehiculo}>
                        {v.placa_rodaje} ({v.marca} {v.modelo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Llanta Codificada</label>
                  <select 
                    value={llLlanta} 
                    onChange={(e) => setLlLlanta(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-350 cursor-pointer"
                  >
                    {llantas.map(l => (
                      <option key={l.numero_fabrica} value={l.numero_fabrica}>
                        {l.numero_fabrica} - {l.fabricante} ({l.dimension})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Posición de Rueda (Diagrama Físico)</label>
                  <select 
                    value={llPosicion} 
                    onChange={(e) => setLlPosicion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-350 cursor-pointer"
                  >
                    <option value="1">1 - Delantera Izquierda (Lado Chofer)</option>
                    <option value="2">2 - Delantera Derecha</option>
                    <option value="3">3 - Posterior Izquierda Externa</option>
                    <option value="4">4 - Posterior Derecha Externa</option>
                    <option value="5">5 - Posterior Izquierda Interna (Dual)</option>
                    <option value="6">6 - Posterior Derecha Interna (Dual)</option>
                    <option value="7">7 - Llanta de Repuesto</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Kilometraje de Instalación</label>
                  <input 
                    type="number" 
                    value={llKmInstalacion}
                    onChange={(e) => setLlKmInstalacion(e.target.value)}
                    placeholder="Odometer al montar"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300 outline-none focus:border-blue-500"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Registrar Instalación / Montado
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 text-xs text-slate-400">
              <ShieldCheck size={18} className="text-blue-500 mb-2" />
              Inicia sesión como Mecánico para registrar rotación o instalación de neumáticos en chasis.
            </div>
          )}

          {/* Ficha control llantas history */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-850">
              <h3 className="text-sm font-bold text-slate-200">Bitácora Ficha de Control de Llantas</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-5 py-3">Código Llanta</th>
                    <th className="px-5 py-3">Vehículo Montado</th>
                    <th className="px-5 py-3">Posición</th>
                    <th className="px-5 py-3">Fecha / Odómetro Instalado</th>
                    <th className="px-5 py-3">Fecha / Odómetro Retirado</th>
                    <th className="px-5 py-3 text-right">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {historialFichaControl.map((h) => {
                    const veh = vehiculos.find(v => v.codigo_vehiculo === h.codigo_vehiculo);
                    return (
                      <tr key={h.id_historial} className="hover:bg-slate-850/35 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-amber-400">{h.numero_fabrica}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-200">{veh ? veh.placa_rodaje : h.codigo_vehiculo}</td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-850 text-[10px] text-slate-350 font-bold">
                            Pos. {h.posicion_rueda}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="block font-semibold text-slate-300">{h.fecha_instalacion}</span>
                          <span className="text-[10px] text-slate-500">{h.km_instalacion} km</span>
                        </td>
                        <td className="px-5 py-3.5">
                          {h.fecha_retiro ? (
                            <>
                              <span className="block font-semibold text-slate-400">{h.fecha_retiro}</span>
                              <span className="text-[10px] text-slate-550">{h.km_retiro} km</span>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-medium">Activa en rueda</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            !h.fecha_retiro 
                              ? 'bg-emerald-600/10 text-emerald-400' 
                              : 'bg-slate-800 text-slate-500'
                          }`}>
                            {!h.fecha_retiro ? 'Montada' : 'Retirada'}
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
      )}

    </div>
  );
}
