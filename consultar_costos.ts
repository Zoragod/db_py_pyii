// =============================================================================
// consultar_costos.ts — Ejemplo: Consultas analíticas del módulo financiero
// Demuestra agregaciones, groupBy y cálculo de KPIs de costo mensual.
// Uso: npm run costos
// =============================================================================

import prisma from './db'

async function main(): Promise<void> {
  console.log('=== Consultas de Costos y KPIs ===\n')

  // ── 1. Costo total de combustible por vehículo (todos los períodos) ──
  console.log('── 1. Ranking de consumo de combustible por vehículo ─────────')
  const rankingCombustible = await prisma.controlMensualCosto.groupBy({
    by: ['codigoVehiculo'],
    _sum:  { costoTotalCombustible: true },
    _avg:  { costoPorKilometro: true },
    _count: { idControlMensual: true },
    orderBy: { _sum: { costoTotalCombustible: 'desc' } },
  })

  if (rankingCombustible.length === 0) {
    console.log('  Sin datos de control mensual aún.\n')
  } else {
    for (const r of rankingCombustible) {
      console.log(
        `  ${r.codigoVehiculo}` +
        ` | Combustible total: S/ ${Number(r._sum.costoTotalCombustible ?? 0).toFixed(2)}` +
        ` | Costo/km prom.: S/ ${Number(r._avg.costoPorKilometro ?? 0).toFixed(4)}` +
        ` | Períodos: ${r._count.idControlMensual}`,
      )
    }
    console.log()
  }

  // ── 2. Resumen de OS por tipo de mantenimiento ───────────────────────
  console.log('── 2. Órdenes de Servicio por tipo de mantenimiento ──────────')
  const osPorTipo = await prisma.ordenServicioTaller.groupBy({
    by: ['tipoMantenimiento'],
    _count: { numeroOs: true },
    orderBy: { _count: { numeroOs: 'desc' } },
  })

  if (osPorTipo.length === 0) {
    console.log('  Sin órdenes de servicio registradas.\n')
  } else {
    for (const t of osPorTipo) {
      const barra = '█'.repeat(t._count.numeroOs)
      console.log(`  ${t.tipoMantenimiento.padEnd(15)} ${barra} (${t._count.numeroOs})`)
    }
    console.log()
  }

  // ── 3. Top 5 repuestos más utilizados (por cantidad total) ───────────
  console.log('── 3. Top 5 repuestos más utilizados ─────────────────────────')
  const topRepuestos = await prisma.detalleSolicitudMaterial.groupBy({
    by: ['codigoRepuesto'],
    _sum:   { cantidad: true, costoTotalRepuesto: true },
    _count: { idDetalle: true },
    orderBy: { _sum: { cantidad: 'desc' } },
    take: 5,
  })

  if (topRepuestos.length === 0) {
    console.log('  Sin despachos de materiales registrados.\n')
  } else {
    for (const rep of topRepuestos) {
      const detalle = await prisma.repuestoAlmacen.findUnique({
        where: { codigoRepuesto: rep.codigoRepuesto },
        select: { descripcion: true },
      })
      console.log(
        `  [${rep.codigoRepuesto}] ${(detalle?.descripcion ?? 'N/D').substring(0, 40).padEnd(40)}` +
        ` | Cant: ${Number(rep._sum.cantidad ?? 0).toFixed(1)}` +
        ` | Total: S/ ${Number(rep._sum.costoTotalRepuesto ?? 0).toFixed(2)}`,
      )
    }
    console.log()
  }

  // ── 4. Movimientos de la semana actual ───────────────────────────────
  console.log('── 4. Movimientos registrados en los últimos 7 días ──────────')
  const hace7dias = new Date()
  hace7dias.setDate(hace7dias.getDate() - 7)

  const movimientosRecientes = await prisma.movimientoDiario.findMany({
    where: { fechaMovimiento: { gte: hace7dias } },
    include: {
      vehiculo:  { select: { placaRodaje: true, marca: true } },
      conductor: { select: { nombreConductor: true } },
    },
    orderBy: { fechaMovimiento: 'desc' },
    take: 10,
  })

  if (movimientosRecientes.length === 0) {
    console.log('  Sin movimientos en los últimos 7 días.\n')
  } else {
    for (const m of movimientosRecientes) {
      const km = m.kmLlegada !== null
        ? (Number(m.kmLlegada) - Number(m.kmSalida)).toFixed(1) + ' km'
        : 'en curso'
      console.log(
        `  ${m.fechaMovimiento.toLocaleDateString('es-PE')}` +
        ` | ${m.vehiculo.placaRodaje}` +
        ` | ${m.conductor.nombreConductor.split(' ')[0].padEnd(10)}` +
        ` | ${m.destino.substring(0, 30).padEnd(30)}` +
        ` | ${km}`,
      )
    }
  }

  console.log('\n[DONE] Consulta de costos finalizada.')
}

main()
  .catch((e: Error) => {
    console.error('[ERROR]', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
