import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { useAuth } from '../context/AuthContext';
import { obtenerCurvaSustitucion } from '../utils/formulas';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  ReferenceLine 
} from 'recharts';
import { 
  TrendingUp, 
  Fuel, 
  Wrench, 
  DollarSign, 
  HelpCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export default function Dashboard() {
  const { vehiculos, getControlMensual, movimientos, ordenesServicioTaller } = useFleet();
  const { roleInfo } = useAuth();
  
  const [selectedMonth, setSelectedMonth] = useState('06');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [substitutionVehicle, setSubstitutionVehicle] = useState(vehiculos[0]?.codigo_vehiculo || '');

  // Auto-select first loaded item from database
  React.useEffect(() => {
    if (vehiculos.length > 0 && (!substitutionVehicle || !vehiculos.some(v => v.codigo_vehiculo === substitutionVehicle))) {
      setSubstitutionVehicle(vehiculos[0].codigo_vehiculo);
    }
  }, [vehiculos, substitutionVehicle]);

  // Compilar datos consolidados mensuales para todos los vehículos
  const monthlyData = vehiculos.map(v => {
    return getControlMensual(v.codigo_vehiculo, selectedMonth, selectedYear);
  }).filter(Boolean);

  // Totales agregados para las tarjetas superiores
  const totalKMs = monthlyData.reduce((sum, d) => sum + d.total_kilometros_recorridos, 0);
  const totalFuelCost = monthlyData.reduce((sum, d) => sum + d.costo_total_combustible, 0);
  const totalMaintCost = monthlyData.reduce((sum, d) => sum + d.costo_mano_obra_propio + d.costo_repuestos_propio + d.costo_talleres_terceros, 0);
  const avgCKV = monthlyData.length > 0 
    ? monthlyData.reduce((sum, d) => sum + d.costo_por_kilometro, 0) / monthlyData.length 
    : 0;

  // Simulación de costos acumulados anuales para la Curva de Sustitución (CPA) del vehículo seleccionado
  const selectedVehicleObj = vehiculos.find(v => v.codigo_vehiculo === substitutionVehicle);
  
  // Datos simulados históricos de mantenimiento y valor de reventa decreciente según el modelo de auto
  const getSustitucionData = () => {
    if (!selectedVehicleObj) return { curvaCPA: [], anioOptimo: 0 };
    const val = selectedVehicleObj.valor_nuevo;
    // Mantenimiento aumenta año con año
    const factorManto = selectedVehicleObj.modelo.includes('Pesada') ? 3000 : 800;
    const costosMantoAnuales = [
      factorManto * 0.6,
      factorManto * 1.2,
      factorManto * 1.8,
      factorManto * 2.5,
      factorManto * 4.0,
      factorManto * 6.0,
      factorManto * 8.5,
      factorManto * 11.0
    ];
    // Reventa decrece
    const valoresReventaAnuales = [
      val * 0.80,
      val * 0.65,
      val * 0.52,
      val * 0.41,
      val * 0.32,
      val * 0.25,
      val * 0.18,
      val * 0.12
    ];
    return obtenerCurvaSustitucion(val, costosMantoAnuales, valoresReventaAnuales);
  };

  const { curvaCPA, anioOptimo } = getSustitucionData();

  return (
    <div className="space-y-8">
      {/* Title & Filter bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-850">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Panel de Control Gerencial</h1>
          <p className="text-xs text-slate-400 mt-1">
            Consolidado estadístico mensual, costos operativos (CKV) y utilización (IUV).
          </p>
        </div>
        
        {/* Month/Year Filters */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-350 font-semibold cursor-pointer"
          >
            <option value="01">Enero</option>
            <option value="02">Febrero</option>
            <option value="03">Marzo</option>
            <option value="04">Abril</option>
            <option value="05">Mayo</option>
            <option value="06">Junio</option>
            <option value="07">Julio</option>
            <option value="08">Agosto</option>
            <option value="09">Setiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-350 font-semibold cursor-pointer"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* Grid of Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: CKV */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Costo Promedio / KM</span>
            <div className="text-xl font-bold text-slate-100">${avgCKV.toFixed(3)} <span className="text-xs text-slate-500 font-medium">/ km</span></div>
            <span className="text-[9px] text-emerald-500 font-bold block flex items-center gap-0.5">
              <TrendingUp size={10} /> Consolidado CKV
            </span>
          </div>
          <div className="bg-blue-600/10 text-blue-400 p-3 rounded-xl border border-blue-500/20">
            <DollarSign size={20} />
          </div>
        </div>

        {/* Card 2: KMs Recorridos */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recorrido Total</span>
            <div className="text-xl font-bold text-slate-100">{totalKMs.toLocaleString()} <span className="text-xs text-slate-500 font-medium">km</span></div>
            <span className="text-[9px] text-slate-400 font-medium block">De todos los vehículos activos</span>
          </div>
          <div className="bg-indigo-600/10 text-indigo-400 p-3 rounded-xl border border-indigo-500/20">
            <TrendingUp size={20} />
          </div>
        </div>

        {/* Card 3: Combustible */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gasto Combustible</span>
            <div className="text-xl font-bold text-slate-100">${totalFuelCost.toFixed(2)}</div>
            <span className="text-[9px] text-slate-400 font-medium block">Autorizaciones aprobadas</span>
          </div>
          <div className="bg-emerald-600/10 text-emerald-400 p-3 rounded-xl border border-emerald-500/20">
            <Fuel size={20} />
          </div>
        </div>

        {/* Card 4: Mantenimiento */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gasto Mantenimiento</span>
            <div className="text-xl font-bold text-slate-100">${totalMaintCost.toFixed(2)}</div>
            <span className="text-[9px] text-slate-400 font-medium block">Taller propio e insumos</span>
          </div>
          <div className="bg-amber-600/10 text-amber-400 p-3 rounded-xl border border-amber-500/20">
            <Wrench size={20} />
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: IUV - Indice de Utilización del Vehículo */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Índice de Utilización de Vehículos (IUV)</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Estadística de uso (Km y Horas). Referencia óptima = 1.0 (100%). Valores menor a 1 indican subutilización.
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="placa" stroke="#64748b" fontSize={10} fontWeight="bold" />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 2]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <ReferenceLine y={1.0} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "Referencia", fill: "#ef4444", fontSize: 9, position: 'top' }} />
                <Bar name="IUV Mensual" dataKey="iuv" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Costo por Kilómetro Desglosado */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Desglose de Costos de Operación ($)</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Comparativo mensual de gastos de combustible vs repuestos/taller.
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="placa" stroke="#64748b" fontSize={10} fontWeight="bold" />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar name="Combustible" dataKey="costo_total_combustible" stackId="costs" fill="#10b981" />
                <Bar name="Mano Obra Propia" dataKey="costo_mano_obra_propio" stackId="costs" fill="#f59e0b" />
                <Bar name="Repuestos Propios" dataKey="costo_repuestos_propio" stackId="costs" fill="#a855f7" />
                <Bar name="Talleres Externos" dataKey="costo_talleres_terceros" stackId="costs" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Curva de Sustitución Gerencial */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Curva de Sustitución Óptima (Costo Promedio Anual)</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Simulador algorítmico del ciclo de vida del vehículo. Resuelve la ecuación: Cpa = (V + Sum(CC) - R) / n.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Seleccionar Vehículo:</span>
            <select
              value={substitutionVehicle}
              onChange={(e) => setSubstitutionVehicle(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-350 font-semibold cursor-pointer"
            >
              {vehiculos.map(v => (
                <option key={v.codigo_vehiculo} value={v.codigo_vehiculo}>
                  {v.placa_rodaje} ({v.marca} {v.modelo})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedVehicleObj ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Chart */}
            <div className="lg:col-span-2 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={curvaCPA} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="ano" stroke="#64748b" fontSize={10} name="Años" />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line name="Costo Promedio Anual (CPA)" type="monotone" dataKey="cpa" stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 8 }} />
                  <Line name="Valor de Reventa" type="monotone" dataKey="reventa" stroke="#10b981" strokeWidth={1.5} strokeDasharray="3 3" />
                  <Line name="Gasto Mantenimiento Anual" type="monotone" dataKey="mantenimiento" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="3 3" />
                  <ReferenceLine x={anioOptimo} stroke="#f59e0b" strokeWidth={2} label={{ value: "Óptimo", fill: "#f59e0b", fontSize: 9, position: 'top' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Analysis sidebar card */}
            <div className="bg-slate-950/50 rounded-xl p-5 border border-slate-800/80 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <AlertTriangle size={16} />
                <span>ANÁLISIS DE SUSTITUCIÓN</span>
              </div>
              <p className="text-[11px] text-slate-350 leading-relaxed">
                Según las curvas de depreciación y el incremento del costo anual de conservación del vehículo seleccionado, el momento idóneo para cesar el mantenimiento y proceder con la <strong>sustitución</strong> es el:
              </p>
              
              <div className="bg-amber-600/10 border border-amber-500/20 rounded-lg p-3 text-center">
                <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">AÑO RECOMENDADO</div>
                <div className="text-2xl font-black text-amber-400 mt-1">{anioOptimo}º Año</div>
                <div className="text-[9px] text-slate-400 mt-1">
                  CPA Mínimo estimado: ${curvaCPA[anioOptimo-1]?.cpa.toLocaleString()}
                </div>
              </div>

              <div className="text-[9px] text-slate-500 leading-tight">
                *Nota: A partir del {anioOptimo + 1}º año, el costo acumulado de mantenimiento correctivo supera la pérdida de valor por depreciación, encareciendo el costo global operativo de la EPS.
              </div>
            </div>
          </div>
        ) : (
          <div className="text-slate-400 text-xs py-10 text-center">No hay vehículos registrados para simular.</div>
        )}
      </div>
    </div>
  );
}
