// =============================================================================
// prisma.config.ts — Configuración del CLI de Prisma (Prisma 6)
// Este archivo configura el comportamiento de la CLI de Prisma.
// El cliente (PrismaClient) se instancia en db.ts para ser importado
// por los scripts de la aplicación.
// =============================================================================

import path from 'path'
import { readFileSync, existsSync } from 'fs'
import { defineConfig } from 'prisma/config'

// Cargar .env manualmente (Prisma 6 omite la carga automática con defineConfig)
const envPath = path.resolve(__dirname, '.env')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^"|"$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
})

