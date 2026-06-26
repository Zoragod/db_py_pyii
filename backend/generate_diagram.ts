// =============================================================================
// generate_diagram.ts — Generador de diagrama E-R en SVG (TypeScript)
// Sistema de Administración de Flotas Vehiculares
// Uso: npx ts-node generate_diagram.ts
// Salida: prisma/erd.svg  y  fleet_diagram.svg
// =============================================================================

import * as fs from 'fs'
import * as path from 'path'

// ─── Paleta de colores por módulo ────────────────────────────────────────────
const C = {
  catastro:        { header: '#2563eb', border: '#3b82f6', bg: '#0f2447', zone: '#111d35' },
  movimiento:      { header: '#059669', border: '#10b981', bg: '#0a2318', zone: '#0d2a1d' },
  mantenimiento:   { header: '#7c3aed', border: '#8b5cf6', bg: '#1a0f2e', zone: '#1e1233' },
  externalizacion: { header: '#b45309', border: '#d97706', bg: '#2a1a05', zone: '#2e1d08' },
  financiero:      { header: '#b91c1c', border: '#ef4444', bg: '#2a0a0a', zone: '#2e0d0d' },
}

const CANVAS_BG  = '#0b1120'
const PK_COLOR   = '#fbbf24'
const FK_COLOR   = '#7dd3fc'
const FIELD_TEXT = '#cbd5e1'
const TYPE_COLOR = '#475569'

// ─── Dimensiones ─────────────────────────────────────────────────────────────
const TW      = 280   // table width
const GAP     = 44    // horizontal gap between columns
const VGAP    = 54    // vertical gap between rows
const HEADER_H = 38
const ROW_H    = 23
const FOOT    = 6

const colX = (col: number) => 30 + col * (TW + GAP)  // 4 cols: 0-3
const CANVAS_W = colX(4) - GAP + 30                   // = 1298

function tableH(fields: number): number {
  return HEADER_H + fields * ROW_H + FOOT
}

// ─── Modelo de datos ──────────────────────────────────────────────────────────
interface Field { name: string; type: string; flag: '' | 'PK' | 'FK' }
interface TableDef {
  module: keyof typeof C
  fields: Field[]
}

const TABLES: Record<string, TableDef> = {
  // ── Módulo 1: Catastro ─────────────────────────────────────────────────────
  SECTOR_SOLICITANTE: { module: 'catastro', fields: [
    { name: 'id_sector',     type: 'INT',          flag: 'PK' },
    { name: 'nombre_sector', type: 'VARCHAR(100)',  flag: ''   },
    { name: 'localidad',     type: 'VARCHAR(100)',  flag: ''   },
  ]},
  CONDUCTOR: { module: 'catastro', fields: [
    { name: 'matricula_conductor', type: 'VARCHAR(20)',  flag: 'PK' },
    { name: 'nombre_conductor',    type: 'VARCHAR(150)', flag: ''   },
    { name: 'documento_identidad', type: 'VARCHAR(20)',  flag: ''   },
  ]},
  VEHICULO: { module: 'catastro', fields: [
    { name: 'codigo_vehiculo',    type: 'VARCHAR(6)',  flag: 'PK' },
    { name: 'placa_rodaje',       type: 'VARCHAR(10)', flag: ''   },
    { name: 'marca',              type: 'VARCHAR(50)', flag: ''   },
    { name: 'modelo',             type: 'VARCHAR(50)', flag: ''   },
    { name: 'ano_fabricacion',    type: 'SMALLINT',    flag: ''   },
    { name: 'capacidad_carga_kg', type: 'DECIMAL(8,2)',flag: ''   },
    { name: 'id_sector_asignado', type: 'INT',         flag: 'FK' },
    { name: 'valor_adquisicion',  type: 'DECIMAL(12,2)',flag: ''   },
    { name: 'valor_residual',     type: 'DECIMAL(12,2)',flag: ''   },
    { name: 'vida_util_anos',     type: 'INT',         flag: ''   },
  ]},
  HISTORIAL_ASIGNACION_SECTOR: { module: 'catastro', fields: [
    { name: 'id_asignacion',   type: 'INT',        flag: 'PK' },
    { name: 'codigo_vehiculo', type: 'VARCHAR(6)', flag: 'FK' },
    { name: 'id_sector',       type: 'INT',        flag: 'FK' },
    { name: 'fecha_inicio',    type: 'DATE',       flag: ''   },
    { name: 'fecha_fin',       type: 'DATE',       flag: ''   },
  ]},
  // ── Módulo 2: Movimiento ───────────────────────────────────────────────────
  MOVIMIENTO_DIARIO: { module: 'movimiento', fields: [
    { name: 'id_movimiento',       type: 'INT',          flag: 'PK' },
    { name: 'codigo_vehiculo',     type: 'VARCHAR(6)',   flag: 'FK' },
    { name: 'matricula_conductor', type: 'VARCHAR(20)',  flag: 'FK' },
    { name: 'fecha_movimiento',    type: 'DATE',         flag: ''   },
    { name: 'hora_salida',         type: 'TIME',         flag: ''   },
    { name: 'hora_llegada',        type: 'TIME',         flag: ''   },
    { name: 'km_salida',           type: 'DECIMAL(10,2)',flag: ''   },
    { name: 'km_llegada',          type: 'DECIMAL(10,2)',flag: ''   },
    { name: 'destino',             type: 'VARCHAR(200)', flag: ''   },
    { name: 'chk_luces',           type: 'BOOLEAN',      flag: ''   },
    { name: 'chk_frenos',          type: 'BOOLEAN',      flag: ''   },
    { name: 'chk_fluidos',         type: 'BOOLEAN',      flag: ''   },
    { name: 'chk_llantas',         type: 'BOOLEAN',      flag: ''   },
    { name: 'chk_documentos',      type: 'BOOLEAN',      flag: ''   },
    { name: 'checklist_observaciones', type: 'VARCHAR(500)', flag: '' },
  ]},
  SERVICENTRO_ACREDITADO: { module: 'movimiento', fields: [
    { name: 'id_servicentro',     type: 'INT',          flag: 'PK' },
    { name: 'nombre_servicentro', type: 'VARCHAR(150)', flag: ''   },
  ]},
  ORDEN_ABASTECIMIENTO: { module: 'movimiento', fields: [
    { name: 'numero_orden',        type: 'INT',          flag: 'PK' },
    { name: 'id_movimiento',       type: 'INT',          flag: 'FK' },
    { name: 'id_servicentro',      type: 'INT',          flag: 'FK' },
    { name: 'tipo_combustible',    type: 'VARCHAR(50)',  flag: ''   },
    { name: 'galones_abastecidos', type: 'DECIMAL(8,3)', flag: ''   },
    { name: 'kilometraje_actual',  type: 'DECIMAL(10,2)',flag: ''   },
  ]},
  // ── Módulo 3: Mantenimiento ────────────────────────────────────────────────
  ORDEN_SERVICIO_TALLER: { module: 'mantenimiento', fields: [
    { name: 'numero_os',          type: 'INT',          flag: 'PK' },
    { name: 'codigo_vehiculo',    type: 'VARCHAR(6)',   flag: 'FK' },
    { name: 'fecha_emision',      type: 'DATE',         flag: ''   },
    { name: 'tipo_mantenimiento', type: 'VARCHAR(100)', flag: ''   },
    { name: 'km_entrada',         type: 'DECIMAL(10,2)',flag: ''   },
    { name: 'km_salida',          type: 'DECIMAL(10,2)',flag: ''   },
  ]},
  MECANICO: { module: 'mantenimiento', fields: [
    { name: 'matricula_mecanico', type: 'VARCHAR(20)',  flag: 'PK' },
    { name: 'nombre_mecanico',    type: 'VARCHAR(150)', flag: ''   },
  ]},
  TARJETA_MANO_OBRA: { module: 'mantenimiento', fields: [
    { name: 'id_tarjeta',               type: 'INT',         flag: 'PK' },
    { name: 'numero_os',                type: 'INT',         flag: 'FK' },
    { name: 'matricula_mecanico',       type: 'VARCHAR(20)', flag: 'FK' },
    { name: 'fecha_trabajo',            type: 'DATE',        flag: ''   },
    { name: 'codigo_servicio_ejecutado',type: 'VARCHAR(50)', flag: ''   },
    { name: 'hora_inicio',              type: 'TIME',        flag: ''   },
    { name: 'hora_final',               type: 'TIME',        flag: ''   },
  ]},
  DETALLE_SOLICITUD_MATERIAL: { module: 'mantenimiento', fields: [
    { name: 'id_detalle',           type: 'INT',          flag: 'PK' },
    { name: 'numero_os',            type: 'INT',          flag: 'FK' },
    { name: 'codigo_repuesto',      type: 'VARCHAR(30)',  flag: 'FK' },
    { name: 'cantidad',             type: 'DECIMAL(8,3)', flag: ''   },
    { name: 'costo_total_repuesto', type: 'DECIMAL(12,2)',flag: ''   },
  ]},
  LLANTA_O_CONJUNTO: { module: 'mantenimiento', fields: [
    { name: 'numero_fabrica', type: 'VARCHAR(50)',  flag: 'PK' },
    { name: 'fabricante',     type: 'VARCHAR(100)', flag: ''   },
    { name: 'dimension',      type: 'VARCHAR(30)',  flag: ''   },
    { name: 'modelo',         type: 'VARCHAR(100)', flag: ''   },
    { name: 'tipo_elemento',  type: 'VARCHAR(50)',  flag: ''   },
  ]},
  HISTORIAL_FICHA_CONTROL: { module: 'mantenimiento', fields: [
    { name: 'id_historial',      type: 'INT',          flag: 'PK' },
    { name: 'numero_fabrica',    type: 'VARCHAR(50)',  flag: 'FK' },
    { name: 'codigo_vehiculo',   type: 'VARCHAR(6)',   flag: 'FK' },
    { name: 'fecha_instalacion', type: 'DATE',         flag: ''   },
    { name: 'fecha_retiro',      type: 'DATE',         flag: ''   },
    { name: 'km_instalacion',    type: 'DECIMAL(10,2)',flag: ''   },
    { name: 'km_retiro',         type: 'DECIMAL(10,2)',flag: ''   },
    { name: 'posicion_rueda',    type: 'VARCHAR(20)',  flag: ''   },
  ]},
  REPUESTO_ALMACEN: { module: 'mantenimiento', fields: [
    { name: 'codigo_repuesto', type: 'VARCHAR(30)',  flag: 'PK' },
    { name: 'descripcion',     type: 'VARCHAR(200)', flag: ''   },
    { name: 'costo_unitario',  type: 'DECIMAL(10,2)',flag: ''   },
  ]},
  // ── Módulo 4: Externalización ──────────────────────────────────────────────
  TALLER_TERCEROS: { module: 'externalizacion', fields: [
    { name: 'id_taller_tercero',  type: 'INT',          flag: 'PK' },
    { name: 'nombre_taller',      type: 'VARCHAR(150)', flag: ''   },
    { name: 'datos_comunicacion', type: 'VARCHAR(300)', flag: ''   },
  ]},
  AUTORIZACION_SERVICIO_EXTERNO: { module: 'externalizacion', fields: [
    { name: 'numero_autorizacion',  type: 'INT',          flag: 'PK' },
    { name: 'numero_os',            type: 'INT',          flag: 'FK' },
    { name: 'id_taller_tercero',    type: 'INT',          flag: 'FK' },
    { name: 'fecha_emision',        type: 'DATE',         flag: ''   },
    { name: 'fecha_entrada_taller', type: 'DATE',         flag: ''   },
    { name: 'km_entrada',           type: 'DECIMAL(10,2)',flag: ''   },
    { name: 'fecha_salida_taller',  type: 'DATE',         flag: ''   },
    { name: 'km_salida',            type: 'DECIMAL(10,2)',flag: ''   },
    { name: 'fecha_aprobacion',     type: 'DATE',         flag: ''   },
  ]},
  DETALLE_SERVICIO_EXTERNO: { module: 'externalizacion', fields: [
    { name: 'id_detalle_externo',   type: 'INT',          flag: 'PK' },
    { name: 'numero_autorizacion',  type: 'INT',          flag: 'FK' },
    { name: 'descripcion_servicio', type: 'VARCHAR(300)', flag: ''   },
    { name: 'valor_presupuestado',  type: 'DECIMAL(12,2)',flag: ''   },
  ]},
  // ── Módulo 5: Financiero ───────────────────────────────────────────────────
  CONTROL_MENSUAL_COSTO: { module: 'financiero', fields: [
    { name: 'id_control_mensual',          type: 'INT',          flag: 'PK' },
    { name: 'codigo_vehiculo',             type: 'VARCHAR(6)',   flag: 'FK' },
    { name: 'mes_referencia',              type: 'SMALLINT',     flag: ''   },
    { name: 'anio_referencia',             type: 'SMALLINT',     flag: ''   },
    { name: 'total_kilometros_recorridos', type: 'DECIMAL(10,2)',flag: ''   },
    { name: 'total_horas_uso',             type: 'DECIMAL(8,2)', flag: ''   },
    { name: 'costo_total_combustible',     type: 'DECIMAL(12,2)',flag: ''   },
    { name: 'costo_mano_obra_propia',      type: 'DECIMAL(12,2)',flag: ''   },
    { name: 'costo_repuestos_propios',     type: 'DECIMAL(12,2)',flag: ''   },
    { name: 'costo_talleres_terceros',     type: 'DECIMAL(12,2)',flag: ''   },
    { name: 'costo_fijo_vehiculo',         type: 'DECIMAL(12,2)',flag: ''   },
    { name: 'costo_fijo_prorrateado',      type: 'DECIMAL(12,2)',flag: ''   },
    { name: 'costo_variable',              type: 'DECIMAL(12,2)',flag: ''   },
    { name: 'costo_por_kilometro',         type: 'DECIMAL(10,4)',flag: ''   },
  ]},
}

// ─── Layout: grilla 4 columnas, 6 filas ───────────────────────────────────────
// Cada entrada: [colIndex, rowYStart, widthMultiplier]
// widthMultiplier=2 → tabla ocupa 2 columnas (2*TW + GAP)
interface Pos { x: number; y: number; w: number }

function buildPositions(): Record<string, Pos> {
  // row y-starts (calculados con la altura máxima de cada fila + VGAP)
  const r: number[] = []
  r[0] = 90
  r[1] = r[0] + Math.max(tableH(3), tableH(3), tableH(7))          + VGAP  // 196+54=250 → r[1]=286
  r[2] = r[1] + Math.max(tableH(9), tableH(2), tableH(6))           + VGAP  // 240+54=294 → r[2]=580
  r[3] = r[2] + Math.max(tableH(6), tableH(2), tableH(7), tableH(5))+ VGAP  // 196+54=250 → r[3]=830
  r[4] = r[3] + Math.max(tableH(5), tableH(8), tableH(3), tableH(3))+ VGAP  // 218+54=272 → r[4]=1102
  r[5] = r[4] + Math.max(tableH(9), tableH(4))                      + VGAP  // 240+54=294 → r[5]=1396

  const p = (col: number, row: number, wMult = 1): Pos => ({
    x: colX(col),
    y: r[row],
    w: wMult === 1 ? TW : TW * wMult + GAP * (wMult - 1),
  })

  return {
    // Fila 0 — Catastro
    SECTOR_SOLICITANTE:            p(0, 0),
    CONDUCTOR:                     p(1, 0),
    VEHICULO:                      p(2, 0),
    HISTORIAL_ASIGNACION_SECTOR:   p(3, 0),
    // Fila 1 — Movimiento
    MOVIMIENTO_DIARIO:             p(0, 1),
    SERVICENTRO_ACREDITADO:        p(2, 1),
    ORDEN_ABASTECIMIENTO:          p(3, 1),
    // Fila 2 — Mantenimiento A
    ORDEN_SERVICIO_TALLER:         p(0, 2),
    MECANICO:                      p(1, 2),
    TARJETA_MANO_OBRA:             p(2, 2),
    DETALLE_SOLICITUD_MATERIAL:    p(3, 2),
    // Fila 3 — Mantenimiento B
    LLANTA_O_CONJUNTO:             p(0, 3),
    HISTORIAL_FICHA_CONTROL:       p(1, 3),
    REPUESTO_ALMACEN:              p(2, 3),
    TALLER_TERCEROS:               p(3, 3),
    // Fila 4 — Externalización
    AUTORIZACION_SERVICIO_EXTERNO: p(0, 4),
    DETALLE_SERVICIO_EXTERNO:      p(1, 4),
    // Fila 5 — Financiero (doble ancho)
    CONTROL_MENSUAL_COSTO:         p(0, 5, 2),
  }
}

// ─── Relaciones FK ────────────────────────────────────────────────────────────
interface Rel { child: string; childField: string; parent: string; parentField: string }
const RELATIONS: Rel[] = [
  { child: 'VEHICULO',                     childField: 'id_sector_asignado',  parent: 'SECTOR_SOLICITANTE',            parentField: 'id_sector' },
  { child: 'HISTORIAL_ASIGNACION_SECTOR',  childField: 'codigo_vehiculo',     parent: 'VEHICULO',                      parentField: 'codigo_vehiculo' },
  { child: 'HISTORIAL_ASIGNACION_SECTOR',  childField: 'id_sector',           parent: 'SECTOR_SOLICITANTE',            parentField: 'id_sector' },
  { child: 'MOVIMIENTO_DIARIO',            childField: 'codigo_vehiculo',     parent: 'VEHICULO',                      parentField: 'codigo_vehiculo' },
  { child: 'MOVIMIENTO_DIARIO',            childField: 'matricula_conductor', parent: 'CONDUCTOR',                     parentField: 'matricula_conductor' },
  { child: 'ORDEN_ABASTECIMIENTO',         childField: 'id_movimiento',       parent: 'MOVIMIENTO_DIARIO',             parentField: 'id_movimiento' },
  { child: 'ORDEN_ABASTECIMIENTO',         childField: 'id_servicentro',      parent: 'SERVICENTRO_ACREDITADO',        parentField: 'id_servicentro' },
  { child: 'ORDEN_SERVICIO_TALLER',        childField: 'codigo_vehiculo',     parent: 'VEHICULO',                      parentField: 'codigo_vehiculo' },
  { child: 'TARJETA_MANO_OBRA',            childField: 'numero_os',           parent: 'ORDEN_SERVICIO_TALLER',         parentField: 'numero_os' },
  { child: 'TARJETA_MANO_OBRA',            childField: 'matricula_mecanico',  parent: 'MECANICO',                      parentField: 'matricula_mecanico' },
  { child: 'HISTORIAL_FICHA_CONTROL',      childField: 'numero_fabrica',      parent: 'LLANTA_O_CONJUNTO',             parentField: 'numero_fabrica' },
  { child: 'HISTORIAL_FICHA_CONTROL',      childField: 'codigo_vehiculo',     parent: 'VEHICULO',                      parentField: 'codigo_vehiculo' },
  { child: 'DETALLE_SOLICITUD_MATERIAL',   childField: 'numero_os',           parent: 'ORDEN_SERVICIO_TALLER',         parentField: 'numero_os' },
  { child: 'DETALLE_SOLICITUD_MATERIAL',   childField: 'codigo_repuesto',     parent: 'REPUESTO_ALMACEN',              parentField: 'codigo_repuesto' },
  { child: 'AUTORIZACION_SERVICIO_EXTERNO',childField: 'numero_os',           parent: 'ORDEN_SERVICIO_TALLER',         parentField: 'numero_os' },
  { child: 'AUTORIZACION_SERVICIO_EXTERNO',childField: 'id_taller_tercero',   parent: 'TALLER_TERCEROS',               parentField: 'id_taller_tercero' },
  { child: 'DETALLE_SERVICIO_EXTERNO',     childField: 'numero_autorizacion', parent: 'AUTORIZACION_SERVICIO_EXTERNO', parentField: 'numero_autorizacion' },
  { child: 'CONTROL_MENSUAL_COSTO',        childField: 'codigo_vehiculo',     parent: 'VEHICULO',                      parentField: 'codigo_vehiculo' },
]

// ─── SVG Builder ──────────────────────────────────────────────────────────────
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function fieldY(tableY: number, idx: number): number {
  return tableY + HEADER_H + idx * ROW_H + ROW_H / 2
}

function buildSVG(positions: Record<string, Pos>): string {
  const CANVAS_H = (() => {
    let maxY = 0
    for (const [name, pos] of Object.entries(positions)) {
      const h = tableH(TABLES[name].fields.length)
      maxY = Math.max(maxY, pos.y + h)
    }
    return maxY + 70
  })()

  const lines: string[] = []

  // ── Header ──────────────────────────────────────────────────────────────
  lines.push(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${CANVAS_W}" height="${CANVAS_H}"
     viewBox="0 0 ${CANVAS_W} ${CANVAS_H}"
     font-family="'Segoe UI',Roboto,Arial,sans-serif">
<defs>
  <filter id="sh">
    <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000" flood-opacity="0.55"/>
  </filter>
  <marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
    <path d="M0,0 L0,6 L7,3 z" fill="#64748b"/>
  </marker>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#0b1120"/>
    <stop offset="100%" stop-color="#0f172a"/>
  </linearGradient>
</defs>

<!-- Canvas background -->
<rect width="${CANVAS_W}" height="${CANVAS_H}" fill="url(#bg)"/>

<!-- Title -->
<text x="${CANVAS_W / 2}" y="36" text-anchor="middle"
      font-size="15" font-weight="700" fill="#f1f5f9" letter-spacing="0.8">
  SISTEMA DE ADMINISTRACIÓN DE FLOTAS VEHICULARES — Diagrama E-R
</text>
<text x="${CANVAS_W / 2}" y="54" text-anchor="middle"
      font-size="10" fill="#64748b">
  18 tablas · 5 módulos · PostgreSQL + Prisma ORM
</text>`)

  // ── Module zone labels ──────────────────────────────────────────────────
  const MODULE_LABELS: [string, keyof typeof C, number, number][] = [
    ['CATASTRO',        'catastro',        colX(0), 90],
    ['MOVIMIENTO',      'movimiento',      colX(0), positions['MOVIMIENTO_DIARIO'].y],
    ['MANTENIMIENTO',   'mantenimiento',   colX(0), positions['ORDEN_SERVICIO_TALLER'].y],
    ['EXTERNALIZACIÓN', 'externalizacion', colX(0), positions['AUTORIZACION_SERVICIO_EXTERNO'].y],
    ['FINANCIERO',      'financiero',      colX(0), positions['CONTROL_MENSUAL_COSTO'].y],
  ]

  for (const [label, mod, , ly] of MODULE_LABELS) {
    lines.push(`<!-- Zone: ${label} -->
<text x="${CANVAS_W - 20}" y="${ly - 8}"
      text-anchor="end" font-size="9" font-weight="700"
      fill="${C[mod].border}" letter-spacing="2" opacity="0.7">${esc(label)}</text>
<line x1="20" y1="${ly - 14}" x2="${CANVAS_W - 20}" y2="${ly - 14}"
      stroke="${C[mod].border}" stroke-width="0.5" opacity="0.25"/>`)
  }

  // ── FK Relationships ────────────────────────────────────────────────────
  lines.push('\n<!-- ═══ FK RELATIONSHIPS ═══ -->')
  for (const rel of RELATIONS) {
    const cp = positions[rel.child]
    const pp = positions[rel.parent]
    if (!cp || !pp) continue

    const cFields = TABLES[rel.child].fields.map(f => f.name)
    const pFields = TABLES[rel.parent].fields.map(f => f.name)
    const ci = cFields.indexOf(rel.childField)
    const pi = pFields.indexOf(rel.parentField)

    const cy = fieldY(cp.y, ci)
    const py = fieldY(pp.y, pi)

    // Connection points: use right or left edge depending on relative position
    let x1: number, x2: number
    if (pp.x > cp.x) {
      x1 = cp.x + cp.w
      x2 = pp.x
    } else if (pp.x < cp.x) {
      x1 = cp.x
      x2 = pp.x + pp.w
    } else {
      // Same column — connect right edges with a detour
      x1 = cp.x + cp.w
      x2 = pp.x + pp.w
    }

    // Smooth elbow path
    const mx = (x1 + x2) / 2
    lines.push(
      `<path d="M${x1},${cy} C${mx},${cy} ${mx},${py} ${x2},${py}"` +
      ` fill="none" stroke="#475569" stroke-width="1.4"` +
      ` stroke-dasharray="4,3" opacity="0.6" marker-end="url(#arr)"/>`
    )
  }

  // ── Tables ──────────────────────────────────────────────────────────────
  lines.push('\n<!-- ═══ TABLES ═══ -->')
  for (const [name, def] of Object.entries(TABLES)) {
    const pos = positions[name]
    if (!pos) continue
    const col = C[def.module]
    const h   = tableH(def.fields.length)
    const { x, y, w } = pos

    lines.push(`\n<!-- ${name} -->`)

    // Shadow rect
    lines.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" ` +
      `fill="${col.bg}" stroke="${col.border}" stroke-width="1.5" filter="url(#sh)"/>`
    )

    // Header
    lines.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${HEADER_H}" rx="7" fill="${col.header}"/>` +
      `<rect x="${x}" y="${y + HEADER_H - 8}" width="${w}" height="8" fill="${col.header}"/>` +
      `<text x="${x + w / 2}" y="${y + HEADER_H / 2 + 5}" text-anchor="middle" ` +
      `font-size="10.5" font-weight="700" fill="#fff" letter-spacing="0.3">${esc(name)}</text>`
    )

    // Fields
    def.fields.forEach((f, i) => {
      const fy = y + HEADER_H + i * ROW_H
      const evenBg = i % 2 === 0 ? 'rgba(255,255,255,0.035)' : 'transparent'

      lines.push(`<rect x="${x + 1}" y="${fy}" width="${w - 2}" height="${ROW_H}" fill="${evenBg}"/>`)

      // Flag badge
      if (f.flag === 'PK') {
        lines.push(
          `<text x="${x + 7}" y="${fy + ROW_H / 2 + 4}" ` +
          `font-size="8.5" font-weight="700" fill="${PK_COLOR}">PK</text>`
        )
      } else if (f.flag === 'FK') {
        lines.push(
          `<text x="${x + 7}" y="${fy + ROW_H / 2 + 4}" ` +
          `font-size="8.5" font-weight="700" fill="${FK_COLOR}">FK</text>`
        )
      }

      // Field name
      const nameColor = f.flag === 'PK' ? PK_COLOR : f.flag === 'FK' ? FK_COLOR : FIELD_TEXT
      lines.push(
        `<text x="${x + 27}" y="${fy + ROW_H / 2 + 4}" ` +
        `font-size="9.5" fill="${nameColor}">${esc(f.name)}</text>`
      )

      // Data type (right-aligned)
      lines.push(
        `<text x="${x + w - 6}" y="${fy + ROW_H / 2 + 4}" text-anchor="end" ` +
        `font-size="8.5" fill="${TYPE_COLOR}" font-style="italic">${esc(f.type)}</text>`
      )

      // Row separator
      if (i < def.fields.length - 1) {
        lines.push(
          `<line x1="${x + 2}" y1="${fy + ROW_H}" x2="${x + w - 2}" y2="${fy + ROW_H}" ` +
          `stroke="${col.border}" stroke-width="0.3" opacity="0.35"/>`
        )
      }
    })

    // Bottom rounded cap
    lines.push(
      `<rect x="${x}" y="${y + h - FOOT}" width="${w}" height="${FOOT}" rx="0" ` +
      `fill="${col.bg}" stroke="${col.border}" stroke-width="1.5"/>`
    )
  }

  // ── Legend ──────────────────────────────────────────────────────────────
  const legendY = CANVAS_H - 22
  const mods: [string, keyof typeof C][] = [
    ['Catastro', 'catastro'], ['Movimiento', 'movimiento'],
    ['Mantenimiento', 'mantenimiento'], ['Externalización', 'externalizacion'],
    ['Financiero', 'financiero'],
  ]
  let lx = 20
  lines.push('\n<!-- Legend -->')
  for (const [label, mod] of mods) {
    lines.push(
      `<rect x="${lx}" y="${legendY - 10}" width="10" height="10" rx="2" fill="${C[mod].header}"/>` +
      `<text x="${lx + 14}" y="${legendY}" font-size="9" fill="#94a3b8">${label}</text>`
    )
    lx += label.length * 6.2 + 30
  }

  lines.push('\n</svg>')
  return lines.join('\n')
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const positions = buildPositions()
const svg = buildSVG(positions)

const outDir = path.resolve(__dirname)
const prismaDir = path.join(outDir, 'prisma')

fs.writeFileSync(path.join(outDir, 'fleet_diagram.svg'), svg, 'utf8')
fs.writeFileSync(path.join(prismaDir, 'erd.svg'), svg, 'utf8')

console.log('[OK] Diagrama SVG generado:')
console.log('     -> fleet_diagram.svg')
console.log('     -> prisma/erd.svg')
