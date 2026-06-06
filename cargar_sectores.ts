// =============================================================================
// cargar_sectores.ts — Seed: Sectores Solicitantes
// Carga los sectores/dependencias que pueden solicitar vehículos de la flota.
// Uso: npm run seed:sectores
// =============================================================================

import prisma from './db'

const sectores = [
  { nombreSector: 'Gerencia General',          localidad: 'Lima Centro'    },
  { nombreSector: 'Obras Públicas',             localidad: 'Lima Norte'     },
  { nombreSector: 'Logística y Almacenes',      localidad: 'Callao'         },
  { nombreSector: 'Salud y Bienestar Social',   localidad: 'Lima Sur'       },
  { nombreSector: 'Seguridad Ciudadana',        localidad: 'Lima Este'      },
  { nombreSector: 'Medio Ambiente y Limpieza',  localidad: 'Lima Centro'    },
  { nombreSector: 'Serenazgo',                  localidad: 'Lima Norte'     },
  { nombreSector: 'Administración Tributaria',  localidad: 'San Isidro'     },
]

async function main(): Promise<void> {
  console.log('Cargando sectores solicitantes...\n')

  let creados = 0
  let omitidos = 0

  for (const sector of sectores) {
    try {
      await prisma.sectorSolicitante.create({ data: sector })
      console.log(`  [+] ${sector.nombreSector} (${sector.localidad})`)
      creados++
    } catch {
      console.log(`  [=] Ya existe: ${sector.nombreSector}`)
      omitidos++
    }
  }

  console.log(`\nResumen: ${creados} creados, ${omitidos} omitidos.`)
}

main()
  .catch((e: Error) => {
    console.error('[ERROR]', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
