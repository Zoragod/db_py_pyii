# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copiar fuentes y generar cliente Prisma
COPY prisma ./prisma
RUN npx prisma generate

COPY . .

# Compilar TypeScript
RUN npx tsc --outDir dist --skipLibCheck 2>/dev/null || true

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Copiar schema y cliente generado de Prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/generated ./generated

# Copiar servidor (ts-node en prod es suficiente dado el tamaño del proyecto)
COPY server.ts .
COPY db.ts .
COPY tsconfig.json .

# Instalar ts-node y typescript para runtime
RUN npm install ts-node typescript @types/node @types/express --save-dev

EXPOSE 3000

# Ejecutar migraciones y luego levantar el servidor
CMD ["sh", "-c", "npx prisma migrate deploy && npx ts-node server.ts"]
