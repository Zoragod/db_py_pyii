-- =============================================================================
-- SISTEMA DE ADMINISTRACIÓN DE FLOTAS VEHICULARES
-- Script DDL - Data Definition Language
-- Versión: 1.0
-- Fecha: 2026-06-05
-- Autor: Arquitecto de Base de Datos Senior
--
-- NOTAS:
--   - Las tablas se crean en orden topológico (dependencias primero)
--     para que las FOREIGN KEY no generen errores.
--   - Se utiliza DECIMAL(10,2) para valores monetarios y cantidades
--     con decimales, evitando problemas de precisión con FLOAT.
--   - Los campos de texto usan VARCHAR con longitudes razonables.
--   - Se definen constraints con nombres explícitos para facilitar
--     el mantenimiento y la depuración.
-- =============================================================================


-- =============================================================================
-- MÓDULO 1: CATASTRO (NÚCLEO)
-- Tablas maestras independientes. No tienen dependencias externas.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tabla: SECTOR_SOLICITANTE
-- Representa las áreas o dependencias internas que solicitan el uso de vehículos.
-- -----------------------------------------------------------------------------
CREATE TABLE SECTOR_SOLICITANTE (
    id_sector       INT             NOT NULL,
    nombre_sector   VARCHAR(100)    NOT NULL,
    localidad       VARCHAR(100)    NOT NULL,
    CONSTRAINT PK_SECTOR_SOLICITANTE PRIMARY KEY (id_sector)
);

-- -----------------------------------------------------------------------------
-- Tabla: CONDUCTOR
-- Registro del personal habilitado para conducir los vehículos de la flota.
-- -----------------------------------------------------------------------------
CREATE TABLE CONDUCTOR (
    matricula_conductor     VARCHAR(20)     NOT NULL,
    nombre_conductor        VARCHAR(150)    NOT NULL,
    documento_identidad     VARCHAR(20)     NOT NULL,
    CONSTRAINT PK_CONDUCTOR PRIMARY KEY (matricula_conductor),
    CONSTRAINT UQ_CONDUCTOR_DOC UNIQUE (documento_identidad)
);

-- -----------------------------------------------------------------------------
-- Tabla: VEHICULO
-- Inventario de los vehículos que componen la flota.
-- Referencia a SECTOR_SOLICITANTE para indicar el sector que lo tiene asignado.
-- -----------------------------------------------------------------------------
CREATE TABLE VEHICULO (
    codigo_vehiculo         VARCHAR(6)      NOT NULL,
    placa_rodaje            VARCHAR(10)     NOT NULL,
    marca                   VARCHAR(50)     NOT NULL,
    modelo                  VARCHAR(50)     NOT NULL,
    ano_fabricacion         SMALLINT        NOT NULL,
    capacidad_carga_kg      DECIMAL(8,2)    NOT NULL,
    id_sector_asignado      INT             NOT NULL,
    CONSTRAINT PK_VEHICULO          PRIMARY KEY (codigo_vehiculo),
    CONSTRAINT UQ_VEHICULO_PLACA    UNIQUE (placa_rodaje),
    CONSTRAINT FK_VEHICULO_SECTOR   FOREIGN KEY (id_sector_asignado)
        REFERENCES SECTOR_SOLICITANTE (id_sector)
);


-- =============================================================================
-- MÓDULO 2: MOVIMIENTO (TRANSACCIONAL)
-- Registra los desplazamientos diarios de los vehículos y su abastecimiento.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tabla: MOVIMIENTO_DIARIO
-- Cada fila es un viaje o jornada de un vehículo conducido por un conductor.
-- -----------------------------------------------------------------------------
CREATE TABLE MOVIMIENTO_DIARIO (
    id_movimiento           INT             NOT NULL,
    codigo_vehiculo         VARCHAR(6)      NOT NULL,
    matricula_conductor     VARCHAR(20)     NOT NULL,
    fecha_movimiento        DATE            NOT NULL,
    hora_salida             TIME            NOT NULL,
    hora_llegada            TIME,                       -- Puede ser NULL si el viaje no ha concluido
    km_salida               DECIMAL(10,2)   NOT NULL,
    km_llegada              DECIMAL(10,2),
    destino                 VARCHAR(200)    NOT NULL,
    CONSTRAINT PK_MOVIMIENTO_DIARIO         PRIMARY KEY (id_movimiento),
    CONSTRAINT FK_MOVIMIENTO_VEHICULO       FOREIGN KEY (codigo_vehiculo)
        REFERENCES VEHICULO (codigo_vehiculo),
    CONSTRAINT FK_MOVIMIENTO_CONDUCTOR      FOREIGN KEY (matricula_conductor)
        REFERENCES CONDUCTOR (matricula_conductor)
);

-- -----------------------------------------------------------------------------
-- Tabla: SERVICENTRO_ACREDITADO
-- Catálogo de estaciones de servicio autorizadas para el abastecimiento.
-- -----------------------------------------------------------------------------
CREATE TABLE SERVICENTRO_ACREDITADO (
    id_servicentro      INT             NOT NULL,
    nombre_servicentro  VARCHAR(150)    NOT NULL,
    CONSTRAINT PK_SERVICENTRO_ACREDITADO PRIMARY KEY (id_servicentro)
);

-- -----------------------------------------------------------------------------
-- Tabla: ORDEN_ABASTECIMIENTO
-- Registra cada carga de combustible realizada durante (o asociada a) un movimiento.
-- -----------------------------------------------------------------------------
CREATE TABLE ORDEN_ABASTECIMIENTO (
    numero_orden            INT             NOT NULL,
    id_movimiento           INT             NOT NULL,
    id_servicentro          INT             NOT NULL,
    tipo_combustible        VARCHAR(50)     NOT NULL,   -- Ej: 'Gasolina 95', 'Diésel', 'GNV'
    galones_abastecidos     DECIMAL(8,3)    NOT NULL,
    kilometraje_actual      DECIMAL(10,2)   NOT NULL,
    CONSTRAINT PK_ORDEN_ABASTECIMIENTO          PRIMARY KEY (numero_orden),
    CONSTRAINT FK_ABASTECIMIENTO_MOVIMIENTO     FOREIGN KEY (id_movimiento)
        REFERENCES MOVIMIENTO_DIARIO (id_movimiento),
    CONSTRAINT FK_ABASTECIMIENTO_SERVICENTRO    FOREIGN KEY (id_servicentro)
        REFERENCES SERVICENTRO_ACREDITADO (id_servicentro)
);


-- =============================================================================
-- MÓDULO 3: MANTENIMIENTO INTERNO Y ALMACÉN
-- Gestión de órdenes de servicio en taller propio, mano de obra, llantas
-- y salida de repuestos del almacén.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tabla: ORDEN_SERVICIO_TALLER
-- Documento que autoriza y registra un trabajo de mantenimiento en el taller propio.
-- -----------------------------------------------------------------------------
CREATE TABLE ORDEN_SERVICIO_TALLER (
    numero_os               INT             NOT NULL,
    codigo_vehiculo         VARCHAR(6)      NOT NULL,
    fecha_emision           DATE            NOT NULL,
    tipo_mantenimiento      VARCHAR(100)    NOT NULL,   -- Ej: 'Preventivo', 'Correctivo', 'Predictivo'
    km_entrada              DECIMAL(10,2)   NOT NULL,
    km_salida               DECIMAL(10,2),              -- NULL hasta que el servicio finalice
    CONSTRAINT PK_ORDEN_SERVICIO_TALLER     PRIMARY KEY (numero_os),
    CONSTRAINT FK_OS_VEHICULO               FOREIGN KEY (codigo_vehiculo)
        REFERENCES VEHICULO (codigo_vehiculo)
);

-- -----------------------------------------------------------------------------
-- Tabla: MECANICO
-- Registro del personal técnico del taller interno.
-- -----------------------------------------------------------------------------
CREATE TABLE MECANICO (
    matricula_mecanico      VARCHAR(20)     NOT NULL,
    nombre_mecanico         VARCHAR(150)    NOT NULL,
    CONSTRAINT PK_MECANICO PRIMARY KEY (matricula_mecanico)
);

-- -----------------------------------------------------------------------------
-- Tabla: TARJETA_MANO_OBRA
-- Detalla las horas trabajadas por cada mecánico en una Orden de Servicio.
-- -----------------------------------------------------------------------------
CREATE TABLE TARJETA_MANO_OBRA (
    id_tarjeta                  INT             NOT NULL,
    numero_os                   INT             NOT NULL,
    matricula_mecanico          VARCHAR(20)     NOT NULL,
    fecha_trabajo               DATE            NOT NULL,
    codigo_servicio_ejecutado   VARCHAR(50)     NOT NULL,   -- Código interno del servicio realizado
    hora_inicio                 TIME            NOT NULL,
    hora_final                  TIME            NOT NULL,
    CONSTRAINT PK_TARJETA_MANO_OBRA         PRIMARY KEY (id_tarjeta),
    CONSTRAINT FK_TARJETA_OS                FOREIGN KEY (numero_os)
        REFERENCES ORDEN_SERVICIO_TALLER (numero_os),
    CONSTRAINT FK_TARJETA_MECANICO          FOREIGN KEY (matricula_mecanico)
        REFERENCES MECANICO (matricula_mecanico)
);

-- -----------------------------------------------------------------------------
-- Tabla: LLANTA_O_CONJUNTO
-- Inventario de llantas y conjuntos (aros + llanta) identificados por número de fábrica.
-- -----------------------------------------------------------------------------
CREATE TABLE LLANTA_O_CONJUNTO (
    numero_fabrica      VARCHAR(50)     NOT NULL,
    fabricante          VARCHAR(100)    NOT NULL,
    dimension           VARCHAR(30)     NOT NULL,   -- Ej: '295/80 R22.5'
    modelo              VARCHAR(100)    NOT NULL,
    tipo_elemento       VARCHAR(50)     NOT NULL,   -- Ej: 'Llanta', 'Reencauchada', 'Conjunto'
    CONSTRAINT PK_LLANTA_O_CONJUNTO PRIMARY KEY (numero_fabrica)
);

-- -----------------------------------------------------------------------------
-- Tabla: HISTORIAL_FICHA_CONTROL
-- Trazabilidad de cada llanta: en qué vehículo estuvo y en qué posición,
-- junto con los kilómetros de instalación y retiro.
-- -----------------------------------------------------------------------------
CREATE TABLE HISTORIAL_FICHA_CONTROL (
    id_historial        INT             NOT NULL,
    numero_fabrica      VARCHAR(50)     NOT NULL,
    codigo_vehiculo     VARCHAR(6)      NOT NULL,
    fecha_instalacion   DATE            NOT NULL,
    fecha_retiro        DATE,                       -- NULL si la llanta sigue instalada
    km_instalacion      DECIMAL(10,2)   NOT NULL,
    km_retiro           DECIMAL(10,2),
    posicion_rueda      VARCHAR(20)     NOT NULL,   -- Ej: 'Delantera Izquierda', 'Trasera Derecha Exterior'
    CONSTRAINT PK_HISTORIAL_FICHA_CONTROL   PRIMARY KEY (id_historial),
    CONSTRAINT FK_HISTORIAL_LLANTA          FOREIGN KEY (numero_fabrica)
        REFERENCES LLANTA_O_CONJUNTO (numero_fabrica),
    CONSTRAINT FK_HISTORIAL_VEHICULO        FOREIGN KEY (codigo_vehiculo)
        REFERENCES VEHICULO (codigo_vehiculo)
);

-- -----------------------------------------------------------------------------
-- Tabla: REPUESTO_ALMACEN
-- Catálogo de piezas y materiales disponibles en el almacén propio.
-- -----------------------------------------------------------------------------
CREATE TABLE REPUESTO_ALMACEN (
    codigo_repuesto     VARCHAR(30)     NOT NULL,
    descripcion         VARCHAR(200)    NOT NULL,
    costo_unitario      DECIMAL(10,2)   NOT NULL,
    CONSTRAINT PK_REPUESTO_ALMACEN PRIMARY KEY (codigo_repuesto)
);

-- -----------------------------------------------------------------------------
-- Tabla: DETALLE_SOLICITUD_MATERIAL
-- Relación N:M entre una Orden de Servicio y los repuestos utilizados.
-- Registra cantidad consumida y el costo total calculado al momento del retiro.
-- -----------------------------------------------------------------------------
CREATE TABLE DETALLE_SOLICITUD_MATERIAL (
    id_detalle              INT             NOT NULL,
    numero_os               INT             NOT NULL,
    codigo_repuesto         VARCHAR(30)     NOT NULL,
    cantidad                DECIMAL(8,3)    NOT NULL,
    costo_total_repuesto    DECIMAL(12,2)   NOT NULL,   -- = cantidad × costo_unitario histórico
    CONSTRAINT PK_DETALLE_SOLICITUD_MATERIAL    PRIMARY KEY (id_detalle),
    CONSTRAINT FK_DETALLE_MAT_OS                FOREIGN KEY (numero_os)
        REFERENCES ORDEN_SERVICIO_TALLER (numero_os),
    CONSTRAINT FK_DETALLE_MAT_REPUESTO          FOREIGN KEY (codigo_repuesto)
        REFERENCES REPUESTO_ALMACEN (codigo_repuesto)
);


-- =============================================================================
-- MÓDULO 4: EXTERNALIZACIÓN (TALLERES PRIVADOS)
-- Controla los servicios de mantenimiento contratados a talleres externos.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tabla: TALLER_TERCEROS
-- Catálogo de proveedores de servicios de mantenimiento externos.
-- -----------------------------------------------------------------------------
CREATE TABLE TALLER_TERCEROS (
    id_taller_tercero       INT             NOT NULL,
    nombre_taller           VARCHAR(150)    NOT NULL,
    datos_comunicacion      VARCHAR(300),               -- Teléfonos, email, dirección, etc.
    CONSTRAINT PK_TALLER_TERCEROS PRIMARY KEY (id_taller_tercero)
);

-- -----------------------------------------------------------------------------
-- Tabla: AUTORIZACION_SERVICIO_EXTERNO
-- Documento que aprueba el envío de un vehículo a un taller externo.
-- Vinculada a la Orden de Servicio de Taller que generó la necesidad.
-- -----------------------------------------------------------------------------
CREATE TABLE AUTORIZACION_SERVICIO_EXTERNO (
    numero_autorizacion     INT             NOT NULL,
    numero_os               INT             NOT NULL,   -- OS que origina el servicio externo
    id_taller_tercero       INT             NOT NULL,
    fecha_emision           DATE            NOT NULL,
    fecha_entrada_taller    DATE,
    km_entrada              DECIMAL(10,2),
    fecha_salida_taller     DATE,
    km_salida               DECIMAL(10,2),
    fecha_aprobacion        DATE,
    CONSTRAINT PK_AUTORIZACION_SERVICIO_EXTERNO     PRIMARY KEY (numero_autorizacion),
    CONSTRAINT FK_AUTORIZACION_OS                   FOREIGN KEY (numero_os)
        REFERENCES ORDEN_SERVICIO_TALLER (numero_os),
    CONSTRAINT FK_AUTORIZACION_TALLER               FOREIGN KEY (id_taller_tercero)
        REFERENCES TALLER_TERCEROS (id_taller_tercero)
);

-- -----------------------------------------------------------------------------
-- Tabla: DETALLE_SERVICIO_EXTERNO
-- Desglose de los trabajos presupuestados dentro de una Autorización de Servicio.
-- -----------------------------------------------------------------------------
CREATE TABLE DETALLE_SERVICIO_EXTERNO (
    id_detalle_externo      INT             NOT NULL,
    numero_autorizacion     INT             NOT NULL,
    descripcion_servicio    VARCHAR(300)    NOT NULL,
    valor_presupuestado     DECIMAL(12,2)   NOT NULL,
    CONSTRAINT PK_DETALLE_SERVICIO_EXTERNO          PRIMARY KEY (id_detalle_externo),
    CONSTRAINT FK_DETALLE_EXT_AUTORIZACION          FOREIGN KEY (numero_autorizacion)
        REFERENCES AUTORIZACION_SERVICIO_EXTERNO (numero_autorizacion)
);


-- =============================================================================
-- MÓDULO 5: FINANCIERO (CONSOLIDADOR MENSUAL)
-- Agrega todos los costos asociados a cada vehículo por período mensual.
-- Es el módulo de más alto nivel; depende de VEHICULO.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tabla: CONTROL_MENSUAL_COSTO
-- Cierre mensual de costos por vehículo. Consolida KPIs operativos y financieros.
-- La PK compuesta (codigo_vehiculo, mes_referencia, anio_referencia) evita
-- duplicados de período; se añade un surrogate key id_control_mensual
-- para simplificar las referencias desde herramientas de reporte.
-- -----------------------------------------------------------------------------
CREATE TABLE CONTROL_MENSUAL_COSTO (
    id_control_mensual              INT             NOT NULL,
    codigo_vehiculo                 VARCHAR(6)      NOT NULL,
    mes_referencia                  TINYINT         NOT NULL,   -- 1 = Enero … 12 = Diciembre
    anio_referencia                 SMALLINT        NOT NULL,
    total_kilometros_recorridos     DECIMAL(10,2)   NOT NULL    DEFAULT 0,
    total_horas_uso                 DECIMAL(8,2)    NOT NULL    DEFAULT 0,
    costo_total_combustible         DECIMAL(12,2)   NOT NULL    DEFAULT 0,
    costo_mano_obra_propia          DECIMAL(12,2)   NOT NULL    DEFAULT 0,
    costo_repuestos_propios         DECIMAL(12,2)   NOT NULL    DEFAULT 0,
    costo_talleres_terceros         DECIMAL(12,2)   NOT NULL    DEFAULT 0,
    costo_fijo_vehiculo             DECIMAL(12,2)   NOT NULL    DEFAULT 0,
    costo_fijo_prorrateado          DECIMAL(12,2)   NOT NULL    DEFAULT 0,
    costo_variable                  DECIMAL(12,2)   NOT NULL    DEFAULT 0,
    costo_por_kilometro             DECIMAL(10,4)   NOT NULL    DEFAULT 0,  -- Mayor precisión para KPI
    CONSTRAINT PK_CONTROL_MENSUAL_COSTO             PRIMARY KEY (id_control_mensual),
    CONSTRAINT UQ_CONTROL_MENSUAL_PERIODO           UNIQUE (codigo_vehiculo, mes_referencia, anio_referencia),
    CONSTRAINT FK_CONTROL_MENSUAL_VEHICULO          FOREIGN KEY (codigo_vehiculo)
        REFERENCES VEHICULO (codigo_vehiculo),
    CONSTRAINT CK_MES_REFERENCIA                    CHECK (mes_referencia BETWEEN 1 AND 12),
    CONSTRAINT CK_ANIO_REFERENCIA                   CHECK (anio_referencia > 1900)
);


-- =============================================================================
-- FIN DEL SCRIPT DDL
-- Total de tablas creadas: 17
--   Módulo 1 - Catastro           : 3 tablas
--   Módulo 2 - Movimiento         : 3 tablas
--   Módulo 3 - Mantenimiento/Almacén: 7 tablas
--   Módulo 4 - Externalización    : 3 tablas
--   Módulo 5 - Financiero         : 1 tabla
-- =============================================================================
