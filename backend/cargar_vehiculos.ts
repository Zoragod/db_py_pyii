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
    valorAdquisicion: new Decimal('35000.00'),
    valorResidual:    new Decimal('7000.00'),
    vidaUtilAnos:     5,
  },
  {
    codigoVehiculo: 'VH-002',
    placaRodaje:    'DEF-456',
    marca:          'Volkswagen',
    modelo:         'Constellation 17.250',
    anoFabricacion: 2019,
    capacidadCargaKg: new Decimal('8000.00'),
    idSectorAsignado: 2,
    valorAdquisicion: new Decimal('85000.00'),
    valorResidual:    new Decimal('17000.00'),
    vidaUtilAnos:     10,
  },
  {
    codigoVehiculo: 'VH-003',
    placaRodaje:    'GHI-789',
    marca:          'Hyundai',
    modelo:         'H350 Furgón',
    anoFabricacion: 2021,
    capacidadCargaKg: new Decimal('1500.00'),
    idSectorAsignado: 3,
    valorAdquisicion: new Decimal('42000.00'),
    valorResidual:    new Decimal('8400.00'),
    vidaUtilAnos:     7,
  },
  {
    codigoVehiculo: 'VH-004',
    placaRodaje:    'JKL-012',
    marca:          'Ford',
    modelo:         'Ranger XLS',
    anoFabricacion: 2022,
    capacidadCargaKg: new Decimal('900.00'),
    idSectorAsignado: 4,
    valorAdquisicion: new Decimal('38000.00'),
    valorResidual:    new Decimal('9500.00'),
    vidaUtilAnos:     5,
  },
  {
    codigoVehiculo: 'VH-005',
    placaRodaje:    'MNO-345',
    marca:          'Mercedes-Benz',
    modelo:         'Atego 1726',
    anoFabricacion: 2018,
    capacidadCargaKg: new Decimal('6000.00'),
    idSectorAsignado: 5,
    valorAdquisicion: new Decimal('78000.00'),
    valorResidual:    new Decimal('15600.00'),
    vidaUtilAnos:     10,
  },
  {
    codigoVehiculo: 'VH-006',
    placaRodaje:    'PQR-678',
    marca:          'Nissan',
    modelo:         'NP300 Frontier',
    anoFabricacion: 2023,
    capacidadCargaKg: new Decimal('800.00'),
    idSectorAsignado: 6,
    valorAdquisicion: new Decimal('32000.00'),
    valorResidual:    new Decimal('8000.00'),
    vidaUtilAnos:     5,
  },
]

async function main(): Promise<void> {
  console.log('Cargando vehículos de la flota...\n')

  let creados = 0
  let errores = 0

  for (const v of vehiculos) {
    try {
      // 1. Crear o actualizar el vehículo (upsert)
      await prisma.vehiculo.upsert({
        where: { codigoVehiculo: v.codigoVehiculo },
        update: {
          valorAdquisicion: v.valorAdquisicion,
          valorResidual: v.valorResidual,
          vidaUtilAnos: v.vidaUtilAnos,
          idSectorAsignado: v.idSectorAsignado,
        },
        create: v,
      })

      // 2. Crear asignación de sector inicial (histórico) si no existe ya
      const historialExiste = await prisma.historialAsignacionSector.findFirst({
        where: { codigoVehiculo: v.codigoVehiculo },
      })

      if (!historialExiste) {
        await prisma.historialAsignacionSector.create({
          data: {
            codigoVehiculo: v.codigoVehiculo,
            idSector: v.idSectorAsignado,
            fechaInicio: new Date(`${v.anoFabricacion}-01-01`),
          },
        })
      }

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
