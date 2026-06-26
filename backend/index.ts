// =============================================================================
// index.ts — Punto de entrada principal
// Demuestra la conexión y operaciones básicas sobre la base de datos.
// =============================================================================

import prisma from './db'

async function main(): Promise<void> {
  console.log('=== Sistema de Administración de Flotas Vehiculares ===\n')

  // ── 1. Ping de conexión ──────────────────────────────────────────────────
  await prisma.$queryRaw`SELECT 1`
  console.log('[OK] Conexión a PostgreSQL establecida.\n')

  // ── 2. Resumen de registros por módulo ───────────────────────────────────
  const [
    sectores,
    conductores,
    vehiculos,
    movimientos,
    ordenesServicio,
    controlMensual,
  ] = await Promise.all([
    prisma.sectorSolicitante.count(),
    prisma.conductor.count(),
    prisma.vehiculo.count(),
    prisma.movimientoDiario.count(),
    prisma.ordenServicioTaller.count(),
    prisma.controlMensualCosto.count(),
  ])

  console.log('── Resumen de la base de datos ──────────────────────────────')
  console.log(`  Sectores Solicitantes : ${sectores}`)
  console.log(`  Conductores           : ${conductores}`)
  console.log(`  Vehículos             : ${vehiculos}`)
  console.log(`  Movimientos Diarios   : ${movimientos}`)
  console.log(`  Órdenes de Servicio   : ${ordenesServicio}`)
  console.log(`  Controles Mensuales   : ${controlMensual}`)
  console.log('─────────────────────────────────────────────────────────────\n')

  // ── 3. Ejemplo: vehículos con su sector y últimos movimientos ────────────
  if (vehiculos > 0) {
    const flota = await prisma.vehiculo.findMany({
      include: {
        sector: true,
        movimientos: {
          orderBy: { fechaMovimiento: 'desc' },
          take: 1,
        },
      },
      take: 5,
    })

    console.log('── Últimos movimientos por vehículo ─────────────────────────')
    for (const v of flota) {
      const ultimo = v.movimientos[0]
      console.log(
        `  [${v.codigoVehiculo}] ${v.marca} ${v.modelo} | Sector: ${v.sector.nombreSector}`,
      )
      if (ultimo) {
        const km =
          ultimo.kmLlegada !== null
            ? Number(ultimo.kmLlegada) - Number(ultimo.kmSalida)
            : 0
        console.log(
          `    └─ Último viaje: ${ultimo.fechaMovimiento.toLocaleDateString('es-PE')} → ${ultimo.destino} (${km.toFixed(1)} km)`,
        )
      } else {
        console.log('    └─ Sin movimientos registrados.')
      }
    }
    console.log()
  }

  // ── 4. Ejemplo: costos mensuales consolidados ────────────────────────────
  if (controlMensual > 0) {
    const costos = await prisma.controlMensualCosto.findMany({
      orderBy: [{ anioReferencia: 'desc' }, { mesReferencia: 'desc' }],
      include: { vehiculo: { select: { placaRodaje: true, marca: true } } },
      take: 5,
    })

    console.log('── Últimos cierres mensuales ─────────────────────────────────')
    for (const c of costos) {
      console.log(
        `  ${String(c.mesReferencia).padStart(2, '0')}/${c.anioReferencia}` +
          ` | ${c.vehiculo.placaRodaje} (${c.vehiculo.marca})` +
          ` | Combustible: S/ ${Number(c.costoTotalCombustible).toFixed(2)}` +
          ` | Costo/km: S/ ${Number(c.costoPorKilometro).toFixed(4)}`,
      )
    }
    console.log()
  }

  console.log('[OK] Proceso finalizado correctamente.')
}

main()
  .catch((error: Error) => {
    console.error('[ERROR]', error.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
