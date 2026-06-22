import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Truck, Plus, Coins } from 'lucide-react';

interface VehiculosProps {
  userRole: string;
}

export const Vehiculos: React.FC<VehiculosProps> = ({ userRole }) => {
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Formulario
  const [showForm, setShowForm] = useState(false);
  const [codigoVehiculo, setCodigoVehiculo] = useState('');
  const [placaRodaje, setPlacaRodaje] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anoFabricacion, setAnoFabricacion] = useState('');
  const [capacidadCargaKg, setCapacidadCargaKg] = useState('');
  const [idSectorAsignado, setIdSectorAsignado] = useState('1');
  const [valorAdquisicion, setValorAdquisicion] = useState('');
  const [valorResidual, setValorResidual] = useState('');
  const [vidaUtilAnos, setVidaUtilAnos] = useState('');

  const fetchVehiculos = async () => {
    setLoading(true);
    try {
      const data = await api.getVehiculos();
      setVehiculos(data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener vehículos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehiculos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoVehiculo || !placaRodaje || !marca || !modelo || !anoFabricacion || !capacidadCargaKg) {
      alert('Por favor complete los campos obligatorios del vehículo.');
      return;
    }
    try {
      await api.createVehiculo({
        codigoVehiculo,
        placaRodaje,
        marca,
        modelo,
        anoFabricacion: parseInt(anoFabricacion, 10),
        capacidadCargaKg: parseFloat(capacidadCargaKg),
        idSectorAsignado: parseInt(idSectorAsignado, 10),
        valorAdquisicion: valorAdquisicion ? parseFloat(valorAdquisicion) : null,
        valorResidual: valorResidual ? parseFloat(valorResidual) : null,
        vidaUtilAnos: vidaUtilAnos ? parseInt(vidaUtilAnos, 10) : null
      });
      alert('Vehículo registrado con éxito.');
      setShowForm(false);
      // Reset form
      setCodigoVehiculo('');
      setPlacaRodaje('');
      setMarca('');
      setModelo('');
      setAnoFabricacion('');
      setCapacidadCargaKg('');
      setValorAdquisicion('');
      setValorResidual('');
      setVidaUtilAnos('');
      fetchVehiculos();
    } catch (err: any) {
      alert(err.message || 'Error al crear el vehículo.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '6px' }}>Catastro de Vehículos</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Inventariado de la flota y parámetros de depreciación financiera.
          </p>
        </div>
        {userRole === 'ADMINISTRADOR' && (
          <button 
            className="btn-primary" 
            onClick={() => setShowForm(!showForm)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} />
            {showForm ? 'Cancelar Registro' : 'Registrar Unidad'}
          </button>
        )}
      </div>

      {/* Formulario de Alta (Sólo Admin) */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '24px', marginBottom: '32px', background: 'rgba(255,255,255,0.015)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '18px', color: 'var(--color-catastro)' }}>
            Nueva Ficha de Vehículo
          </h3>
          <div className="grid-cols-4" style={{ gap: '16px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Código Interno *</label>
              <input type="text" placeholder="VH-007" value={codigoVehiculo} onChange={e => setCodigoVehiculo(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Placa Rodaje *</label>
              <input type="text" placeholder="XYZ-987" value={placaRodaje} onChange={e => setPlacaRodaje(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Marca *</label>
              <input type="text" placeholder="Toyota" value={marca} onChange={e => setMarca(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Modelo *</label>
              <input type="text" placeholder="Hilux" value={modelo} onChange={e => setModelo(e.target.value)} />
            </div>
          </div>

          <div className="grid-cols-4" style={{ gap: '16px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Año Fabricación *</label>
              <input type="number" placeholder="2022" value={anoFabricacion} onChange={e => setAnoFabricacion(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Capacidad Carga (Kg) *</label>
              <input type="number" placeholder="1000" value={capacidadCargaKg} onChange={e => setCapacidadCargaKg(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sector Asignado *</label>
              <select value={idSectorAsignado} onChange={e => setIdSectorAsignado(e.target.value)}>
                <option value="1">Gerencia General</option>
                <option value="2">Obras Públicas</option>
                <option value="3">Logística y Almacenes</option>
                <option value="4">Salud y Bienestar</option>
                <option value="5">Seguridad Ciudadana</option>
                <option value="6">Medio Ambiente</option>
              </select>
            </div>
          </div>

          {/* Parámetros de Depreciación */}
          <div style={{ 
            borderTop: '1px solid rgba(255,255,255,0.05)', 
            paddingTop: '18px', 
            marginTop: '18px', 
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Coins size={14} />
              Parámetros Financieros (Para Ecuación de Depreciación)
            </h4>
            <div className="grid-cols-4" style={{ gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Valor Adquisición (V)</label>
                <input type="number" step="0.01" placeholder="42000.00" value={valorAdquisicion} onChange={e => setValorAdquisicion(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Valor Residual (R)</label>
                <input type="number" step="0.01" placeholder="8400.00" value={valorResidual} onChange={e => setValorResidual(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Vida Útil en Años (N)</label>
                <input type="number" placeholder="7" value={vidaUtilAnos} onChange={e => setVidaUtilAnos(e.target.value)} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Ficha</button>
          </div>
        </form>
      )}

      {/* Listado de Vehículos */}
      {loading ? (
        <div style={{ color: 'var(--text-secondary)', padding: '40px', textAlign: 'center' }}>Cargando vehículos...</div>
      ) : error ? (
        <div style={{ color: 'var(--color-costos)', padding: '20px' }}>{error}</div>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-card)' }}>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Código</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Placa</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Vehículo / Modelo</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Sector Asignado</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Capacidad</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Val. Adquisición (V)</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Val. Residual (R)</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Vida Útil (N)</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v: any) => (
                <tr key={v.codigoVehiculo} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }} className="glass-panel-hover">
                  <td style={{ padding: '16px 20px', fontWeight: '600', color: 'var(--color-catastro)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Truck size={16} />
                      {v.codigoVehiculo}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: '500' }}>{v.placaRodaje}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <div>{v.marca} {v.modelo}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Fabricación: {v.anoFabricacion}</div>
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                    {v.sector?.nombreSector || `Sector #${v.idSectorAsignado}`}
                  </td>
                  <td style={{ padding: '16px 20px' }}>{Number(v.capacidadCargaKg).toFixed(0)} Kg</td>
                  <td style={{ padding: '16px 20px', color: 'var(--color-accent)' }}>
                    {v.valorAdquisicion ? `S/ ${Number(v.valorAdquisicion).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '—'}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {v.valorResidual ? `S/ ${Number(v.valorResidual).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '—'}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    {v.vidaUtilAnos ? (
                      <span style={{ 
                        background: 'rgba(245,158,11,0.08)', 
                        border: '1px solid rgba(245,158,11,0.15)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: 'var(--color-accent)'
                      }}>
                        {v.vidaUtilAnos} años
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
