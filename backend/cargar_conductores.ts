// =============================================================================
// cargar_conductores.ts — Seed: Conductores
// Registra el personal habilitado para conducir los vehículos de la flota.
// Uso: npm run seed:conductores
// =============================================================================

import prisma from './db'

const conductores = [
  { matriculaConductor: 'COND-001', nombreConductor: 'Carlos Alberto Ríos Mendoza',    documentoIdentidad: '10234567' },
  { matriculaConductor: 'COND-002', nombreConductor: 'Jorge Luis Paredes Huanca',      documentoIdentidad: '20345678' },
  { matriculaConductor: 'COND-003', nombreConductor: 'María Elena Tafur Sánchez',      documentoIdentidad: '30456789' },
  { matriculaConductor: 'COND-004', nombreConductor: 'Pedro Antonio Ccoa Vilca',       documentoIdentidad: '40567890' },
  { matriculaConductor: 'COND-005', nombreConductor: 'Rosa Isabel Chávez Pumacahua',   documentoIdentidad: '50678901' },
  { matriculaConductor: 'COND-006', nombreConductor: 'Luis Fernando Apaza Condori',    documentoIdentidad: '60789012' },
  { matriculaConductor: 'COND-007', nombreConductor: 'Ana Lucía Quiroga Mamani',       documentoIdentidad: '70890123' },
  { matriculaConductor: 'COND-008', nombreConductor: 'Manuel Jesús Quispe Flores',     documentoIdentidad: '80901234' },
  { matriculaConductor: 'COND-009', nombreConductor: 'Sandra Patricia Medina Correa',  documentoIdentidad: '90012345' },
  { matriculaConductor: 'COND-010', nombreConductor: 'Roberto Carlos Lazo Palomino',   documentoIdentidad: '01123456' },
]

async function main(): Promise<void> {
  console.log('Cargando conductores...\n')

  const resultado = await prisma.conductor.createMany({
    data: conductores,
    skipDuplicates: true,
  })

  console.log(`  [OK] Conductores procesados: ${resultado.count} creados.`)
  console.log(`  [=]  Duplicados omitidos: ${conductores.length - resultado.count}.`)
}

main()
  .catch((e: Error) => {
    console.error('[ERROR]', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
