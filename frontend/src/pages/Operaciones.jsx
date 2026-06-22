import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { useAuth } from '../context/AuthContext';
import { Fuel, FileText, CheckSquare, List, PlusCircle, AlertTriangle, ShieldCheck, ClipboardCheck } from 'lucide-react';

export default function Operaciones() {
  const { 
    vehiculos, 
    conductores, 
    servicentros, 
    movimientos, 
    registrarMovimientoDiario, 
    ordenesAbastecimiento, 
    registrarAbastecimiento, 
    aprobarAbastecimiento 
  } = useFleet();
  const { canWrite, currentRole, roleInfo } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState('viajes');
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // ==========================================
  // FORM STATES: VIAJE & CHECKLIST (MA 122 01 01)
  // ==========================================
  const [viajeVehiculo, setViajeVehiculo] = useState(vehiculos[0]?.codigo_vehiculo || '');
  const [viajeConductor, setViajeConductor] = useState(conductores[0]?.matricula_conductor || '');
  const [viajeFecha, setViajeFecha] = useState(new Date().toISOString().split('T')[0]);
  const [viajeHoraSalida, setViajeHoraSalida] = useState('08:00');
  const [viajeHoraLlegada, setViajeHoraLlegada] = useState('17:00');
  const [viajeKmSalida, setViajeKmSalida] = useState('');
  const [viajeKmLlegada, setViajeKmLlegada] = useState('');
  const [viajeDestino, setViajeDestino] = useState('');

  // Checklist states
  const [chkLuces, setChkLuces] = useState(true);
  const [chkFrenos, setChkFrenos] = useState(true);
  const [chkFluidos, setChkFluidos] = useState(true);
  const [chkLlantas, setChkLlantas] = useState(true);
  const [chkDocs, setChkDocs] = useState(true);
  const [chkObs, setChkObs] = useState('');

  // ==========================================
  // FORM STATES: COMBUSTIBLE (MA 122 01 02)
  // ==========================================
  const [combMovimiento, setCombMovimiento] = useState('');
  const [combServicentro, setCombServicentro] = useState(servicentros[0]?.id_servicentro || 1);
  const [combTipo, setCombTipo] = useState('Gasolina 95');
  const [combGalones, setCombGalones] = useState('');
  const [combCosto, setCombCosto] = useState('');
  const [combKm, setCombKm] = useState('');

  // Auto-select first loaded item from database
  React.useEffect(() => {
    if (vehiculos.length > 0 && (!viajeVehiculo || !vehiculos.some(v => v.codigo_vehiculo === viajeVehiculo))) {
      setViajeVehiculo(vehiculos[0].codigo_vehiculo);
    }
  }, [vehiculos, viajeVehiculo]);

  React.useEffect(() => {
    if (conductores.length > 0 && (!viajeConductor || !conductores.some(c => c.matricula_conductor === viajeConductor))) {
      setViajeConductor(conductores[0].matricula_conductor);
    }
  }, [conductores, viajeConductor]);

  React.useEffect(() => {
    if (movimientos.length > 0 && (!combMovimiento || !movimientos.some(m => String(m.id_movimiento) === String(combMovimiento)))) {
      setCombMovimiento(String(movimientos[0].id_movimiento));
    }
  }, [movimientos, combMovimiento]);

  React.useEffect(() => {
    if (servicentros.length > 0 && (!combServicentro || !servicentros.some(s => s.id_servicentro === parseInt(combServicentro)))) {
      setCombServicentro(servicentros[0].id_servicentro);
    }
  }, [servicentros, combServicentro]);

  const handleAddViaje = (e) => {
    e.preventDefault();
    if (!canWrite('EDIT_MOVIMIENTO')) {
      showMsg('Permiso Denegado: Solo Conductores y Operadores pueden registrar viajes.', 'error');
      return;
    }
    if (!viajeVehiculo || !viajeConductor || !viajeKmSalida || !viajeKmLlegada || !viajeDestino) {
      showMsg('Por favor completa todos los campos del viaje.', 'error');
      return;
    }
    const kmOut = parseFloat(viajeKmSalida);
    const kmIn = parseFloat(viajeKmLlegada);
    if (kmIn < kmOut) {
      showMsg('El kilometraje de llegada no puede ser menor al de salida.', 'error');
      return;
    }

    const nuevoViaje = {
      codigo_vehiculo: viajeVehiculo,
      matricula_conductor: viajeConductor,
      fecha_movimiento: viajeFecha,
      hora_salida: viajeHoraSalida,
      hora_llegada: viajeHoraLlegada,
      km_salida: kmOut,
      km_llegada: kmIn,
      destino: viajeDestino,
      checklist: {
        luces: chkLuces,
        frenos: chkFrenos,
        fluidos: chkFluidos,
        llantas: chkLlantas,
        documentos: chkDocs,
        observaciones: chkObs
      }
    };

    registrarMovimientoDiario(nuevoViaje);
    showMsg('Viaje diario y lista de verificación (Checklist) guardados correctamente.', 'success');

    // Reset
    setViajeKmSalida('');
    setViajeKmLlegada('');
    setViajeDestino('');
    setChkObs('');
  };

  const handleAddCombustible = (e) => {
    e.preventDefault();
    if (!canWrite('EDIT_COMBUSTIBLE')) {
      showMsg('Permiso Denegado: Tu rol no puede registrar consumos de combustible.', 'error');
      return;
    }
    if (!combMovimiento || !combGalones || !combCosto || !combKm) {
      showMsg('Por favor completa todos los campos de abastecimiento.', 'error');
      return;
    }

    const nuevoAbast = {
      id_movimiento: parseInt(combMovimiento),
      id_servicentro: parseInt(combServicentro),
      tipo_combustible: combTipo,
      galones_abastecidos: parseFloat(combGalones),
      costo_total: parseFloat(combCosto),
      kilometraje_actual: parseFloat(combKm),
      aprobado: currentRole === 'operator' || currentRole === 'admin' // Auto-aprobado si es admin/operador, pendiente para conductor
    };

    registrarAbastecimiento(nuevoAbast);
    showMsg(
      currentRole === 'driver' 
        ? 'Solicitud de combustible enviada. Pendiente de aprobación por el Operador de Garaje.' 
        : 'Registro de combustible cargado y aprobado con éxito.',
      'success'
    );

    // Reset
    setCombGalones('');
    setCombCosto('');
    setCombKm('');
  };

  return (
    <div className="space-y-8">
      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Registro de Movimiento y Operación</h1>
          <p className="text-xs text-slate-400 mt-1">
            Administración diaria de la bitácora de viajes (MA 122 01 01), listas de verificación de unidades y órdenes de abastecimiento (MA 122 01 02).
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('viajes')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'viajes' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Registrar Viaje y Checklist
          </button>
          <button
            onClick={() => setActiveSubTab('combustible')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'combustible' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Órdenes Combustible
          </button>
          <button
            onClick={() => setActiveSubTab('historial')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'historial' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Historial de Trips
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

      {/* Layout grids depending on sub-tab */}
      {activeSubTab === 'viajes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Bitácora - Anverso */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-xs border-b border-slate-850 pb-3">
              <FileText size={16} className="text-blue-500" />
              <span>MOVIMIENTO DIARIO (ANVERSO - FORM MA 122 01 01)</span>
            </div>

            <form onSubmit={handleAddViaje} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Vehículo de Operación</label>
                  <select 
                    value={viajeVehiculo} 
                    onChange={(e) => setViajeVehiculo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-350 cursor-pointer"
                  >
                    {vehiculos.map(v => (
                      <option key={v.codigo_vehiculo} value={v.codigo_vehiculo}>
                        {v.placa_rodaje} - {v.marca} ({v.modelo})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Conductor Asignado</label>
                  <select 
                    value={viajeConductor} 
                    onChange={(e) => setViajeConductor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-350 cursor-pointer"
                  >
                    {conductores.map(c => (
                      <option key={c.matricula_conductor} value={c.matricula_conductor}>
                        {c.matricula_conductor} - {c.nombre_conductor}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Fecha Mov.</label>
                  <input 
                    type="date" 
                    value={viajeFecha}
                    onChange={(e) => setViajeFecha(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Hora de Salida</label>
                  <input 
                    type="time" 
                    value={viajeHoraSalida}
                    onChange={(e) => setViajeHoraSalida(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Hora de Llegada</label>
                  <input 
                    type="time" 
                    value={viajeHoraLlegada}
                    onChange={(e) => setViajeHoraLlegada(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Kilometraje de Salida</label>
                  <input 
                    type="number" 
                    value={viajeKmSalida}
                    onChange={(e) => setViajeKmSalida(e.target.value)}
                    placeholder="Ej. 120500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Kilometraje de Llegada</label>
                  <input 
                    type="number" 
                    value={viajeKmLlegada}
                    onChange={(e) => setViajeKmLlegada(e.target.value)}
                    placeholder="Ej. 120650"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Ruta / Destino</label>
                <input 
                  type="text" 
                  value={viajeDestino}
                  onChange={(e) => setViajeDestino(e.target.value)}
                  placeholder="Especifica el sector y destino del servicio"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-350 outline-none focus:border-blue-500"
                />
              </div>

              {/* Submit triggers checklist + viaje */}
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg transition-colors mt-4 cursor-pointer text-xs"
              >
                Registrar Movimiento Diario Completo
              </button>
            </form>
          </div>

          {/* Checklist - Reverso */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-xs border-b border-slate-850 pb-3">
              <ClipboardCheck size={16} className="text-emerald-500" />
              <span>LISTA DE CHEQUEO DIARIA (REVERSO)</span>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-[10px] text-slate-400 leading-relaxed">
                El conductor debe verificar el estado mecánico y de seguridad física al inicio y final del viaje. Marca los puntos que estén conformes:
              </p>

              <div className="space-y-2.5 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                <label className="flex items-center gap-3 cursor-pointer text-slate-200 hover:text-slate-100">
                  <input 
                    type="checkbox" 
                    checked={chkLuces} 
                    onChange={(e) => setChkLuces(e.target.checked)} 
                    className="w-4 h-4 bg-slate-900 border-slate-850 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 focus:ring-1"
                  />
                  <span className="font-semibold">Faros Delanteros/Posteriores</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-slate-200 hover:text-slate-100">
                  <input 
                    type="checkbox" 
                    checked={chkFrenos} 
                    onChange={(e) => setChkFrenos(e.target.checked)} 
                    className="w-4 h-4 bg-slate-900 border-slate-850 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 focus:ring-1"
                  />
                  <span className="font-semibold">Nivel & Estado del Freno</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-slate-200 hover:text-slate-100">
                  <input 
                    type="checkbox" 
                    checked={chkFluidos} 
                    onChange={(e) => setChkFluidos(e.target.checked)} 
                    className="w-4 h-4 bg-slate-900 border-slate-850 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 focus:ring-1"
                  />
                  <span className="font-semibold">Fluidos (Aceite Motor/Agua Radiador)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-slate-200 hover:text-slate-100">
                  <input 
                    type="checkbox" 
                    checked={chkLlantas} 
                    onChange={(e) => setChkLlantas(e.target.checked)} 
                    className="w-4 h-4 bg-slate-900 border-slate-850 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 focus:ring-1"
                  />
                  <span className="font-semibold">Presión de Llantas (Inc. Repuesto)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-slate-200 hover:text-slate-100">
                  <input 
                    type="checkbox" 
                    checked={chkDocs} 
                    onChange={(e) => setChkDocs(e.target.checked)} 
                    className="w-4 h-4 bg-slate-900 border-slate-850 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 focus:ring-1"
                  />
                  <span className="font-semibold">Documentos (SOAT/Tarjeta Prop.)</span>
                </label>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Observaciones / Fallas Encontradas</label>
                <textarea
                  value={chkObs}
                  onChange={(e) => setChkObs(e.target.value)}
                  placeholder="Detalla si encontraste focos rotos, rayones, ruidos o fugas para derivar automáticamente al taller..."
                  rows="3"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-350 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'combustible' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Solicitar Combustible */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-xs border-b border-slate-850 pb-3">
              <Fuel size={16} className="text-emerald-500" />
              <span>EMISIÓN DE ORDEN DE ABASTECIMIENTO (MA 122 01 02)</span>
            </div>

            <form onSubmit={handleAddCombustible} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Vincular a Viaje Activo</label>
                <select
                  value={combMovimiento}
                  onChange={(e) => setCombMovimiento(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-350 cursor-pointer"
                >
                  <option value="">Selecciona viaje...</option>
                  {movimientos.map(m => {
                    const veh = vehiculos.find(v => v.codigo_vehiculo === m.codigo_vehiculo);
                    return (
                      <option key={m.id_movimiento} value={m.id_movimiento}>
                        Trip {m.id_movimiento}: {veh?.placa_rodaje} | {m.fecha_movimiento} ({m.destino})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Servicentro</label>
                  <select
                    value={combServicentro}
                    onChange={(e) => setCombServicentro(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-350 cursor-pointer"
                  >
                    {servicentros.map(s => (
                      <option key={s.id_servicentro} value={s.id_servicentro}>{s.nombre_servicentro}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Combustible</label>
                  <select
                    value={combTipo}
                    onChange={(e) => setCombTipo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-350 cursor-pointer"
                  >
                    <option value="Gasolina 95">Gasolina 95</option>
                    <option value="Gasolina 97">Gasolina 97</option>
                    <option value="Diesel B5">Diesel B5</option>
                    <option value="GLP">GLP</option>
                    <option value="GNV">GNV</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Galones</label>
                  <input
                    type="number"
                    step="0.01"
                    value={combGalones}
                    onChange={(e) => setCombGalones(e.target.value)}
                    placeholder="5.5"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-slate-300 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Costo ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={combCosto}
                    onChange={(e) => setCombCosto(e.target.value)}
                    placeholder="13.20"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-slate-300 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">KM Actual</label>
                  <input
                    type="number"
                    value={combKm}
                    onChange={(e) => setCombKm(e.target.value)}
                    placeholder="120510"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-slate-300 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg transition-colors mt-2 cursor-pointer"
              >
                Cargar Combustible
              </button>
            </form>
          </div>

          {/* List de Órdenes a Aprobar / Historial */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            <div className="p-5 border-b border-slate-850">
              <h3 className="text-sm font-bold text-slate-200">Órdenes de Abastecimiento Emitidas</h3>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-5 py-3">Orden Nº</th>
                    <th className="px-5 py-3">Vehículo / Placa</th>
                    <th className="px-5 py-3">Tipo / Insumo</th>
                    <th className="px-5 py-3">Medidas (Gal / Costo)</th>
                    <th className="px-5 py-3">Estado</th>
                    <th className="px-5 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {ordenesAbastecimiento.map((ord) => {
                    const mov = movimientos.find(m => m.id_movimiento === ord.id_movimiento);
                    const veh = vehiculos.find(v => v.codigo_vehiculo === mov?.codigo_vehiculo);
                    return (
                      <tr key={ord.numero_orden} className="hover:bg-slate-850/35 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-300">#{ord.numero_orden}</td>
                        <td className="px-5 py-3.5 font-semibold text-slate-300">
                          {veh ? veh.placa_rodaje : 'N/A'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400">{ord.tipo_combustible}</td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-slate-200 block">{ord.galones_abastecidos} Gal</span>
                          <span className="text-[10px] text-slate-450">${ord.costo_total.toFixed(2)}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            ord.aprobado 
                              ? 'bg-emerald-600/10 text-emerald-400' 
                              : 'bg-amber-600/10 text-amber-400'
                          }`}>
                            {ord.aprobado ? 'Aprobado' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {!ord.aprobado && (roleInfo.id === 'admin' || roleInfo.id === 'operator') ? (
                            <button
                              onClick={() => {
                                aprobarAbastecimiento(ord.numero_orden);
                                showMsg(`Orden de combustible #${ord.numero_orden} aprobada con éxito.`, 'success');
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded text-[10px] transition-colors cursor-pointer"
                            >
                              Aprobar
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500">-</span>
                          )}
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

      {activeSubTab === 'historial' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-850">
            <h3 className="text-sm font-bold text-slate-200">Historial del Movimiento Diario de Vehículos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-5 py-3">Trip ID</th>
                  <th className="px-5 py-3">Vehículo (Código)</th>
                  <th className="px-5 py-3">Conductor</th>
                  <th className="px-5 py-3">Fecha / Rango Horas</th>
                  <th className="px-5 py-3">Odómetro (Km Recorridos)</th>
                  <th className="px-5 py-3">Ruta / Destino</th>
                  <th className="px-5 py-3 text-right">Checklist</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {movimientos.map((m) => {
                  const veh = vehiculos.find(v => v.codigo_vehiculo === m.codigo_vehiculo);
                  const cond = conductores.find(c => c.matricula_conductor === m.matricula_conductor);
                  
                  const isChecklistOk = m.checklist 
                    ? (m.checklist.luces && m.checklist.frenos && m.checklist.fluidos && m.checklist.llantas && m.checklist.documentos)
                    : true;

                  return (
                    <tr key={m.id_movimiento} className="hover:bg-slate-850/35 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-350">#{m.id_movimiento}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-200 block">{veh ? veh.placa_rodaje : 'N/A'}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({m.codigo_vehiculo})</span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-300">{cond ? cond.nombre_conductor : 'N/A'}</td>
                      <td className="px-5 py-3.5">
                        <span className="block font-semibold text-slate-300">{m.fecha_movimiento}</span>
                        <span className="text-[10px] text-slate-500">{m.hora_salida} - {m.hora_llegada}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-200 block">{m.km_llegada - m.km_salida} km</span>
                        <span className="text-[10px] text-slate-500 font-mono">({m.km_salida} &rarr; {m.km_llegada})</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-350 max-w-[200px] truncate">{m.destino}</td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          isChecklistOk 
                            ? 'bg-emerald-600/10 text-emerald-400' 
                            : 'bg-red-600/10 text-red-400'
                        }`}>
                          {isChecklistOk ? 'Aprobado / Conforme' : 'Con Observaciones'}
                        </span>
                        {m.checklist && m.checklist.observaciones && (
                          <div className="text-[9px] text-red-400 mt-1 italic max-w-[150px] truncate ml-auto">
                            "{m.checklist.observaciones}"
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
