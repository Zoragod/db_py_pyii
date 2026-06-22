// ponytail: en producción define VITE_API_URL en tu hosting; en local usa el fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getHeaders() {
  const token = localStorage.getItem('fv_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function login(username, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Credenciales inválidas');
  }
  return res.json();
}

export async function fetchSectores() {
  const res = await fetch(`${API_URL}/sectores`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener sectores');
  const data = await res.json();
  return data.map(s => ({
    id_sector: s.idSector,
    nombre_sector: s.nombreSector,
    localidad: s.localidad
  }));
}

export async function fetchVehiculos() {
  const res = await fetch(`${API_URL}/vehiculos`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener vehículos');
  const data = await res.json();
  return data.map(v => ({
    codigo_vehiculo: v.codigoVehiculo,
    placa_rodaje: v.placaRodaje,
    marca: v.marca,
    modelo: v.modelo,
    anio_fabricacion: v.anoFabricacion,
    capacidad_carga_kg: Number(v.capacidadCargaKg),
    id_sector_asignado: v.idSectorAsignado,
    valor_nuevo: v.valorAdquisicion ? Number(v.valorAdquisicion) : 0,
    vida_util_anos: v.vidaUtilAnos || 8,
    valor_residual: v.valorResidual ? Number(v.valorResidual) : 0,
    rendimiento_ref_kmpgal: 30
  }));
}

export async function saveVehiculo(v) {
  const body = {
    codigoVehiculo: v.codigo_vehiculo,
    placaRodaje: v.placa_rodaje,
    marca: v.marca,
    modelo: v.modelo,
    anoFabricacion: parseInt(v.anio_fabricacion),
    capacidadCargaKg: parseFloat(v.capacidad_carga_kg),
    idSectorAsignado: parseInt(v.id_sector_asignado),
    valorAdquisicion: parseFloat(v.valor_nuevo),
    valorResidual: parseFloat(v.valor_residual),
    vidaUtilAnos: parseInt(v.vida_util_anos)
  };
  const res = await fetch(`${API_URL}/vehiculos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al guardar vehículo');
  }
  return res.json();
}

export async function fetchConductores() {
  const res = await fetch(`${API_URL}/conductores`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener conductores');
  const data = await res.json();
  return data.map(c => ({
    matricula_conductor: c.matriculaConductor,
    nombre_conductor: c.nombreConductor,
    documento_identidad: c.documentoIdentidad
  }));
}

export async function saveConductor(c) {
  const body = {
    matriculaConductor: c.matricula_conductor,
    nombreConductor: c.nombre_conductor,
    documentoIdentidad: c.documento_identidad
  };
  const res = await fetch(`${API_URL}/conductores`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al guardar conductor');
  }
  return res.json();
}

export async function fetchMovimientos() {
  const res = await fetch(`${API_URL}/movimientos`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener movimientos');
  const data = await res.json();
  return data.map(m => ({
    id_movimiento: m.idMovimiento,
    codigo_vehiculo: m.codigoVehiculo,
    matricula_conductor: m.matriculaConductor,
    fecha_movimiento: m.fechaMovimiento.split('T')[0],
    hora_salida: m.horaSalida ? new Date(m.horaSalida).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false }) : '08:00',
    hora_llegada: m.horaLlegada ? new Date(m.horaLlegada).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false }) : '17:00',
    km_salida: Number(m.kmSalida),
    km_llegada: m.kmLlegada ? Number(m.kmLlegada) : 0,
    destino: m.destino,
    checklist: {
      luces: m.chkLuces,
      frenos: m.chkFrenos,
      fluidos: m.chkFluidos,
      llantas: m.chkLlantas,
      documentos: m.chkDocumentos,
      observaciones: m.checklistObservaciones || ''
    }
  }));
}

export async function saveMovimiento(m) {
  const body = {
    codigoVehiculo: m.codigo_vehiculo,
    matriculaConductor: m.matricula_conductor,
    fechaMovimiento: m.fecha_movimiento,
    horaSalida: new Date(`${m.fecha_movimiento}T${m.hora_salida}:00`),
    horaLlegada: m.hora_llegada ? new Date(`${m.fecha_movimiento}T${m.hora_llegada}:00`) : null,
    kmSalida: parseFloat(m.km_salida),
    kmLlegada: m.km_llegada ? parseFloat(m.km_llegada) : null,
    destino: m.destino,
    chkLuces: m.checklist.luces,
    chkFrenos: m.checklist.frenos,
    chkFluidos: m.checklist.fluidos,
    chkLlantas: m.checklist.llantas,
    chkDocumentos: m.checklist.documentos,
    checklistObservaciones: m.checklist.observaciones
  };
  const res = await fetch(`${API_URL}/movimientos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al registrar viaje');
  }
  return res.json();
}

export async function fetchAbastecimientos() {
  const res = await fetch(`${API_URL}/abastecimientos`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener abastecimientos');
  const data = await res.json();
  return data.map(o => ({
    numero_orden: o.numeroOrden,
    id_movimiento: o.idMovimiento,
    id_servicentro: o.idServicentro,
    tipo_combustible: o.tipoCombustible,
    galones_abastecidos: Number(o.galonesAbastecidos),
    kilometraje_actual: Number(o.kilometrajeActual),
    costo_total: Number(o.galonesAbastecidos) * 16.50,
    aprobado: true
  }));
}

export async function saveAbastecimiento(a) {
  const body = {
    idMovimiento: parseInt(a.id_movimiento),
    idServicentro: parseInt(a.id_servicentro),
    tipoCombustible: a.tipo_combustible,
    galonesAbastecidos: parseFloat(a.galones_abastecidos),
    kilometrajeActual: parseFloat(a.kilometraje_actual)
  };
  const res = await fetch(`${API_URL}/abastecimientos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al registrar combustible');
  }
  return res.json();
}

export async function fetchKpis(codigoVehiculo, mes, anio) {
  const res = await fetch(`${API_URL}/kpis/${codigoVehiculo}/${mes}/${anio}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener KPIs');
  return res.json();
}

export async function fetchMecanicos() {
  const res = await fetch(`${API_URL}/mecanicos`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener mecánicos');
  const data = await res.json();
  return data.map(m => ({
    matricula_mecanico: m.matriculaMecanico,
    nombre_mecanico: m.nombreMecanico
  }));
}

export async function fetchServicentros() {
  const res = await fetch(`${API_URL}/servicentros`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener servicentros');
  const data = await res.json();
  return data.map(s => ({
    id_servicentro: s.idServicentro,
    nombre_servicentro: s.nombreServicentro
  }));
}

export async function fetchRepuestos() {
  const res = await fetch(`${API_URL}/repuestos`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener repuestos');
  const data = await res.json();
  return data.map(r => ({
    codigo_repuesto: r.codigoRepuesto,
    descripcion: r.descripcion,
    costo_unitario: Number(r.costoUnitario)
  }));
}

export async function fetchLlantas() {
  const res = await fetch(`${API_URL}/llantas`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener llantas');
  const data = await res.json();
  return data.map(ll => ({
    numero_fabrica: ll.numeroFabrica,
    fabricante: ll.fabricante,
    dimension: ll.dimension,
    modelo: ll.modelo,
    tipo_elemento: ll.tipoElemento
  }));
}

export async function fetchHistorialLlantas() {
  const res = await fetch(`${API_URL}/historial-llantas`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener historial de llantas');
  const data = await res.json();
  return data.map(h => ({
    id_historial: h.idHistorial,
    numero_fabrica: h.numeroFabrica,
    codigo_vehiculo: h.codigoVehiculo,
    fecha_instalacion: h.fechaInstalacion.split('T')[0],
    fecha_retiro: h.fechaRetiro ? h.fechaRetiro.split('T')[0] : null,
    km_instalacion: Number(h.kmInstalacion),
    km_retiro: h.kmRetiro ? Number(h.kmRetiro) : null,
    posicion_rueda: h.posicionRueda
  }));
}

export async function saveHistorialLlanta(h) {
  const body = {
    numeroFabrica: h.numero_fabrica,
    codigoVehiculo: h.codigo_vehiculo,
    fechaInstalacion: new Date(h.fecha_instalacion),
    kmInstalacion: parseFloat(h.km_instalacion),
    posicionRueda: String(h.posicion_rueda)
  };
  const res = await fetch(`${API_URL}/historial-llantas`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  return res.json();
}

export async function fetchOrdenesServicio() {
  const res = await fetch(`${API_URL}/ordenes-servicio`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener órdenes de servicio');
  const data = await res.json();
  return data.map(os => ({
    numero_os: os.numeroOs,
    codigo_vehiculo: os.codigoVehiculo,
    fecha_emision: os.fechaEmision.split('T')[0],
    tipo_mantenimiento: os.tipoMantenimiento,
    km_entrada: Number(os.kmEntrada),
    km_salida: os.kmSalida ? Number(os.kmSalida) : 0,
    hora_entrada: '08:30',
    hora_salida: '14:30',
    estado: os.kmSalida ? 'Completado' : 'En Curso',
    descripcion_falla: 'Mantenimiento preventivo / correctivo de unidad.'
  }));
}

export async function saveOrdenServicio(os) {
  const body = {
    codigoVehiculo: os.codigo_vehiculo,
    fechaEmision: new Date(os.fecha_emision),
    tipoMantenimiento: os.tipo_mantenimiento,
    kmEntrada: parseFloat(os.km_entrada)
  };
  const res = await fetch(`${API_URL}/ordenes-servicio`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  return res.json();
}

export async function fetchManoObra() {
  const res = await fetch(`${API_URL}/mano-obra`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener mano de obra');
  const data = await res.json();
  return data.map(m => ({
    id_mano_obra: m.idTarjeta,
    numero_os: m.numeroOs,
    matricula_mecanico: m.matriculaMecanico,
    fecha_trabajo: m.fechaTrabajo.split('T')[0],
    codigo_servicio_ejecutado: m.codigoServicioEjecutado,
    hora_inicio: '09:00',
    hora_final: '11:00',
    costo_mano_obra: 75.0
  }));
}

export async function saveManoObra(mo) {
  const body = {
    numeroOs: parseInt(mo.numero_os),
    matriculaMecanico: mo.matricula_mecanico,
    fechaTrabajo: new Date(mo.fecha_trabajo),
    codigoServicioEjecutado: mo.codigo_servicio_ejecutado,
    horaInicio: new Date(`${mo.fecha_trabajo}T09:00:00`),
    horaFinal: new Date(`${mo.fecha_trabajo}T11:00:00`)
  };
  const res = await fetch(`${API_URL}/mano-obra`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  return res.json();
}

export async function fetchDetallesMateriales() {
  const res = await fetch(`${API_URL}/detalles-materiales`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener detalles materiales');
  const data = await res.json();
  return data.map(d => ({
    id_detalle: d.idDetalle,
    numero_os: d.numeroOs,
    codigo_repuesto: d.codigoRepuesto,
    cantidad: Number(d.cantidad),
    costo_total_repuesto: Number(d.costoTotalRepuesto),
    despachado: true
  }));
}

export async function saveDetalleMaterial(d) {
  const body = {
    numeroOs: parseInt(d.numero_os),
    codigoRepuesto: d.codigo_repuesto,
    cantidad: parseFloat(d.cantidad),
    costoTotalRepuesto: parseFloat(d.costo_total_repuesto)
  };
  const res = await fetch(`${API_URL}/detalles-materiales`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  return res.json();
}

export async function fetchTalleres() {
  const res = await fetch(`${API_URL}/talleres`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener talleres');
  const data = await res.json();
  return data.map(t => ({
    id_taller_tercero: t.idTallerTercero,
    nombre_taller: t.nombreTaller,
    datos_comunicacion: t.datosComunicacion
  }));
}

export async function fetchServiciosExternos() {
  const res = await fetch(`${API_URL}/servicios-externos`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener servicios externos');
  const data = await res.json();
  return data.map(se => ({
    numero_autorizacion: se.numeroAutorizacion,
    numero_os: se.numeroOs,
    id_taller_tercero: se.idTallerTercero,
    fecha_emision: se.fechaEmision.split('T')[0],
    fecha_entrada_taller: se.fechaEntradaTaller ? se.fechaEntradaTaller.split('T')[0] : null,
    km_entrada: se.kmEntrada ? Number(se.kmEntrada) : null,
    fecha_salida_taller: se.fechaSalidaTaller ? se.fechaSalidaTaller.split('T')[0] : null,
    km_salida: se.kmSalida ? Number(se.kmSalida) : null,
    fecha_aprobacion: se.fechaAprobacion ? se.fechaAprobacion.split('T')[0] : null
  }));
}

export async function saveServicioExterno(se) {
  const body = {
    numeroOs: parseInt(se.numero_os),
    idTallerTercero: parseInt(se.id_taller_tercero),
    fechaEmision: new Date(se.fecha_emision),
    fechaEntradaTaller: se.fecha_entrada_taller ? new Date(se.fecha_entrada_taller) : null,
    kmEntrada: se.km_entrada ? parseFloat(se.km_entrada) : null,
    fechaSalidaTaller: se.fecha_salida_taller ? new Date(se.fecha_salida_taller) : null,
    kmSalida: se.km_salida ? parseFloat(se.km_salida) : null,
    fechaAprobacion: se.fecha_aprobacion ? new Date(se.fecha_aprobacion) : null
  };
  const res = await fetch(`${API_URL}/servicios-externos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  return res.json();
}
