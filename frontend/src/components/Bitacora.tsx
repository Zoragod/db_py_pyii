import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { CheckSquare, Fuel, Navigation } from 'lucide-react';

export const Bitacora: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [conductores, setConductores] = useState<any[]>([]);
  const [vehiculos, setVehiculos] = useState<any[]>([]);

  // Campos de Movimiento
  const [codigoVehiculo, setCodigoVehiculo] = useState('');
  const [matriculaConductor, setMatriculaConductor] = useState('');
  const [fechaMovimiento, setFechaMovimiento] = useState(new Date().toISOString().split('T')[0]);
  const [horaSalida, setHoraSalida] = useState('08:00');
  const [horaLlegada, setHoraLlegada] = useState('17:00');
  const [kmSalida, setKmSalida] = useState('');
  const [kmLlegada, setKmLlegada] = useState('');
  const [destino, setDestino] = useState('');

  // Checklist
  const [chkLuces, setChkLuces] = useState(true);
  const [chkFrenos, setChkFrenos] = useState(true);
  const [chkFluidos, setChkFluidos] = useState(true);
  const [chkLlantas, setChkLlantas] = useState(true);
  const [chkDocumentos, setChkDocumentos] = useState(true);
  const [checklistObservaciones, setChecklistObservaciones] = useState('');

  // Combustible Opcional
  const [abastecer, setAbastecer] = useState(false);
  const [idServicentro, setIdServicentro] = useState('1');
  const [tipoCombustible, setTipoCombustible] = useState('Gasolina 95');
  const [galonesAbastecidos, setGalonesAbastecidos] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vList, cList] = await Promise.all([api.getVehiculos(), api.getConductores()]);
        setVehiculos(vList);
        setConductores(cList);
        if (vList.length > 0) setCodigoVehiculo(vList[0].codigoVehiculo);
        if (cList.length > 0) setMatriculaConductor(cList[0].matriculaConductor);
      } catch (e: any) {
        console.error('Error fetching catalog data:', e.message);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoVehiculo || !matriculaConductor || !kmSalida || !destino) {
      alert('Por favor complete los campos obligatorios del movimiento.');
      return;
    }

    setLoading(true);
    try {
      // 1. Convertir horas en Date ISO strings coherentes
      const baseDate = fechaMovimiento; // YYYY-MM-DD
      const salidaISO = new Date(`${baseDate}T${horaSalida}:00Z`).toISOString();
      const llegadaISO = horaLlegada ? new Date(`${baseDate}T${horaLlegada}:00Z`).toISOString() : null;

      // 2. Registrar movimiento + checklist
      const movimiento = await api.createMovimiento({
        codigoVehiculo,
        matriculaConductor,
        fechaMovimiento: new Date(fechaMovimiento).toISOString(),
        horaSalida: salidaISO,
        horaLlegada: llegadaISO,
        kmSalida: parseFloat(kmSalida),
        kmLlegada: kmLlegada ? parseFloat(kmLlegada) : null,
        destino,
        chkLuces,
        chkFrenos,
        chkFluidos,
        chkLlantas,
        chkDocumentos,
        checklistObservaciones
      });

      // 3. Registrar combustible si se seleccionó la casilla
      if (abastecer && galonesAbastecidos) {
        await api.createMovimiento({
          idMovimiento: movimiento.idMovimiento,
          idServicentro: parseInt(idServicentro, 10),
          tipoCombustible,
          galonesAbastecidos: parseFloat(galonesAbastecidos),
          kilometrajeActual: parseFloat(kmSalida)
        });
      }

      alert(`Movimiento Diario registrado con éxito (ID: ${movimiento.idMovimiento}).`);
      
      // Reset form
      setKmSalida('');
      setKmLlegada('');
      setDestino('');
      setChecklistObservaciones('');
      setAbastecer(false);
      setGalonesAbastecidos('');
    } catch (err: any) {
      alert(err.message || 'Error al registrar el movimiento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '6px' }}>Bitácora de Movimiento Diario</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Registro de jornadas vehiculares, lista de verificación física y consumos de combustible.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Panel 1: Datos Operativos del Viaje */}
        <div className="glass-panel" style={{ padding: '24px', background: 'rgba(255,255,255,0.015)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '18px', color: 'var(--color-movimiento)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={18} />
            Datos Operativos (Anverso MA 122 01 01)
          </h3>
          <div className="grid-cols-4" style={{ gap: '16px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Vehículo *</label>
              <select value={codigoVehiculo} onChange={e => setCodigoVehiculo(e.target.value)}>
                {vehiculos.map(v => (
                  <option key={v.codigoVehiculo} value={v.codigoVehiculo}>{v.codigoVehiculo} ({v.placaRodaje})</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Conductor *</label>
              <select value={matriculaConductor} onChange={e => setMatriculaConductor(e.target.value)}>
                {conductores.map(c => (
                  <option key={c.matriculaConductor} value={c.matriculaConductor}>{c.nombreConductor}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Fecha Jornada *</label>
              <input type="date" value={fechaMovimiento} onChange={e => setFechaMovimiento(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Destino / Ruta *</label>
              <input type="text" placeholder="Callao - Comas" value={destino} onChange={e => setDestino(e.target.value)} />
            </div>
          </div>

          <div className="grid-cols-4" style={{ gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Hora Salida *</label>
              <input type="time" value={horaSalida} onChange={e => setHoraSalida(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Hora Llegada</label>
              <input type="time" value={horaLlegada} onChange={e => setHoraLlegada(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>KM Salida *</label>
              <input type="number" step="0.01" placeholder="45230" value={kmSalida} onChange={e => setKmSalida(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>KM Llegada</label>
              <input type="number" step="0.01" placeholder="45430" value={kmLlegada} onChange={e => setKmLlegada(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Panel 2: Lista de Chequeo Físico (Reverso) */}
        <div className="glass-panel" style={{ padding: '24px', background: 'rgba(255,255,255,0.015)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '18px', color: 'var(--color-mantenimiento)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckSquare size={18} />
            Lista de Verificación Diaria del Vehículo (Reverso MA 122 01 01)
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', marginBottom: '16px' }}>
            Verifica el estado de los componentes obligatorios antes de iniciar la jornada laboral.
          </p>
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '16px 32px', 
            padding: '16px',
            background: 'rgba(0,0,0,0.15)',
            border: '1px solid var(--border-card)',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            {[
              { label: 'Faros y Luces', state: chkLuces, setState: setChkLuces },
              { label: 'Frenos de Servicio', state: chkFrenos, setState: setChkFrenos },
              { label: 'Niveles de Fluidos', state: chkFluidos, setState: setChkFluidos },
              { label: 'Estado de Llantas', state: chkLlantas, setState: setChkLlantas },
              { label: 'Documentación al día', state: chkDocumentos, setState: setChkDocumentos }
            ].map((item, idx) => (
              <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={item.state} 
                  onChange={e => item.setState(e.target.checked)} 
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                {item.label}
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Observaciones del Checklist</label>
            <textarea 
              rows={3} 
              placeholder="Detalla cualquier desperfecto o particularidad encontrada en el vehículo..."
              value={checklistObservaciones}
              onChange={e => setChecklistObservaciones(e.target.value)}
            />
          </div>
        </div>

        {/* Panel 3: Abastecimiento Opcional */}
        <div className="glass-panel" style={{ padding: '24px', background: 'rgba(255,255,255,0.015)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14.5px', fontWeight: '600', color: 'var(--color-accent)', cursor: 'pointer', marginBottom: '14px' }}>
            <input 
              type="checkbox" 
              checked={abastecer} 
              onChange={e => setAbastecer(e.target.checked)} 
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <Fuel size={18} />
            ¿Deseas registrar un abastecimiento de combustible en este viaje?
          </label>

          {abastecer && (
            <div className="grid-cols-4" style={{ gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Servicentro *</label>
                <select value={idServicentro} onChange={e => setIdServicentro(e.target.value)}>
                  <option value="1">Servicentro Primax - San Isidro</option>
                  <option value="2">Estación Repsol - Callao</option>
                  <option value="3">Gasolinera Petroperú - Carabayllo</option>
                  <option value="4">Grifo Pecsa - Surco</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Tipo Combustible *</label>
                <select value={tipoCombustible} onChange={e => setTipoCombustible(e.target.value)}>
                  <option value="Gasolina 95">Gasolina 95</option>
                  <option value="Diesel D-5">Diesel D-5</option>
                  <option value="GLP / GNV">GLP / GNV</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Galones Abastecidos *</label>
                <input type="number" step="0.001" placeholder="12.500" value={galonesAbastecidos} onChange={e => setGalonesAbastecidos(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* Botón Guardar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ padding: '12px 28px', fontSize: '15px', fontWeight: '600' }}
            disabled={loading}
          >
            {loading ? 'Procesando registro...' : 'Registrar Bitácora y Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};
