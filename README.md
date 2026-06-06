# Sistema de Administración de Flotas Vehiculares

Base de datos relacional completa para la gestión de flotas, construida con **Prisma ORM**, **PostgreSQL** y **TypeScript**.

---

## Estructura del Proyecto

```
├── generated/prisma/        → Cliente Prisma auto-generado
├── prisma/
│   ├── migrations/          → Historial de migraciones
│   ├── views/               → Vistas SQL auxiliares
│   ├── erd.svg              → Diagrama Entidad-Relación
│   └── schema.prisma        → Esquema de la base de datos
├── index.ts                 → Punto de entrada y demo de conexión
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
- **npm** ≥ 9

---

## Instalación y Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar la base de datos

Copia la plantilla y edita con tus credenciales:

```bash
copy .env.example .env
```

Edita `.env`:

```env
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/flota_vehicular?schema=public"
```

### 3. Crear la base de datos y aplicar el esquema

```bash
# Crea las tablas con una migración inicial
npm run migrate:dev
# Cuando pregunte el nombre de la migración, escribe: init

# O si solo quieres generar las tablas sin migración:
npx prisma db push
```

### 4. Generar el cliente Prisma

```bash
npm run generate
```

---

## Cargar Datos Iniciales (Seeds)

```bash
# Cargar en orden (cada uno depende del anterior)
npm run seed:sectores
npm run seed:conductores
npm run seed:vehiculos
npm run seed:mecanicos

# O cargar todo de una vez
npm run seed:all
```

---

## Uso

```bash
# Ejecutar el programa principal (resumen de la base de datos)
npm run dev

# Registrar un movimiento diario de ejemplo
npm run movimiento

# Consultar costos y KPIs
npm run costos

# Abrir Prisma Studio (interfaz visual)
npm run studio
```

---

## Scripts Disponibles

| Script | Comando | Descripción |
|---|---|---|
| `npm run dev` | `ts-node index.ts` | Ejecuta el programa principal |
| `npm run generate` | `prisma generate` | Regenera el cliente Prisma |
| `npm run migrate:dev` | `prisma migrate dev` | Crea y aplica migraciones en desarrollo |
| `npm run migrate:deploy` | `prisma migrate deploy` | Aplica migraciones en producción |
| `npm run studio` | `prisma studio` | Abre la interfaz web de Prisma |
| `npm run seed:all` | Scripts encadenados | Carga todos los datos iniciales |
| `npm run format` | `prisma format` | Formatea el schema.prisma |

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
- Los campos monetarios usan el tipo `Decimal` de Prisma para evitar errores de punto flotante.
- El cliente Prisma es un singleton exportado desde `prisma.config.ts` para evitar múltiples conexiones en desarrollo.
- Las vistas SQL en `prisma/views/` deben ejecutarse manualmente contra la base de datos (Prisma no gestiona vistas automáticamente).
