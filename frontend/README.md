# Sistema de Administración de Flota Vehicular (Frontend React)

Este proyecto es el desarrollo del Frontend de una aplicación de **Administración de Flota Vehicular** diseñada para Empresas de Agua y Saneamiento (EPS), modelada estrictamente sobre la base del manual técnico y la estructura de base de datos relacional del proyecto.

El sistema simula un entorno completo de producción (Base de datos transaccional, cálculos de costos en tiempo real y seguridad RBAC) directamente en el navegador de manera cliente-servidor (Mock API).

---

## 🚀 Cómo arrancar el proyecto localmente

Sigue estos pasos en tu terminal para ejecutar el servidor de desarrollo local:

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```
2.  **Iniciar el servidor de desarrollo**:
    ```bash
    npm run dev
    ```
3.  **Abrir en el navegador**:
    Abre la dirección que te proporcione la consola (usualmente `http://localhost:5173`).

---

## 📂 Arquitectura y Estructura del Proyecto

El código está organizado de manera modular bajo un patrón limpio en la carpeta `src/`:

*   **`context/`**:
    *   `AuthContext.jsx`: Simula el inicio de sesión y la matriz de permisos de los **5 roles** (Administrador, Operador, Mecánico, Almacenero, Conductor).
    *   `FleetContext.jsx`: Funciona como la **Base de Datos en Memoria** (respaldada por `localStorage`). Gestiona el estado de las 16 entidades transaccionales y centraliza las consultas y métodos CRUD.
*   **`utils/formulas.js`**: Implementa los motores matemáticos del manual. Realiza los cálculos algorítmicos en tiempo real para las vistas gerenciales.
*   **`components/`**:
    *   `Layout.jsx`: Contiene el Sidebar dinámico (oculta/muestra secciones según el rol) y el Header superior.
    *   `RoleSwitcher.jsx`: Widget interactivo de pruebas que permite cambiar el perfil del usuario activo al vuelo.
*   **`pages/`**:
    *   `Dashboard.jsx`: Dashboard analítico con gráficos interactivos (Recharts) de utilización e indicador de curva de sustitución.
    *   `Catastro.jsx`: Formularios CRUD de Vehículos y Conductores, y reasignaciones a sectores.
    *   `Operaciones.jsx`: Registro digital de bitácora (Formulario MA 122 01 01 Anverso), checklist diario (Reverso) y solicitudes de combustible (MA 122 01 02).
    *   `Mantenimiento.jsx`: Gestión de Órdenes de Servicio (MA 122 02 01), Tarjetas de Mano de Obra (MA 122 02 04), solicitudes de repuestos al almacén, derivaciones a terceros (MA 122 02 02) y rotación de llantas.
    *   `Almacen.jsx`: Panel de existencias y aprobación de despachos de materiales.
    *   `Seguridad.jsx`: Matriz informativa de permisos de accesos corporativos.

---

## 🧠 Fórmulas Matemáticas Implementadas (en `utils/formulas.js`)

Se digitalizaron las siguientes ecuaciones descritas en el manual:

1.  **Costo por Kilómetro de Operación (CKV)**:
    $$CKV = \frac{CFP + CFV}{K} + CVV$$
    *   *Código*: `calcularCostoPorKilometro(CFP, CFV, K, CVV)`
    *   Suma el costo fijo prorrateado mensual (CFP) y el costo fijo específico del vehículo (CFV: depreciación y seguros) dividido por el kilometraje (K), sumado al costo variable por kilómetro (CVV).

2.  **Índice de Utilización del Vehículo (IUV)**:
    $$IUV = \frac{\frac{KRV}{KRP} + \frac{HUV}{HUP}}{2}$$
    *   *Código*: `calcularIUV(KRV, KRP, HUV, HUP)`
    *   Mide el uso real frente a los parámetros estándar del manual (1,500 km y 160 horas mensuales). Valores $< 1$ alertan de subutilización para derivación a la "Flota de Uso Común".

3.  **Depreciación Lineal Mensual (D)**:
    $$D = \frac{1}{12} \times \frac{V - R}{N}$$
    *   *Código*: `calcularDepreciacionMensual(V, R, N)`
    *   Estima el desgaste financiero del chasis basándose en el valor de adquisición ($V$), el valor residual ($R$) y los años de vida útil ($N$).

4.  **Costo Promedio Anual de Operación (CPA)**:
    $$Cpa = \frac{V + \sum CC - R}{n}$$
    *   *Código*: `calcularCostoPromedioAnual(...)`
    *   Resuelve de forma interactiva la curva óptima de sustitución graficando los costos cruzados de mantenimiento acumulado y reventa depreciada año con año.

---

## 🔒 Matriz de Seguridad y Simulación de Roles

El selector flotante de roles en la esquina superior derecha del Header te permite verificar cómo reacciona el frontend según el rol activo:

| Módulo / Vista | Administrador | Operador de Garaje | Mecánico / Jefe de Taller | Almacenero | Conductor |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Dashboard Gerencial** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Catastro (Alta/Baja)** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Bitácora y Combustible** | ✅ | ✅ (Edita/Aprueba) | ❌ | ❌ | ✅ (Registra) |
| **Mantenimiento Técnico** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Almacén y Despacho** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Configuración Seguridad** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 💾 Persistencia de Datos (Simulando PostgreSQL)

La aplicación utiliza un proveedor de datos `FleetContext` con estado reactivo persistido en el `localStorage` del navegador. Puedes agregar vehículos, registrar kilómetros, solicitar piezas al almacén y despacharlas; **los cambios permanecerán guardados** incluso si refrescas la pestaña o cierras el navegador.
