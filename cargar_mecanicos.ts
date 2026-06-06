// =============================================================================
// cargar_mecanicos.ts — Seed: Mecánicos, Talleres, Servicentros y Repuestos
// Carga los catálogos auxiliares del módulo de mantenimiento.
// Uso: npm run seed:mecanicos
// =============================================================================

import prisma from './db'
import { Decimal } from './generated/prisma/runtime/library'

async function main(): Promise<void> {
  console.log('Cargando catálogos de mantenimiento...\n')

  // ── Mecánicos ──────────────────────────────────────────────────────────
  console.log('  → Mecánicos')
  await prisma.mecanico.createMany({
    data: [
      { matriculaMecanico: 'MEC-001', nombreMecanico: 'Héctor Guillermo Soto Prada'      },
      { matriculaMecanico: 'MEC-002', nombreMecanico: 'Elvis Rolando Mamani Turpo'        },
      { matriculaMecanico: 'MEC-003', nombreMecanico: 'José Alfredo Condori Quispe'       },
      { matriculaMecanico: 'MEC-004', nombreMecanico: 'Gilberto Ramos Huillca'            },
      { matriculaMecanico: 'MEC-005', nombreMecanico: 'César Augusto Flores Vargas'       },
    ],
    skipDuplicates: true,
  })
  console.log('    [OK] Mecánicos cargados.')

  // ── Servicentros Acreditados ───────────────────────────────────────────
  console.log('  → Servicentros acreditados')
  await prisma.servicentroAcreditado.createMany({
    data: [
      { nombreServicentro: 'Primax Av. Javier Prado'          },
      { nombreServicentro: 'Repsol La Marina'                  },
      { nombreServicentro: 'Petroperú Carretera Central Km 10' },
      { nombreServicentro: 'Gulf Panamericana Sur'             },
    ],
    skipDuplicates: true,
  })
  console.log('    [OK] Servicentros cargados.')

  // ── Repuestos de Almacén ───────────────────────────────────────────────
  console.log('  → Repuestos de almacén')
  await prisma.repuestoAlmacen.createMany({
    data: [
      { codigoRepuesto: 'REP-FIL-001', descripcion: 'Filtro de aceite Sakura C-1809',          costoUnitario: new Decimal('18.50')  },
      { codigoRepuesto: 'REP-FIL-002', descripcion: 'Filtro de aire Baldwin PA2654',            costoUnitario: new Decimal('45.00')  },
      { codigoRepuesto: 'REP-FIL-003', descripcion: 'Filtro combustible diésel Donaldson',      costoUnitario: new Decimal('62.00')  },
      { codigoRepuesto: 'REP-ACE-001', descripcion: 'Aceite motor 15W40 API CI-4 (galón)',      costoUnitario: new Decimal('38.00')  },
      { codigoRepuesto: 'REP-FRE-001', descripcion: 'Pastillas de freno delanteras (par)',       costoUnitario: new Decimal('95.00')  },
      { codigoRepuesto: 'REP-FRE-002', descripcion: 'Disco de freno ventilado 300mm',            costoUnitario: new Decimal('220.00') },
      { codigoRepuesto: 'REP-COR-001', descripcion: 'Correa poly-V 6PK1560',                    costoUnitario: new Decimal('55.00')  },
      { codigoRepuesto: 'REP-BAT-001', descripcion: 'Batería Bosch S4 12V 60Ah',                costoUnitario: new Decimal('340.00') },
      { codigoRepuesto: 'REP-BUJ-001', descripcion: 'Bujía NGK BKR6E (unidad)',                 costoUnitario: new Decimal('12.00')  },
      { codigoRepuesto: 'REP-LIQ-001', descripcion: 'Líquido de frenos DOT 4 (500ml)',           costoUnitario: new Decimal('22.00')  },
    ],
    skipDuplicates: true,
  })
  console.log('    [OK] Repuestos cargados.')

  // ── Llantas / Conjuntos ────────────────────────────────────────────────
  console.log('  → Llantas y conjuntos')
  await prisma.llantaOConjunto.createMany({
    data: [
      { numeroFabrica: 'LLA-BRG-001', fabricante: 'Bridgestone', dimension: '265/70 R17',   modelo: 'Dueler H/T D689', tipoElemento: 'Llanta'       },
      { numeroFabrica: 'LLA-MIC-001', fabricante: 'Michelin',    dimension: '295/80 R22.5', modelo: 'X Multi Energy', tipoElemento: 'Llanta'        },
      { numeroFabrica: 'LLA-GDY-001', fabricante: 'Goodyear',    dimension: '215/75 R17.5', modelo: 'Marathon LHD II', tipoElemento: 'Llanta'       },
      { numeroFabrica: 'LLA-PIR-001', fabricante: 'Pirelli',     dimension: '235/65 R17',   modelo: 'Scorpion ATR',   tipoElemento: 'Llanta'        },
      { numeroFabrica: 'LLA-BRG-002', fabricante: 'Bridgestone', dimension: '295/80 R22.5', modelo: 'M788 Retread',   tipoElemento: 'Reencauchada'  },
    ],
    skipDuplicates: true,
  })
  console.log('    [OK] Llantas cargadas.')

  // ── Talleres Terceros ──────────────────────────────────────────────────
  console.log('  → Talleres externos')
  await prisma.tallerTerceros.createMany({
    data: [
      { nombreTaller: 'Tecnicar SAC',           datosComunicacion: 'Av. Argentina 3456, Lima | Tel: 01-4521100 | tecnicar@email.com'    },
      { nombreTaller: 'AutoServicio El Trebol',  datosComunicacion: 'Jr. Huancavelica 890, Callao | Tel: 01-5791234'                    },
      { nombreTaller: 'Diésel Perú EIRL',        datosComunicacion: 'Panamericana Norte Km 22 | Tel: 01-3456789 | diesel.peru@mail.pe'  },
    ],
    skipDuplicates: true,
  })
  console.log('    [OK] Talleres externos cargados.')

  console.log('\n[DONE] Todos los catálogos de mantenimiento fueron cargados.')
}

main()
  .catch((e: Error) => {
    console.error('[ERROR]', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
