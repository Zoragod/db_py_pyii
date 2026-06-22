import React, { createContext, useState, useContext, useEffect } from 'react';
import { calcularDepreciacionMensual, calcularRemuneracionCapital, calcularIUV, calcularCostoPorKilometro } from '../utils/formulas';
import { useAuth } from './AuthContext';
import * as api from '../utils/api';

const FleetContext = createContext();

// Datos semilla de inicio (Seed Data)
const INICIAL_SECTORES = [
  { id_sector: 1, nombre_sector: 'Distribución y Redes', localidad: 'Planta Principal' },
  { id_sector: 2, nombre_sector: 'Mantenimiento Hidráulico', localidad: 'Sede Sur' },
  { id_sector: 3, nombre_sector: 'Gerencia y Supervisión', localidad: 'Administración' },
  { id_sector: 4, nombre_sector: 'Flota de Uso Común', localidad: 'Garaje Central' }
];

const INICIAL_VEHICULOS = [
  { codigo_vehiculo: '971105', placa_rodaje: 'ABC-123', marca: 'Chevrolet', modelo: 'Sedan (Pasajeros)', anio_fabricacion: 2020, capacidad_carga_kg: 0, id_sector_asignado: 3, valor_nuevo: 12000, vida_util_anos: 8, valor_residual: 1200, rendimiento_ref_kmpgal: 35 },
  { codigo_vehiculo: '971200', placa_rodaje: 'XPQ-456', marca: 'Toyota', modelo: 'Hilux (Doble Cabina)', anio_fabricacion: 2021, capacidad_carga_kg: 1000, id_sector_asignado: 1, valor_nuevo: 28000, vida_util_anos: 8, valor_residual: 2800, rendimiento_ref_kmpgal: 28 },
  { codigo_vehiculo: '971302', placa_rodaje: 'ZWM-789', marca: 'Volvo', modelo: 'FMX (Carga Pesada)', anio_fabricacion: 2018, capacidad_carga_kg: 15000, id_sector_asignado: 2, valor_nuevo: 95000, vida_util_anos: 10, valor_residual: 9500, rendimiento_ref_kmpgal: 12 },
  { codigo_vehiculo: '971410', placa_rodaje: 'EGB-821', marca: 'Hyundai', modelo: 'H1 (Pasajeros)', anio_fabricacion: 2019, capacidad_carga_kg: 800, id_sector_asignado: 4, valor_nuevo: 24000, vida_util_anos: 8, valor_residual: 2400, rendimiento_ref_kmpgal: 25 }
];

const INICIAL_CONDUCTORES = [
  { matricula_conductor: 'C001', nombre_conductor: 'Juan Pérez', documento_identidad: '10293847' },
  { matricula_conductor: 'C002', nombre_conductor: 'María Rojas', documento_identidad: '47586930' },
  { matricula_conductor: 'C003', nombre_conductor: 'Roberto Benítez', documento_identidad: '09837461' },
  { matricula_conductor: 'C004', nombre_conductor: 'Luis Delgado', documento_identidad: '83726154' }
];

const INICIAL_SERVICENTROS = [
  { id_servicentro: 1, nombre_servicentro: 'Estación Primax San Isidro' },
  { id_servicentro: 2, nombre_servicentro: 'Repsol Planta Sede Norte' },
  { id_servicentro: 3, nombre_servicentro: 'Petroperú Garaje Central' }
];

const INICIAL_TALLERES_TERCEROS = [
  { id_taller_tercero: 1, nombre_taller: 'Taller Electromecánico Rímac', datos_comunicacion: 'Av. Tacna 421 | Telf: 456-7890' },
  { id_taller_tercero: 2, nombre_taller: 'Freno Seguro S.A.C.', datos_comunicacion: 'Calle Las Industrias 812 | Telf: 981-234-567' },
  { id_taller_tercero: 3, nombre_taller: 'Llantas y Rines del Pacífico', datos_comunicacion: 'Av. Argentina 1500 | Telf: 321-4567' }
];

const INICIAL_REPUESTOS = [
  { codigo_repuesto: 'REP-001', descripcion: 'Filtro de Aceite Castrol', costo_unitario: 18.50 },
  { codigo_repuesto: 'REP-002', descripcion: 'Pastilla de Freno Delantera', costo_unitario: 42.00 },
  { codigo_repuesto: 'REP-003', descripcion: 'Neumático Bridgestone 16"', costo_unitario: 115.00 },
  { codigo_repuesto: 'REP-004', descripcion: 'Alternador Bosch 12V', costo_unitario: 175.00 },
  { codigo_repuesto: 'REP-005', descripcion: 'Batería Etna Professional 13 Placas', costo_unitario: 95.00 },
  { codigo_repuesto: 'REP-006', descripcion: 'Filtro de Aire Motor', costo_unitario: 12.00 }
];

const INICIAL_MECANICOS = [
  { matricula_mecanico: 'M001', nombre_mecanico: 'Carlos Gómez' },
  { matricula_mecanico: 'M002', nombre_mecanico: 'Andrés Villalta' },
  { matricula_mecanico: 'M003', nombre_mecanico: 'José Espinoza' }
];

// Llantas precargadas
const INICIAL_LLANTAS = [
  { numero_fabrica: 'LLA-GOOD-01', fabricante: 'Goodyear', dimension: '205/55 R16', modelo: 'Assurance', tipo_elemento: 'Llanta' },
  { numero_fabrica: 'LLA-GOOD-02', fabricante: 'Goodyear', dimension: '205/55 R16', modelo: 'Assurance', tipo_elemento: 'Llanta' },
  { numero_fabrica: 'LLA-GOOD-03', fabricante: 'Goodyear', dimension: '205/55 R16', modelo: 'Assurance', tipo_elemento: 'Llanta' },
  { numero_fabrica: 'LLA-GOOD-04', fabricante: 'Goodyear', dimension: '205/55 R16', modelo: 'Assurance', tipo_elemento: 'Llanta' },
  { numero_fabrica: 'LLA-GOOD-05', fabricante: 'Goodyear', dimension: '205/55 R16', modelo: 'Assurance', tipo_elemento: 'Llanta' },
  { numero_fabrica: 'LLA-GOOD-06', fabricante: 'Goodyear', dimension: '205/55 R16', modelo: 'Assurance', tipo_elemento: 'Llanta' }
];

export const FleetProvider = ({ children }) => {
  const { token } = useAuth();

  // Inicialización de estados con datos semilla como fallback
  const [vehiculos, setVehiculos] = useState(INICIAL_VEHICULOS);
  const [conductores, setConductores] = useState(INICIAL_CONDUCTORES);
  const [sectores, setSectores] = useState(INICIAL_SECTORES);
  const [servicentros, setServicentros] = useState(INICIAL_SERVICENTROS);
  const [talleresTerceros, setTalleresTerceros] = useState(INICIAL_TALLERES_TERCEROS);
  const [repuestos, setRepuestos] = useState(INICIAL_REPUESTOS);
  const [mecanicos, setMecanicos] = useState(INICIAL_MECANICOS);
  const [llantas, setLlantas] = useState(INICIAL_LLANTAS);

  // Transacciones diarias
  const [movimientos, setMovimientos] = useState([]);
  const [ordenesAbastecimiento, setOrdenesAbastecimiento] = useState([]);
  const [historialFichaControl, setHistorialFichaControl] = useState([]);
  const [ordenesServicioTaller, setOrdenesServicioTaller] = useState([]);
  const [tarjetasManoObra, setTarjetasManoObra] = useState([]);
  const [detallesSolicitudMaterial, setDetallesSolicitudMaterial] = useState([]);
  const [autorizacionesServicioExterno, setAutorizacionesServicioExterno] = useState([]);
  const [detallesServicioExterno, setDetallesServicioExterno] = useState([]);

  // Carga inicial y sincronización desde la base de datos
  const cargarDatosDesdeBD = async () => {
    try {
      const [v, c, s, sc, rep, mec, ll, mov, abast, histLlas, os, mo, mat, tall, se] = await Promise.all([
        api.fetchVehiculos(),
        api.fetchConductores(),
        api.fetchSectores(),
        api.fetchServicentros(),
        api.fetchRepuestos(),
        api.fetchMecanicos(),
        api.fetchLlantas(),
        api.fetchMovimientos(),
        api.fetchAbastecimientos(),
        api.fetchHistorialLlantas(),
        api.fetchOrdenesServicio(),
        api.fetchManoObra(),
        api.fetchDetallesMateriales(),
        api.fetchTalleres(),
        api.fetchServiciosExternos()
      ]);
      if (v && v.length > 0) setVehiculos(v);
      if (c && c.length > 0) setConductores(c);
      if (s && s.length > 0) setSectores(s);
      if (sc && sc.length > 0) setServicentros(sc);
      if (rep && rep.length > 0) setRepuestos(rep);
      if (mec && mec.length > 0) setMecanicos(mec);
      if (ll && ll.length > 0) setLlantas(ll);
      setMovimientos(mov || []);
      setOrdenesAbastecimiento(abast || []);
      setHistorialFichaControl(histLlas || []);
      setOrdenesServicioTaller(os || []);
      setTarjetasManoObra(mo || []);
      setDetallesSolicitudMaterial(mat || []);
      if (tall && tall.length > 0) setTalleresTerceros(tall);
      setAutorizacionesServicioExterno(se || []);
    } catch (e) {
      console.error('Error al cargar datos desde la base de datos:', e);
    }
  };

  useEffect(() => {
    if (token) {
      cargarDatosDesdeBD();
    }
  }, [token]);

  // ==========================================
  // FUNCIONES DE NEGOCIO Y CRUD CON BACKEND
  // ==========================================

  // Agregar / Editar Vehículo
  const upsertVehiculo = async (vehiculo) => {
    try {
      await api.saveVehiculo(vehiculo);
      const updated = await api.fetchVehiculos();
      setVehiculos(updated);
    } catch (err) {
      console.error('Error al guardar vehículo:', err);
      // Fallback a memoria si falla o no tiene permisos
      setVehiculos(prev => {
        const idx = prev.findIndex(v => v.codigo_vehiculo === vehiculo.codigo_vehiculo);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = vehiculo;
          return copy;
        }
        return [...prev, vehiculo];
      });
    }
  };

  // Asignar Vehículo a Sector
  const asignarVehiculoASector = async (codigoVehiculo, idSector) => {
    const veh = vehiculos.find(v => v.codigo_vehiculo === codigoVehiculo);
    if (veh) {
      const updatedVeh = { ...veh, id_sector_asignado: parseInt(idSector) };
      await upsertVehiculo(updatedVeh);
    }
  };

  // Agregar Conductor
  const addConductor = async (conductor) => {
    try {
      await api.saveConductor(conductor);
      const updated = await api.fetchConductores();
      setConductores(updated);
    } catch (err) {
      console.error('Error al guardar conductor:', err);
      setConductores(prev => [...prev, conductor]);
    }
  };

  // Registrar Movimiento Diario (con su Checklist)
  const registrarMovimientoDiario = async (mov) => {
    try {
      const nuevo = await api.saveMovimiento(mov);
      const updated = await api.fetchMovimientos();
      setMovimientos(updated);
      return nuevo;
    } catch (err) {
      console.error('Error al registrar viaje:', err);
      const newId = movimientos.length > 0 ? Math.max(...movimientos.map(m => m.id_movimiento)) + 1 : 1;
      const nuevoMov = { ...mov, id_movimiento: newId };
      setMovimientos(prev => [...prev, nuevoMov]);
      return nuevoMov;
    }
  };

  // Registrar Orden de Abastecimiento (Combustible)
  const registrarAbastecimiento = async (abast) => {
    try {
      await api.saveAbastecimiento(abast);
      const updated = await api.fetchAbastecimientos();
      setOrdenesAbastecimiento(updated);
    } catch (err) {
      console.error('Error al registrar combustible:', err);
      const newId = ordenesAbastecimiento.length > 0 ? Math.max(...ordenesAbastecimiento.map(o => o.numero_orden)) + 1 : 1;
      setOrdenesAbastecimiento(prev => [...prev, { ...abast, numero_orden: newId }]);
    }
  };

  // Aprobar Orden de Combustible
  const aprobarAbastecimiento = (id) => {
    setOrdenesAbastecimiento(prev => prev.map(o => o.numero_orden === id ? { ...o, aprobado: true } : o));
  };

  // Registrar Orden de Servicio Taller
  const registrarOrdenServicio = async (os) => {
    try {
      const nuevo = await api.saveOrdenServicio(os);
      const updated = await api.fetchOrdenesServicio();
      setOrdenesServicioTaller(updated);
      return nuevo;
    } catch (err) {
      console.error('Error al registrar OS:', err);
      const newId = ordenesServicioTaller.length > 0 ? Math.max(...ordenesServicioTaller.map(o => o.numero_os)) + 1 : 1;
      const nuevaOs = { ...os, numero_os: newId, estado: 'En Curso' };
      setOrdenesServicioTaller(prev => [...prev, nuevaOs]);
      return nuevaOs;
    }
  };

  const actualizarEstadoOS = (numeroOs, estado) => {
    setOrdenesServicioTaller(prev => prev.map(o => o.numero_os === numeroOs ? { ...o, estado } : o));
  };

  // Registrar Mano de Obra en OS
  const agregarManoObra = async (mo) => {
    try {
      await api.saveManoObra(mo);
      const updated = await api.fetchManoObra();
      setTarjetasManoObra(updated);
    } catch (err) {
      console.error('Error al agregar mano de obra:', err);
      const newId = tarjetasManoObra.length > 0 ? Math.max(...tarjetasManoObra.map(t => t.id_mano_obra)) + 1 : 1;
      setTarjetasManoObra(prev => [...prev, { ...mo, id_mano_obra: newId }]);
    }
  };

  // Registrar Solicitud de Repuestos
  const solicitarMaterialesOS = async (numeroOs, repuestoId, cantidad) => {
    const rep = repuestos.find(r => r.codigo_repuesto === repuestoId);
    if (!rep) return;
    try {
      await api.saveDetalleMaterial({
        numero_os: numeroOs,
        codigo_repuesto: repuestoId,
        cantidad: cantidad,
        costo_total_repuesto: rep.costo_unitario * cantidad
      });
      const updated = await api.fetchDetallesMateriales();
      setDetallesSolicitudMaterial(updated);
    } catch (err) {
      console.error('Error al solicitar materiales:', err);
      const newId = detallesSolicitudMaterial.length > 0 ? Math.max(...detallesSolicitudMaterial.map(d => d.id_detalle)) + 1 : 1;
      setDetallesSolicitudMaterial(prev => [...prev, {
        id_detalle: newId,
        numero_os: parseInt(numeroOs),
        codigo_repuesto: repuestoId,
        cantidad: parseInt(cantidad),
        costo_total_repuesto: rep.costo_unitario * parseInt(cantidad),
        despachado: false
      }]);
    }
  };

  // Despachar Repuestos (Almacenero)
  const despacharMaterial = (idDetalle) => {
    setDetallesSolicitudMaterial(prev => prev.map(d => d.id_detalle === idDetalle ? { ...d, despachado: true } : d));
  };

  // Registrar Autorización de Servicio Externo
  const registrarServicioExterno = async (auth, items) => {
    try {
      await api.saveServicioExterno(auth);
      const updated = await api.fetchServiciosExternos();
      setAutorizacionesServicioExterno(updated);
    } catch (err) {
      console.error('Error al registrar servicio externo:', err);
      const newAuthId = autorizacionesServicioExterno.length > 0 ? Math.max(...autorizacionesServicioExterno.map(a => a.numero_autorizacion)) + 1 : 1;
      setAutorizacionesServicioExterno(prev => [...prev, { ...auth, numero_autorizacion: newAuthId }]);
    }
  };

  // Registrar Instalación / Rotación de Llantas
  const instalarLlanta = async (numFabrica, codVehiculo, posicion, kmInstalacion) => {
    try {
      await api.saveHistorialLlanta({
        numero_fabrica: numFabrica,
        codigo_vehiculo: codVehiculo,
        fecha_instalacion: new Date().toISOString().split('T')[0],
        km_instalacion: kmInstalacion,
        posicion_rueda: posicion
      });
      const updated = await api.fetchHistorialLlantas();
      setHistorialFichaControl(updated);
    } catch (err) {
      console.error('Error al instalar llanta:', err);
      setHistorialFichaControl(prev => {
        const actualizados = prev.map(h => 
          (h.codigo_vehiculo === codVehiculo && h.posicion_rueda === parseInt(posicion) && h.fecha_retiro === null)
            ? { ...h, fecha_retiro: new Date().toISOString().split('T')[0], km_retiro: kmInstalacion }
            : h
        );
        const newId = actualizados.length > 0 ? Math.max(...actualizados.map(a => a.id_historial)) + 1 : 1;
        return [...actualizados, {
          id_historial: newId,
          numero_fabrica: numFabrica,
          codigo_vehiculo: codVehiculo,
          fecha_instalacion: new Date().toISOString().split('T')[0],
          fecha_retiro: null,
          km_instalacion: parseFloat(kmInstalacion),
          km_retiro: null,
          posicion_rueda: parseInt(posicion)
        }];
      });
    }
  };

  // ==========================================
  // GENERAR CONSOLIDADO FINANCIERO MENSUAL (MA 122 03 01)
  // ==========================================
  const getControlMensual = (codigoVehiculo, mes, anio) => {
    const vehiculo = vehiculos.find(v => v.codigo_vehiculo === codigoVehiculo);
    if (!vehiculo) return null;

    // 1. Filtrar viajes (Movimientos) del mes y año
    const viajesDelMes = movimientos.filter(m => {
      if (m.codigo_vehiculo !== codigoVehiculo) return false;
      const date = new Date(m.fecha_movimiento);
      return (date.getMonth() + 1) === parseInt(mes) && date.getFullYear() === parseInt(anio);
    });

    const totalKMs = viajesDelMes.reduce((sum, v) => sum + (v.km_llegada - v.km_salida), 0);
    const totalHoras = viajesDelMes.reduce((sum, v) => {
      const [hS, mS] = v.hora_salida.split(':').map(Number);
      const [hL, mL] = v.hora_llegada.split(':').map(Number);
      const diffMin = (hL * 60 + mL) - (hS * 60 + mS);
      return sum + (diffMin > 0 ? diffMin / 60 : 0);
    }, 0);

    // 2. Costo combustible del mes (ordenes aprobadas)
    const viajeIds = viajesDelMes.map(v => v.id_movimiento);
    const combustibleDelMes = ordenesAbastecimiento.filter(o => o.aprobado && viajeIds.includes(o.id_movimiento));
    const costoCombustible = combustibleDelMes.reduce((sum, o) => sum + o.costo_total, 0);
    const galonesAbastecidos = combustibleDelMes.reduce((sum, o) => sum + o.galones_abastecidos, 0);

    // 3. Costo Mano de Obra propia del taller
    const ordenesTallerDelMes = ordenesServicioTaller.filter(o => {
      if (o.codigo_vehiculo !== codigoVehiculo) return false;
      const date = new Date(o.fecha_emision);
      return (date.getMonth() + 1) === parseInt(mes) && date.getFullYear() === parseInt(anio);
    });
    const osIds = ordenesTallerDelMes.map(o => o.numero_os);

    const manoObraDelMes = tarjetasManoObra.filter(t => osIds.includes(t.numero_os));
    const costoManoObra = manoObraDelMes.reduce((sum, t) => sum + t.costo_mano_obra, 0);

    // 4. Costo de Materiales/Repuestos propios despachados
    const materialesDelMes = detallesSolicitudMaterial.filter(d => d.despachado && osIds.includes(d.numero_os));
    const costoMateriales = materialesDelMes.reduce((sum, d) => sum + d.costo_total_repuesto, 0);

    // 5. Costo de Servicios Externos
    const serviciosExternosDelMes = autorizacionesServicioExterno.filter(a => osIds.includes(a.numero_os));
    const authIds = serviciosExternosDelMes.map(a => a.numero_autorizacion);
    const detallesExternos = detallesServicioExterno.filter(d => authIds.includes(d.numero_autorizacion));
    const costoServiciosExternos = detallesExternos.reduce((sum, d) => sum + d.valor_presupuestado, 0);

    // 6. Costo Fijo del Vehículo (Depreciación + Seguros estimulados)
    // Depreciación
    const depreciacionMensual = calcularDepreciacionMensual(vehiculo.valor_nuevo, vehiculo.valor_residual, vehiculo.vida_util_anos);
    // Licenciamiento + seguro estimado (1.077% mensual del valor nuevo basándonos en el manual)
    const segurosLicenciamiento = (vehiculo.valor_nuevo * 0.01077);
    const costoFijoVehiculo = depreciacionMensual + segurosLicenciamiento;

    // Costo Fijo Prorrateable (CFP): Oficina, administración de flota (simulado en $150 mensual por vehículo)
    const costoFijoProrrateado = 150;

    // Costo Variable de Llantas (estimado según el manual al 4% del costo variable por km, o consumo directo.
    // Simulamos un costo fijo por km recorrido de $0.02 por desgaste de neumático)
    const costoLlantas = totalKMs * 0.02;

    // Costos Totales Variables
    const costoVariableTotal = costoCombustible + costoManoObra + costoMateriales + costoServiciosExternos + costoLlantas;

    // Costo por Kilómetro (CKV)
    const ckv = calcularCostoPorKilometro(costoFijoProrrateado, costoFijoVehiculo, totalKMs, costoVariableTotal / (totalKMs || 1));

    // Índice de Utilización de Vehículo (IUV)
    // Parámetros mensuales promedio de referencia: KRP = 1500 km, HUP = 160 horas
    const krp = 1500;
    const hup = 160;
    const iuv = calcularIUV(totalKMs, krp, totalHoras, hup);

    return {
      codigo_vehiculo: codigoVehiculo,
      placa: vehiculo.placa_rodaje,
      mes,
      anio,
      dias_utiles: 22,
      total_kilometros_recorridos: totalKMs,
      total_horas_uso: totalHoras,
      costo_total_combustible: costoCombustible,
      galones_combustible: galonesAbastecidos,
      costo_mano_obra_propio: costoManoObra,
      costo_repuestos_propio: costoMateriales,
      costo_talleres_terceros: costoServiciosExternos,
      costo_llantas: costoLlantas,
      costo_fijo_vehiculo: costoFijoVehiculo,
      costo_fijo_prorrateado: costoFijoProrrateado,
      costo_variable: costoVariableTotal,
      costo_por_kilometro: ckv,
      iuv: iuv
    };
  };

  return (
    <FleetContext.Provider value={{
      vehiculos, upsertVehiculo, asignarVehiculoASector,
      conductores, addConductor,
      sectores,
      servicentros,
      talleresTerceros,
      repuestos,
      mecanicos,
      llantas, instalarLlanta,
      movimientos, registrarMovimientoDiario,
      ordenesAbastecimiento, registrarAbastecimiento, aprobarAbastecimiento,
      ordenesServicioTaller, registrarOrdenServicio, actualizarEstadoOS,
      tarjetasManoObra, agregarManoObra,
      detallesSolicitudMaterial, solicitarMaterialesOS, despacharMaterial,
      autorizacionesServicioExterno, detallesServicioExterno, registrarServicioExterno,
      historialFichaControl,
      getControlMensual
    }}>
      {children}
    </FleetContext.Provider>
  );
};

export const useFleet = () => useContext(FleetContext);
