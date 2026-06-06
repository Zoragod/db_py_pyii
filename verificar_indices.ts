import { PrismaClient } from './generated/prisma'
const prisma = new PrismaClient()

async function main() {
  // ── 1. Todos los índices creados por Prisma ──────────────────────────────
  const indices: Array<{indice: string, tabla: string, definicion: string}> =
    await prisma.$queryRaw`
      SELECT
        indexname  AS indice,
        tablename  AS tabla,
        indexdef   AS definicion
      FROM   pg_indexes
      WHERE  schemaname = 'public'
      ORDER  BY tablename, indexname
    `

  console.log('\n══════════════════════════════════════════════════════════════')
  console.log('  TODOS LOS ÍNDICES EN LA BASE DE DATOS dbpyii')
  console.log('══════════════════════════════════════════════════════════════')

  let pkCount   = 0
  let idxCount  = 0
  let uqCount   = 0

  for (const idx of indices) {
    const def = idx.definicion.toUpperCase()
    let tipo = '  IDX'
    if (def.includes('PRIMARY KEY')) { tipo = '  🔑 PK '; pkCount++ }
    else if (def.includes('UNIQUE'))  { tipo = '  🔒 UQ '; uqCount++ }
    else                              { tipo = '  📊 IDX'; idxCount++ }

    console.log(`${tipo} | ${idx.tabla.padEnd(35)} | ${idx.indice}`)
  }

  console.log('──────────────────────────────────────────────────────────────')
  console.log(`  PKs: ${pkCount}  |  Índices B-Tree: ${idxCount}  |  Únicos: ${uqCount}`)
  console.log('══════════════════════════════════════════════════════════════\n')

  // ── 2. Verificar los 9 índices B-Tree del proyecto ───────────────────────
  const nuestros = [
    'IDX_MOVIMIENTO_DIARIO_FECHA',
    'IDX_ORDEN_SERVICIO_TALLER_FECHA_EMISION',
    'IDX_AUTORIZACION_SERVICIO_EXTERNO_FECHA_EMISION',
    'IDX_CONTROL_MENSUAL_COSTO_PERIODO',
    'IDX_VEHICULO_PLACA_RODAJE',
    'IDX_TARJETA_MANO_OBRA_NUMERO_OS',
    'IDX_DETALLE_SOLICITUD_MATERIAL_NUMERO_OS',
    'IDX_AUTORIZACION_SERVICIO_EXTERNO_NUMERO_OS',
    'IDX_HISTORIAL_FICHA_CONTROL_NUMERO_FABRICA',
  ]

  console.log('  VERIFICACIÓN DE LOS 9 ÍNDICES B-TREE DEL PROYECTO')
  console.log('──────────────────────────────────────────────────────────────')

  for (const nombre of nuestros) {
    const encontrado = indices.find(
      i => i.indice.toUpperCase() === nombre.toUpperCase()
    )
    const estado = encontrado ? '[OK]' : '[NO ENCONTRADO]'
    const tabla  = encontrado?.tabla ?? '???'
    console.log(`  ${estado}  ${nombre.padEnd(50)} → ${tabla}`)
  }

  console.log('══════════════════════════════════════════════════════════════\n')
}

main().catch(console.error).finally(() => prisma.$disconnect())
