// =============================================================================
// db.ts — Singleton del cliente Prisma
// Exporta una única instancia de PrismaClient reutilizable en toda la app.
// IMPORTANTE: Ejecuta `npm run generate` antes de importar este módulo.
// =============================================================================

import { PrismaClient } from './generated/prisma'

declare global {
  // Evita múltiples instancias en desarrollo con hot-reload
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

const prisma: PrismaClient =
  globalThis.__prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

export default prisma
