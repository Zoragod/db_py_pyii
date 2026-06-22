import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { AreaChart, Calculator, Activity, DollarSign, Clock, Coins } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [selectedVehiculo, setSelectedVehiculo] = useState('');
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1);
  const [selectedAnio, setSelectedAnio] = useState(2026);
  const [loading, setLoading] = useState(false);
  const [kpiData, setKpiData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVehiculos = async () => {
      try {
        const data = await api.getVehiculos();
        setVehiculos(data);
        if (data.length > 0) setSelectedVehiculo(data[0].codigoVehiculo);
      } catch (e: any) {
        console.error('Error cargando vehículos:', e.message);
      }
    };
    fetchVehiculos();
  }, []);

  const handleCalculate = async () => {
    if (!selectedVehiculo) {
      alert('Por favor selecciona un vehículo.');
      return;
    }
    setLoading(true);
    setError('');
    setKpiData(null);
    try {
      const data = await api.getKpis(selectedVehiculo, selectedMes, selectedAnio);
      setKpiData(data);
    } catch (err: any) {
      setError(err.message || 'Error al calcular KPIs del vehículo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '6px' }}>Dashboard Analítico e Indicadores</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Calculadora de Costos Operativos por Kilómetro (CKV) y Análisis de Utilización de Flota (IUV).
        </p>
      </div>

      {/* Selectores */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1', minWidth: '200px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Seleccionar Vehículo *</label>
          <select value={selectedVehiculo} onChange={e => setSelectedVehiculo(e.target.value)}>
            <option value="">-- Elige una unidad --</option>
            {vehiculos.map(v => (
              <option key={v.codigoVehiculo} value={v.codigoVehiculo}>{v.codigoVehiculo} ({v.placaRodaje} - {v.marca} {v.modelo})</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '140px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Mes *</label>
          <select value={selectedMes} onChange={e => setSelectedMes(parseInt(e.target.value, 10))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(2026, m - 1).toLocaleString('es-PE', { month: 'long' })}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '120px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Año *</label>
          <select value={selectedAnio} onChange={e => setSelectedAnio(parseInt(e.target.value, 10))}>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </div>

        <button 
          className="btn-primary" 
          onClick={handleCalculate}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 24px', height: '42px' }}
          disabled={loading}
        >
          <Calculator size={16} />
          {loading ? 'Calculando...' : 'Calcular Indicadores'}
        </button>
      </div>

      {/* Resultados de KPIs */}
      {loading && (
        <div style={{ color: 'var(--text-secondary)', padding: '40px', textAlign: 'center' }}>Procesando fórmulas en base de datos...</div>
      )}

      {error && (
        <div className="glass-panel" style={{ padding: '20px', color: 'var(--color-costos)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}>
          {error}
        </div>
      )}

      {kpiData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Fila de Tarjetas KPI */}
          <div className="grid-cols-4" style={{ gap: '20px' }}>
            
            {/* CKV */}
            <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '16px', top: '16px', color: 'rgba(239, 68, 68, 0.15)' }}>
                <DollarSign size={40} />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Costo Operacional (CKV)</span>
              <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '12px 0 6px 0', color: 'var(--color-costos)' }}>
                S/ {kpiData.indicadores.costoPorKilometro.toFixed(4)}
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Costo estimado por kilómetro recorrido en el mes.</p>
            </div>

            {/* IUV */}
            <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '16px', top: '16px', color: 'rgba(16, 185, 129, 0.15)' }}>
                <Activity size={40} />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Índice Utilización (IUV)</span>
              <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '12px 0 6px 0', color: 'var(--color-movimiento)' }}>
                {kpiData.indicadores.indiceUtilizacion}%
              </h2>
              <span style={{ 
                fontSize: '10.5px', 
                fontWeight: '600', 
                background: kpiData.indicadores.indiceUtilizacion >= 100 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                border: kpiData.indicadores.indiceUtilizacion >= 100 ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)',
                color: kpiData.indicadores.indiceUtilizacion >= 100 ? 'var(--color-movimiento)' : 'var(--color-accent)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {kpiData.indicadores.estadoServicio}
              </span>
            </div>

            {/* Depreciación */}
            <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '16px', top: '16px', color: 'rgba(139, 92, 246, 0.15)' }}>
                <Coins size={40} />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Depreciación Mensual (D)</span>
              <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '12px 0 6px 0', color: 'var(--color-mantenimiento)' }}>
                S/ {kpiData.indicadores.depreciacionMensual.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Fórmula de depreciación lineal mensual del patrimonio.</p>
            </div>

            {/* Horas */}
            <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '16px', top: '16px', color: 'rgba(59, 130, 246, 0.15)' }}>
                <Clock size={40} />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Horas Totales Uso</span>
              <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '12px 0 6px 0', color: 'var(--color-catastro)' }}>
                {kpiData.utilizacionRendimiento.horasUso.toFixed(1)} h
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Horas de uso efectivas en movimientos durante el mes.</p>
            </div>

          </div>

          {/* Ficha Resumen */}
          <div className="glass-panel" style={{ padding: '28px', background: 'rgba(255,255,255,0.01)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AreaChart size={18} style={{ color: 'var(--color-catastro)' }} />
              Análisis Técnico del Diagnóstico Operativo
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Kilometraje acumulado real:</span>
                <strong>{kpiData.utilizacionRendimiento.kilometrosRecorridos.toFixed(1)} km</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Kilometraje patrón de referencia (KRP):</span>
                <span>2,000 km</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Horas patrón de referencia (HUP):</span>
                <span>160 horas (8h útiles / 20 días)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Conclusión de Asignación de Recursos:</span>
                <span style={{ 
                  fontWeight: '600', 
                  color: kpiData.indicadores.indiceUtilizacion >= 100 ? 'var(--color-movimiento)' : 'var(--color-accent)'
                }}>
                  {kpiData.indicadores.indiceUtilizacion >= 100 
                    ? 'El vehículo justifica su asignación exclusiva en este sector.' 
                    : 'Recomendable transferir temporalmente la unidad a la "Flota de Uso Común".'}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
