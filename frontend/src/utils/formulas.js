/**
 * utils/formulas.js
 * 
 * Contiene los motores matemáticos del manual de administración de flotas.
 */

/**
 * Calcula la Depreciación Mensual (D)
 * Ecuación 2: D = (1 / 12) * ((V - R) / N)
 * 
 * @param {number} V - Valor del vehículo nuevo
 * @param {number} R - Valor residual al final de N años (típicamente 10% - 20% de V)
 * @param {number} N - Vida útil en años
 * @returns {number} Depreciación mensual
 */
export function calcularDepreciacionMensual(V, R, N) {
  if (!N || N <= 0) return 0;
  return (1 / 12) * ((V - R) / N);
}

/**
 * Calcula la Remuneración Mensual del Capital (C)
 * Ecuación 6 (Simplificada con R = 0): C = (J * (N + 1) * V) / (2 * N)
 * 
 * @param {number} J - Tasa de interés mensual (ej. 0.01 para 1%)
 * @param {number} N - Vida útil en años
 * @param {number} V - Valor del vehículo nuevo
 * @returns {number} Remuneración mensual del capital
 */
export function calcularRemuneracionCapital(J, N, V) {
  if (!N || N <= 0) return 0;
  return (J * (N + 1) * V) / (2 * N);
}

/**
 * Calcula el Índice de Utilización del Vehículo (IUV)
 * Ecuación 10: IUV = ( (KRV / KRP) + (HUV / HUP) ) / 2
 * 
 * @param {number} KRV - Kilometraje Recorrido por el Vehículo en el período
 * @param {number} KRP - Kilometraje Recorrido Parámetro (Referencia esperada)
 * @param {number} HUV - Horas de Utilización del Vehículo en el período
 * @param {number} HUP - Horas de Utilización Parámetro (Referencia esperada)
 * @returns {number} Porcentaje de utilización (ej. 1.12 para 112%, < 1 indica subutilización)
 */
export function calcularIUV(KRV, KRP, HUV, HUP) {
  if (!KRP || !HUP) return 0;
  const ratioKM = KRV / KRP;
  const ratioHoras = HUV / HUP;
  return (ratioKM + ratioHoras) / 2;
}

/**
 * Calcula el Costo por Kilómetro de Operación (CKV)
 * Ecuación 1: CKV = ((CFP + CFV) / K) + CVV
 * 
 * @param {number} CFP - Costo Fijo Prorrateable mensual (personal admin, oficina, etc.)
 * @param {number} CFV - Costo Fijo del Vehículo mensual (depreciación, seguro, impuestos)
 * @param {number} K - Kilómetros recorridos en el mes
 * @param {number} CVV - Costo Variable del Vehículo por kilómetro (combustible, repuestos, llantas)
 * @returns {number} Costo por kilómetro recorrido
 */
export function calcularCostoPorKilometro(CFP, CFV, K, CVV) {
  if (!K || K <= 0) return CVV; // Si no rodó, el costo por km tiende al costo variable unitario
  return ((CFP + CFV) / K) + CVV;
}

/**
 * Calcula el Costo Promedio Anual (CPA) para el año n
 * Ecuación 11: Cpa = (V + Sum(CC) - R) / n
 * 
 * @param {number} V - Valor del vehículo nuevo
 * @param {Array<number>} costosConservacion - Lista de costos acumulados año por año (índice 0 = año 1)
 * @param {number} n - Año de evaluación (1-indexed)
 * @param {number} R - Valor de reventa en el año n
 * @returns {number} Costo promedio anual acumulado hasta el año n
 */
export function calcularCostoPromedioAnual(V, costosConservacion, n, R) {
  if (!n || n <= 0) return 0;
  // Sumatoria de costos de conservación hasta el año n
  const sumCC = costosConservacion.slice(0, n).reduce((sum, cost) => sum + cost, 0);
  return (V + sumCC - R) / n;
}

/**
 * Calcula la curva óptima de sustitución basada en el historial de costos de conservación
 * y el valor de reventa decreciente.
 * Encuentra el año n donde el CPA es MÍNIMO.
 * 
 * @param {number} V - Valor de adquisición
 * @param {Array<number>} costosConservacionAnuales - Costo de conservación de cada año
 * @param {Array<number>} valoresReventaAnuales - Valor de reventa al final de cada año
 * @returns {Object} { curvaCPA: Array<number>, anioOptimo: number }
 */
export function obtenerCurvaSustitucion(V, costosConservacionAnuales, valoresReventaAnuales) {
  const curvaCPA = [];
  let minCPA = Infinity;
  let anioOptimo = 1;

  for (let i = 0; i < costosConservacionAnuales.length; i++) {
    const año = i + 1;
    const reventa = valoresReventaAnuales[i] ?? 0;
    const cpa = calcularCostoPromedioAnual(V, costosConservacionAnuales, año, reventa);
    curvaCPA.push({ ano: año, cpa: Number(cpa.toFixed(2)), reventa, mantenimiento: costosConservacionAnuales[i] });

    if (cpa < minCPA) {
      minCPA = cpa;
      anioOptimo = año;
    }
  }

  return { curvaCPA, anioOptimo };
}
