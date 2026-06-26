# 🚛 SIAFV — Sistema de Administración de Flotas Vehiculares

Sistema web completo para gestionar la flota de vehículos de una EPS (empresa de servicio público), siguiendo el estándar del **Manual MA 122**. Permite registrar vehículos, conductores, viajes diarios, combustible, mantenimiento, almacén de repuestos y genera KPIs financieros automáticamente.

---

## 📦 ¿Qué tiene este proyecto?

| Carpeta | ¿Qué es? |
|---|---|
| `backend/` | Servidor Node.js con Express + Prisma que conecta a PostgreSQL |
| `frontend/` | Aplicación web en React (Vite + Tailwind CSS) |
| `docker-compose.yml` | Levanta todo el sistema con un solo comando |

---

## 👥 Roles del sistema

El sistema tiene **5 tipos de usuario**, cada uno con su propia contraseña:

| Rol | Usuario | Contraseña | ¿Qué puede hacer? |
|---|---|---|---|
| Administrador | `admin` | `admin123` | Acceso total al sistema |
| Operador de Garaje | `operador` | `operador123` | Registrar viajes, combustible y asignaciones |
| Jefe de Taller | `mecanico` | `mecanico123` | Órdenes de servicio y mano de obra |
| Almacenero | `almacenero` | `almacenero123` | Control de repuestos e insumos |
| Conductor | `conductor` | `conductor123` | Registrar sus propios viajes diarios |

> ⚠️ **Para producción:** cambia estas contraseñas antes de publicar el sistema.

---

## 🗂️ Estructura del Proyecto

```
DB_PY_PYII/
│
├── backend/                     ← Todo el servidor (API + Base de datos)
│   ├── prisma/
│   │   ├── schema.prisma        ← Diseño de todas las tablas de la BD
│   │   └── views/               ← Vistas SQL auxiliares
│   ├── generated/prisma/        ← Cliente Prisma (generado automáticamente)
│   ├── node_modules/            ← Dependencias Node instaladas
│   ├── server.ts                ← Servidor principal con todos los endpoints API
│   ├── db.ts                    ← Conexión única a la base de datos
│   ├── prisma.config.ts         ← Configuración de Prisma
│   ├── tsconfig.json            ← Configuración de TypeScript
│   ├── package.json             ← Scripts y dependencias del backend
│   ├── .env                     ← Variables de entorno (contraseñas de BD, etc.)
│   ├── Dockerfile               ← Para construir la imagen Docker del backend
│   ├── cargar_sectores.ts       ← Script: carga los sectores iniciales
│   ├── cargar_conductores.ts    ← Script: carga los conductores
│   ├── cargar_vehiculos.ts      ← Script: carga los 56 vehículos de la flota
│   ├── cargar_mecanicos.ts      ← Script: carga mecánicos, repuestos y talleres
│   ├── fleet_management_ddl.sql ← SQL original de creación de tablas
│   └── fleet_management_indexes.sql ← SQL de índices de rendimiento
│
├── frontend/                    ← Aplicación web (lo que ve el usuario)
│   ├── src/
│   │   ├── pages/               ← Pantallas del sistema
│   │   │   ├── Login.jsx        ← Pantalla de inicio de sesión
│   │   │   ├── Dashboard.jsx    ← Panel de KPIs y gráficas
│   │   │   ├── Catastro.jsx     ← Gestión de vehículos y conductores
│   │   │   ├── Operaciones.jsx  ← Bitácora de viajes y combustible
│   │   │   ├── Mantenimiento.jsx ← Órdenes de servicio y llantas
│   │   │   ├── Almacen.jsx      ← Inventario de repuestos
│   │   │   └── Seguridad.jsx    ← Matriz de permisos por rol
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  ← Maneja el login/logout y roles
│   │   │   └── FleetContext.jsx ← Carga y guarda todos los datos de la flota
│   │   ├── utils/
│   │   │   ├── api.js           ← Todas las llamadas al servidor backend
│   │   │   └── formulas.js      ← Fórmulas matemáticas del Manual MA 122
│   │   └── components/
│   │       └── Layout.jsx       ← Menú lateral y cabecera con botón "Salir"
│   ├── Dockerfile               ← Para construir la imagen Docker del frontend
│   └── package.json
│
├── docker-compose.yml           ← Orquesta BD + Backend + Frontend juntos
├── README.md                    ← Este archivo
└── .gitignore
```

---

## 🚀 Opción 1: Levantar con Docker (La más fácil)

> Necesitas tener instalado [Docker Desktop](https://www.docker.com/products/docker-desktop/).

### Paso 1 — Abrir una terminal en la carpeta del proyecto

En Windows puedes hacer clic derecho sobre la carpeta `db_py_pyii` y elegir **"Abrir en Terminal"**.

### Paso 2 — Ejecutar un solo comando

```bash
docker compose up --build
```

Esto descarga, instala y levanta automáticamente:
- La **base de datos** PostgreSQL
- El **servidor backend** (Node.js + Express)
- El **frontend web** (React servido por Nginx)

### Paso 3 — Abrir el sistema en el navegador

| Qué | Dirección |
|---|---|
| 🌐 Aplicación web | http://localhost |
| 🔌 API Backend | http://localhost:3000 |

### Paso 4 — Iniciar sesión

En la pantalla de login, elige tu rol y escribe las credenciales de la tabla de la sección "Roles del sistema".

### Para detener el sistema

```bash
docker compose down
```

---

## 🛠️ Opción 2: Instalación Manual (Paso a Paso)

Usa esta opción si quieres desarrollar o modificar el código.

### Requisitos previos

- [Node.js 18+](https://nodejs.org/) instalado
- [PostgreSQL 14+](https://www.postgresql.org/download/) instalado y corriendo

---

### PARTE A — Configurar el Backend

#### Paso 1 — Entrar a la carpeta del backend

```bash
cd backend
```

#### Paso 2 — Instalar las dependencias

```bash
npm install
```

#### Paso 3 — Configurar la conexión a la base de datos

Edita el archivo `backend/.env` con los datos de tu PostgreSQL local:

```env
DATABASE_URL="postgresql://TU_USUARIO:TU_CONTRASEÑA@localhost:5432/siafv_db"
```

Por ejemplo, si tu PostgreSQL usa el usuario `postgres` y contraseña `1234`:

```env
DATABASE_URL="postgresql://postgres:1234@localhost:5432/siafv_db"
```

#### Paso 4 — Crear las tablas en la base de datos

```bash
npx prisma migrate dev
```

Esto crea todas las tablas necesarias automáticamente.

#### Paso 5 — Generar el cliente de base de datos

```bash
npm run generate
```

#### Paso 6 — Cargar los datos iniciales (sectores, vehículos, conductores, etc.)

```bash
npm run seed:all
```

Esto llena la base de datos con los 56 vehículos, conductores, mecánicos y demás datos de prueba. Los 5 usuarios con sus contraseñas se crean **automáticamente** al arrancar el servidor por primera vez.

#### Paso 7 — Iniciar el servidor backend

```bash
npm start
```

✅ El servidor estará corriendo en: `http://localhost:3000`

---

### PARTE B — Configurar el Frontend

Abre **una segunda terminal** (sin cerrar la del backend) y:

#### Paso 1 — Entrar a la carpeta del frontend

Desde la raíz del proyecto:

```bash
cd frontend
```

#### Paso 2 — Instalar las dependencias

```bash
npm install
```

#### Paso 3 — Iniciar la aplicación web

```bash
npm run dev
```

✅ La aplicación estará disponible en: `http://localhost:5173`

---

## 📐 Módulos del Sistema

### 1. 🗃️ Catastro (Inventario)
Registro completo de vehículos (código patrimonial, placa, marca, modelo, sector asignado) y conductores habilitados. Solo el Administrador puede dar de alta/baja vehículos.

### 2. 🚗 Operaciones (Movimientos Diarios)
Bitácora digital de cada viaje: hora de salida/llegada, kilómetros, destino y checklist del conductor (frenos, luces, fluidos, llantas, documentos). Incluye el registro de cargas de combustible con estación de servicio.

### 3. 🔧 Mantenimiento
Órdenes de servicio del taller propio con registro de mano de obra por mecánico (horas trabajadas), solicitud de repuestos al almacén y autorización de servicios a talleres externos.

### 4. 📦 Almacén
Control de inventario de repuestos y materiales. Registro del historial de llantas por vehículo (número de fábrica, posición, kilómetros instalados).

### 5. 📊 Dashboard de KPIs
Indicadores automáticos calculados según el Manual MA 122:

| Indicador | Fórmula | ¿Qué mide? |
|---|---|---|
| **CKV** — Costo por Kilómetro | `(Costos Fijos + Costos Variables) / Km recorridos` | Eficiencia económica de cada vehículo |
| **IUV** — Índice de Utilización | `(Km reales / Km referencia + Horas reales / Horas referencia) / 2` | Si el vehículo se usa suficiente o está ocioso |
| **Depreciación** | `(Valor - Residual) / (Vida útil × 12)` | Cuánto pierde de valor al mes |
| **CPA** — Curva de Sustitución | `(Valor + Costos acumulados - Reventa) / Años` | Cuándo conviene reemplazar el vehículo |

---

## 🔌 API REST — Endpoints Principales

El backend expone los siguientes endpoints. Todos (excepto login) requieren un **token JWT** en el encabezado `Authorization: Bearer <token>`.

| Método | Ruta | ¿Quién puede? | ¿Qué hace? |
|---|---|---|---|
| `POST` | `/api/auth/login` | Todos | Iniciar sesión. Retorna el token JWT. |
| `GET` | `/api/vehiculos` | Todos (autenticados) | Lista todos los vehículos |
| `POST` | `/api/vehiculos` | Admin | Registrar nuevo vehículo |
| `GET` | `/api/conductores` | Todos | Lista conductores |
| `POST` | `/api/conductores` | Admin | Registrar conductor |
| `GET` | `/api/movimientos` | Todos | Historial de viajes |
| `POST` | `/api/movimientos` | Admin, Operador, Conductor | Registrar viaje + checklist |
| `GET` | `/api/abastecimientos` | Todos | Órdenes de combustible |
| `POST` | `/api/abastecimientos` | Admin, Operador, Conductor | Registrar carga de combustible |
| `GET` | `/api/ordenes-servicio` | Todos | Órdenes de mantenimiento |
| `POST` | `/api/ordenes-servicio` | Admin, Mecánico | Crear orden de servicio |
| `GET` | `/api/kpis/:vehiculo/:mes/:año` | Todos | Calcular KPIs de un vehículo |
| `GET` | `/api/sectores` | Todos | Lista sectores de la organización |
| `GET` | `/api/mecanicos` | Todos | Lista mecánicos del taller |
| `GET` | `/api/repuestos` | Todos | Inventario de repuestos |
| `GET` | `/api/llantas` | Todos | Catálogo de llantas |

---

## 🐳 Comandos Docker Útiles

```bash
# Levantar todo el sistema (primera vez o tras cambios)
docker compose up --build

# Levantar en segundo plano (sin ver los logs)
docker compose up -d --build

# Ver los logs del backend en tiempo real
docker compose logs -f backend

# Detener y eliminar los contenedores
docker compose down

# Detener Y eliminar también la base de datos (¡borra todos los datos!)
docker compose down -v
```

---

## ⚙️ Scripts del Backend (`cd backend`)

```bash
npm start              # Inicia el servidor API en producción
npm run migrate:dev    # Aplica cambios al esquema de la BD (desarrollo)
npm run generate       # Regenera el cliente Prisma tras cambiar schema.prisma
npm run studio         # Abre Prisma Studio (interfaz visual de la BD en el navegador)
npm run seed:all       # Carga todos los datos iniciales a la BD
```

## ⚙️ Scripts del Frontend (`cd frontend`)

```bash
npm run dev     # Inicia el servidor de desarrollo con recarga automática
npm run build   # Genera los archivos optimizados para producción (carpeta dist/)
npm run preview # Previsualiza la versión de producción localmente
```

---

## 🌐 Despliegue en Producción

### Con Docker en un servidor (VPS/Cloud)

1. Sube el código al servidor
2. Edita `docker-compose.yml` y cambia:
   - `POSTGRES_PASSWORD: siafv_secret` → una contraseña segura
   - `JWT_SECRET: cambia_esto_...` → una clave larga y aleatoria
   - `VITE_API_URL: http://localhost:3000/api` → la URL real de tu dominio (ej: `https://api.tudominio.com/api`)
3. Ejecuta: `docker compose up -d --build`

### Variables de entorno importantes

| Variable | Dónde se define | Para qué sirve |
|---|---|---|
| `DATABASE_URL` | `backend/.env` | Dirección de conexión a PostgreSQL |
| `JWT_SECRET` | `backend/.env` o Docker Compose | Clave secreta para firmar los tokens de sesión |
| `VITE_API_URL` | `frontend/.env.production` o Docker build arg | URL del backend que usará el frontend |

---

## 🏗️ Tecnologías Usadas

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | React + Vite | 19 / 6 |
| Estilos | Tailwind CSS | v4 |
| Iconos | Lucide React | Latest |
| Gráficas | Recharts | Latest |
| Backend | Node.js + Express | 20 / 5 |
| Lenguaje backend | TypeScript | 5.8 |
| ORM | Prisma | 6.9 |
| Base de datos | PostgreSQL | 16 |
| Contenerización | Docker + Docker Compose | Latest |
| Servidor web (prod) | Nginx | Alpine |
