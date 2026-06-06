// =============================================================================
// cargar_vehiculos.ts — Seed: Vehículos
// Registra el inventario de la flota vehicular.
// Requiere que los sectores ya existan (ejecutar seed:sectores primero).
// Uso: npm run seed:vehiculos
// =============================================================================

import prisma from './db'
import { Decimal } from './generated/prisma/runtime/library'

declare const console: {
  log: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
}

const vehiculos = [
  {
    codigoVehiculo: 'VH-001',
    placaRodaje:    'ABC-123',
    marca:          'Toyota',
    modelo:         'Hilux 4x4',
    anoFabricacion: 2020,
    capacidadCargaKg: new Decimal('1000.00'),
    idSectorAsignado: 1,
  },
  {
    codigoVehiculo: 'VH-002',
    placaRodaje:    'DEF-456',
    marca:          'Volkswagen',
    modelo:         'Constellation 17.250',
    anoFabricacion: 2019,
    capacidadCargaKg: new Decimal('8000.00'),
    idSectorAsignado: 2,
  },
  {
    codigoVehiculo: 'VH-003',
    placaRodaje:    'GHI-789',
    marca:          'Hyundai',
    modelo:         'H350 Furgón',
    anoFabricacion: 2021,
    capacidadCargaKg: new Decimal('1500.00'),
    idSectorAsignado: 3,
  },
  {
    codigoVehiculo: 'VH-004',
    placaRodaje:    'JKL-012',
    marca:          'Ford',
    modelo:         'Ranger XLS',
    anoFabricacion: 2022,
    capacidadCargaKg: new Decimal('900.00'),
    idSectorAsignado: 4,
  },
  {
    codigoVehiculo: 'VH-005',
    placaRodaje:    'MNO-345',
    marca:          'Mercedes-Benz',
    modelo:         'Atego 1726',
    anoFabricacion: 2018,
    capacidadCargaKg: new Decimal('6000.00'),
    idSectorAsignado: 5,
  },
  {
    codigoVehiculo: 'VH-006',
    placaRodaje:    'PQR-678',
    marca:          'Nissan',
    modelo:         'NP300 Frontier',
    anoFabricacion: 2023,
    capacidadCargaKg: new Decimal('800.00'),
    idSectorAsignado: 6,
  },
]

async function main(): Promise<void> {
  console.log('Cargando vehículos de la flota...\n')

  let creados = 0
  let errores = 0

  for (const v of vehiculos) {
    try {
      await prisma.vehiculo.create({ data: v })
      console.log(`  [+] ${v.codigoVehiculo} | ${v.placaRodaje} | ${v.marca} ${v.modelo} (${v.anoFabricacion})`)
      creados++
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log(`  [!] ${v.codigoVehiculo}: ${e.message.split('\n')[0]}`)
      }
      errores++
    }
  }

  console.log(`\nResumen: ${creados} vehículos cargados, ${errores} con error.`)
}

main()
  .catch((e: Error) => {
    console.error('[ERROR]', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
