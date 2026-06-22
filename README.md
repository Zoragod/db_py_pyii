# Sistema de Administración de Flotas Vehiculares

Sistema transaccional completo para la gestión de flotas, construido con **Prisma ORM**, **Express (Backend API)**, **React + Vite (Frontend)** y **PostgreSQL**.

---

## Estructura del Proyecto

```
├── .agents/                 → Reglas de agentes de IA
├── frontend/                → Aplicación React (Vite, Tailwind/Vanilla CSS)
│   ├── src/                 → Componentes, páginas y contextos del frontend
│   ├── Dockerfile           → Dockerfile para Nginx / Frontend
│   └── package.json
├── generated/prisma/        → Cliente Prisma auto-generado
├── prisma/
│   ├── migrations/          → Historial de migraciones
│   ├── views/               → Vistas SQL auxiliares
│   ├── erd.svg              → Diagrama Entidad-Relación
│   └── schema.prisma        → Esquema de la base de datos
├── Dockerfile               → Dockerfile para el Backend
├── docker-compose.yml       → Orquestación de BD, Backend y Frontend
├── server.ts                → Servidor API REST (Express + Prisma)
├── index.ts                 → Script CLI de diagnóstico de conexión
├── prisma.config.ts         → Singleton del cliente Prisma
├── cargar_sectores.ts       → Seed: Sectores Solicitantes
├── cargar_conductores.ts    → Seed: Conductores
├── cargar_vehiculos.ts      → Seed: Vehículos de la flota
├── cargar_mecanicos.ts      → Seed: Mecánicos, repuestos, talleres
├── registrar_movimiento.ts  → Ejemplo: Registrar movimiento diario
├── consultar_costos.ts      → Ejemplo: Consultas analíticas de costos
├── .env                     → Variables de entorno (no versionar)
├── .env.example             → Plantilla de variables de entorno
├── tsconfig.json            → Configuración TypeScript
└── package.json             → Dependencias y scripts npm
```

---

## Módulos de la Base de Datos

| Módulo | Tablas | Descripción |
|---|---|---|
| **1 · Catastro** | `SectorSolicitante`, `Conductor`, `Vehiculo` | Entidades maestras del sistema |
| **2 · Movimiento** | `MovimientoDiario`, `ServicentroAcreditado`, `OrdenAbastecimiento` | Trazabilidad de viajes y combustible |
| **3 · Mantenimiento** | `OrdenServicioTaller`, `Mecanico`, `TarjetaManoObra`, `LlantaOConjunto`, `HistorialFichaControl`, `RepuestoAlmacen`, `DetalleSolicitudMaterial` | Taller interno y almacén |
| **4 · Externalización** | `TallerTerceros`, `AutorizacionServicioExterno`, `DetalleServicioExterno` | Talleres privados contratados |
| **5 · Financiero** | `ControlMensualCosto` | Cierre mensual de costos por vehículo |

---

## Requisitos Previos

- **Node.js** ≥ 18
- **PostgreSQL** ≥ 14
- **Docker & Docker Compose** (Opcional, para ejecución rápida)

---

## Ejecución con Docker (Recomendado)

Puedes levantar todo el ecosistema (PostgreSQL, Backend Express, Frontend React) con un solo comando:

```bash
docker-compose up --build
```

El sistema estará disponible en:
- **Frontend (Web App)**: [http://localhost](http://localhost)
- **Backend API**: [http://localhost:3000](http://localhost:3000)

---

## Instalación y Configuración Manual

### 1. Servidor Backend y Base de Datos

1. Instalar dependencias en la raíz:
   ```bash
   npm install
   ```
2. Configurar la base de datos copiando el archivo `.env.example`:
   ```bash
   copy .env.example .env
   ```
   Y actualiza `DATABASE_URL` con tus credenciales de PostgreSQL locales.

3. Aplicar las migraciones a la base de datos:
   ```bash
   npm run migrate:dev
   ```

4. Generar el cliente Prisma:
   ```bash
   npm run generate
   ```

5. Cargar todos los datos iniciales (seeds):
   ```bash
   npm run seed:all
   ```

6. Iniciar el servidor API Backend:
   ```bash
   npm start
   ```
   El backend correrá en `http://localhost:3000`.

### 2. Frontend React

1. Navegar a la carpeta `frontend/` e instalar dependencias:
   ```bash
   cd frontend
   npm install
   ```

2. Iniciar el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
   El frontend estará accesible en `http://localhost:5173`.

---

## Scripts Disponibles (Raíz)

| Script | Comando | Descripción |
|---|---|---|
| `npm start` | `ts-node server.ts` | Inicia el servidor de producción/desarrollo backend Express |
| `npm run dev` | `ts-node index.ts` | Corre un script CLI de prueba rápida contra el catálogo |
| `npm run generate` | `prisma generate` | Regenera el cliente de Prisma ORM |
| `npm run migrate:dev` | `prisma migrate dev` | Ejecuta nuevas migraciones de desarrollo |
| `npm run studio` | `prisma studio` | Lanza el panel web interactivo de base de datos de Prisma |
| `npm run seed:all` | Correr los 4 seeds | Puebla la BD en orden con sectores, conductores, vehículos y talleres |

---

## Índices Implementados

| Índice | Tabla | Campo(s) | Propósito |
|---|---|---|---|
| `IDX_MOVIMIENTO_DIARIO_FECHA` | `movimiento_diario` | `fecha_movimiento` | Filtros temporales mensuales |
| `IDX_ORDEN_SERVICIO_TALLER_FECHA_EMISION` | `orden_servicio_taller` | `fecha_emision` | Consolidación de costos por período |
| `IDX_AUTORIZACION_SERVICIO_EXTERNO_FECHA_EMISION` | `autorizacion_servicio_externo` | `fecha_emision` | Costos de talleres terceros por período |
| `IDX_CONTROL_MENSUAL_COSTO_PERIODO` | `control_mensual_costo` | `mes + año` | Cierre mensual rápido |
| `IDX_VEHICULO_PLACA_RODAJE` | `vehiculo` | `placa_rodaje` | Búsqueda patrimonial de garaje |
| `IDX_TARJETA_MANO_OBRA_NUMERO_OS` | `tarjeta_mano_obra` | `numero_os` | Agrupación por OS para factura |
| `IDX_DETALLE_SOLICITUD_MATERIAL_NUMERO_OS` | `detalle_solicitud_material` | `numero_os` | Materiales por OS |
| `IDX_AUTORIZACION_SERVICIO_EXTERNO_NUMERO_OS` | `autorizacion_servicio_externo` | `numero_os` | Relación OS → autorización externa |
| `IDX_HISTORIAL_FICHA_CONTROL_NUMERO_FABRICA` | `historial_ficha_control` | `numero_fabrica` | Trazabilidad de llantas |

---

## Notas Técnicas

- Los campos de tipo `TIME` se mapean a `DateTime` en TypeScript — usar `new Date('1970-01-01THH:MM:SSZ')` al insertar.
- Los campos monetarios usan el tipo `Decimal` de Prisma para evitar errores de precisión de punto flotante.
- El cliente Prisma se importa como Singleton desde `prisma.config.ts`.
