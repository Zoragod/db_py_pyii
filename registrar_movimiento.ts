// =============================================================================
// registrar_movimiento.ts — Ejemplo: Registrar un movimiento diario completo
// Crea un MovimientoDiario y su OrdenAbastecimiento asociada usando transacción.
// Uso: npm run movimiento
// =============================================================================

import prisma from './db'
import { Decimal } from './generated/prisma/runtime/library'

async function main(): Promise<void> {
  console.log('Registrando movimiento diario...\n')

  // Datos del movimiento
  const codigoVehiculo     = 'VH-001'
  const matriculaConductor = 'COND-001'
  const idServicentro      = 1

  // ── Transacción: movimiento + abastecimiento atómicos ──────────────────
  const resultado = await prisma.$transaction(async (tx) => {
    // 1. Crear el movimiento diario
    const movimiento = await tx.movimientoDiario.create({
      data: {
        codigoVehiculo,
        matriculaConductor,
        fechaMovimiento: new Date('2026-06-05'),
        horaSalida:      new Date('1970-01-01T08:00:00Z'),
        horaLlegada:     new Date('1970-01-01T14:30:00Z'),
        kmSalida:        new Decimal('45230.00'),
        kmLlegada:       new Decimal('45430.50'),
        destino:         'Obra Vial Av. Universitaria — Comas',
      },
    })

    // 2. Registrar el abastecimiento de combustible
    const orden = await tx.ordenAbastecimiento.create({
      data: {
        idMovimiento:       movimiento.idMovimiento,
        idServicentro,
        tipoCombustible:    'Gasolina 95',
        galonesAbastecidos: new Decimal('12.500'),
        kilometrajeActual:  new Decimal('45230.00'),
      },
    })

    return { movimiento, orden }
  })

  const km =
    Number(resultado.movimiento.kmLlegada) -
    Number(resultado.movimiento.kmSalida)

  console.log('  [OK] Movimiento registrado:')
  console.log(`    ID Movimiento : ${resultado.movimiento.idMovimiento}`)
  console.log(`    Vehículo      : ${codigoVehiculo}`)
  console.log(`    Conductor     : ${matriculaConductor}`)
  console.log(`    Destino       : ${resultado.movimiento.destino}`)
  console.log(`    KM recorridos : ${km.toFixed(2)} km`)
  console.log()
  console.log('  [OK] Abastecimiento registrado:')
  console.log(`    Nro. Orden    : ${resultado.orden.numeroOrden}`)
  console.log(`    Combustible   : ${resultado.orden.tipoCombustible}`)
  console.log(`    Galones       : ${resultado.orden.galonesAbastecidos}`)
}

main()
  .catch((e: Error) => {
    console.error('[ERROR]', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
