-- =============================================================================
-- SISTEMA DE ADMINISTRACIÓN DE FLOTAS VEHICULARES
-- Script de Optimización: Índices B-Tree
-- Versión: 1.0
-- Fecha: 2026-06-05
-- Autor: DBA Senior
--
-- NOTA GENERAL:
--   Todos los índices son de tipo B-Tree (valor por defecto en la mayoría
--   de motores RDBMS: SQL Server, PostgreSQL, MySQL/MariaDB).
--   Se nombran siguiendo la convención:  IDX_<tabla>_<campo(s)>
--   para identificarlos fácilmente en planes de ejecución y vistas del sistema.
-- =============================================================================


-- =============================================================================
-- BLOQUE 1: ÍNDICES TEMPORALES
-- Objetivo: Acelerar los rangos de fecha que alimentan el cálculo del cierre
--           mensual de costos (CONTROL_MENSUAL_COSTO). Las consultas de
--           agregación (SUM, COUNT, AVG) sobre períodos mensuales escanean
--           grandes volúmenes de filas transaccionales; sin índice temporal
--           el motor realiza un Full Table Scan por cada vehículo y período.
-- =============================================================================

-- Permite filtrar los movimientos de un vehículo acotando por rango de fechas
-- (ej: WHERE fecha_movimiento BETWEEN '2026-01-01' AND '2026-01-31').
-- Clave para calcular el total de kilómetros recorridos en el mes.
CREATE INDEX IDX_MOVIMIENTO_DIARIO_FECHA
    ON MOVIMIENTO_DIARIO (fecha_movimiento);

-- Permite localizar rápidamente las órdenes de servicio emitidas dentro de un
-- período mensual sin recorrer toda la tabla, reduciendo el costo del JOIN
-- con TARJETA_MANO_OBRA y DETALLE_SOLICITUD_MATERIAL al consolidar costos.
CREATE INDEX IDX_ORDEN_SERVICIO_TALLER_FECHA_EMISION
    ON ORDEN_SERVICIO_TALLER (fecha_emision);

-- Agiliza el filtrado de autorizaciones externas por período, necesario para
-- sumar el costo de talleres terceros (campo costo_talleres_terceros) durante
-- el cierre mensual sin leer registros fuera del intervalo de interés.
CREATE INDEX IDX_AUTORIZACION_SERVICIO_EXTERNO_FECHA_EMISION
    ON AUTORIZACION_SERVICIO_EXTERNO (fecha_emision);

-- Índice compuesto (mes + año) que refleja exactamente el predicado más común
-- de consulta: WHERE mes_referencia = ? AND anio_referencia = ?
-- El orden (mes, año) es el más selectivo para reportes de un mes específico;
-- invertirlo a (año, mes) favorece reportes anuales completos —
-- ajustar según la carga predominante del sistema.
CREATE INDEX IDX_CONTROL_MENSUAL_COSTO_PERIODO
    ON CONTROL_MENSUAL_COSTO (mes_referencia, anio_referencia);


-- =============================================================================
-- BLOQUE 2: ÍNDICE DE BÚSQUEDA PATRIMONIAL
-- Objetivo: El personal de Garaje identifica los vehículos por su placa de
--           rodaje (dato visible físicamente) y no por el código interno.
--           Sin índice, cada búsqueda por placa genera un Full Table Scan
--           sobre VEHICULO, degradando la respuesta en flotas grandes.
-- =============================================================================

-- Convierte la búsqueda exacta por placa (WHERE placa_rodaje = 'ABC-123')
-- en una búsqueda de coste O(log n). Aunque la columna ya tiene constraint
-- UNIQUE, muchos motores crean automáticamente un índice único subyacente;
-- se declara explícitamente para garantizarlo en todos los motores y para
-- documentar la intención de optimización.
CREATE INDEX IDX_VEHICULO_PLACA_RODAJE
    ON VEHICULO (placa_rodaje);


-- =============================================================================
-- BLOQUE 3: ÍNDICES DE LLAVES FORÁNEAS (AGRUPACIÓN POR ORDEN DE SERVICIO)
-- Objetivo: Cuando se consolida una factura de taller o se audita una OS,
--           el motor hace un JOIN de ORDEN_SERVICIO_TALLER con sus tres
--           tablas hijas (mano de obra, materiales, autorización externa).
--           Sin índice en la FK del lado hijo, cada JOIN requiere un
--           Full Table Scan de la tabla hija por cada fila padre encontrada
--           (Nested Loop de alto costo). El índice sobre numero_os permite
--           acceso directo a todas las filas relacionadas con una OS dada.
-- =============================================================================

-- Agrupa todos los registros de horas trabajadas pertenecientes a una misma
-- Orden de Servicio; esencial para calcular el costo total de mano de obra propia.
CREATE INDEX IDX_TARJETA_MANO_OBRA_NUMERO_OS
    ON TARJETA_MANO_OBRA (numero_os);

-- Agrupa todos los repuestos despachados para una misma Orden de Servicio;
-- fundamental para obtener el costo total de materiales de una OS en una
-- sola operación de búsqueda por rango en el índice.
CREATE INDEX IDX_DETALLE_SOLICITUD_MATERIAL_NUMERO_OS
    ON DETALLE_SOLICITUD_MATERIAL (numero_os);

-- Permite recuperar la(s) autorización(es) de servicio externo vinculadas a
-- una OS específica sin escanear la tabla completa; clave para el JOIN que
-- relaciona el trabajo interno con su derivación a taller tercero.
CREATE INDEX IDX_AUTORIZACION_SERVICIO_EXTERNO_NUMERO_OS
    ON AUTORIZACION_SERVICIO_EXTERNO (numero_os);


-- =============================================================================
-- BLOQUE 4: ÍNDICE DE CONTROL PATRIMONIAL INDIVIDUALIZADO
-- Objetivo: Proveer trazabilidad completa del ciclo de vida de cada llanta o
--           conjunto físico. Las consultas de seguimiento recuperan todo el
--           historial de un neumático específico filtrando por numero_fabrica
--           a través de múltiples vehículos y períodos. Sin índice, el motor
--           debe recorrer toda la tabla HISTORIAL_FICHA_CONTROL —que crece
--           continuamente— para encontrar los registros de un solo componente.
-- =============================================================================

-- Indexa el identificador físico de la llanta/conjunto para que el historial
-- completo de un componente (instalaciones, retiros, kilómetros acumulados,
-- posiciones de rueda) se localice en tiempo O(log n) independientemente del
-- volumen total de registros en la tabla.
CREATE INDEX IDX_HISTORIAL_FICHA_CONTROL_NUMERO_FABRICA
    ON HISTORIAL_FICHA_CONTROL (numero_fabrica);


-- =============================================================================
-- BLOQUE 5: ÍNDICE DE AUDITORÍA DE ASIGNACIÓN DE SECTOR (CENTRO DE COSTOS)
-- Objetivo: Agilizar las auditorías por centros de costos del historial de
--           asignación de sectores a cada unidad vehicular.
-- =============================================================================

CREATE INDEX IDX_HISTORIAL_ASIGNACION_VEHICULO
    ON HISTORIAL_ASIGNACION_SECTOR (codigo_vehiculo);


-- =============================================================================
-- FIN DEL SCRIPT DE ÍNDICES
-- Total de índices creados: 10
--   Bloque 1 - Temporales          : 4 índices
--   Bloque 2 - Búsqueda Patrimonial: 1 índice
--   Bloque 3 - Llaves Foráneas     : 3 índices
--   Bloque 4 - Control Patrimonial : 1 índice
--   Bloque 5 - Auditoría/Historial : 1 índice
-- =============================================================================
