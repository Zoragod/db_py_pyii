-- =============================================================================
-- Vista: vista_costos_mensuales
-- Consolida los costos de cada vehículo por mes, incluyendo datos del
-- vehículo y su sector. Útil para reportes ejecutivos de gerencia.
-- =============================================================================

CREATE OR REPLACE VIEW vista_costos_mensuales AS
SELECT
    cmc.anio_referencia                                         AS anio,
    cmc.mes_referencia                                          AS mes,
    v.codigo_vehiculo,
    v.placa_rodaje,
    v.marca,
    v.modelo,
    ss.nombre_sector,
    ss.localidad,
    cmc.total_kilometros_recorridos,
    cmc.total_horas_uso,
    -- Costos desagregados
    cmc.costo_total_combustible,
    cmc.costo_mano_obra_propia,
    cmc.costo_repuestos_propios,
    cmc.costo_talleres_terceros,
    cmc.costo_fijo_vehiculo,
    cmc.costo_fijo_prorrateado,
    cmc.costo_variable,
    -- Costo total calculado
    (
        cmc.costo_total_combustible  +
        cmc.costo_mano_obra_propia   +
        cmc.costo_repuestos_propios  +
        cmc.costo_talleres_terceros  +
        cmc.costo_fijo_vehiculo      +
        cmc.costo_fijo_prorrateado   +
        cmc.costo_variable
    )                                                           AS costo_total_mes,
    cmc.costo_por_kilometro,
    -- Participación porcentual de combustible
    CASE
        WHEN cmc.costo_total_combustible > 0
        THEN ROUND(
            cmc.costo_total_combustible * 100.0 /
            NULLIF(
                cmc.costo_total_combustible +
                cmc.costo_mano_obra_propia  +
                cmc.costo_repuestos_propios +
                cmc.costo_talleres_terceros +
                cmc.costo_fijo_vehiculo     +
                cmc.costo_fijo_prorrateado  +
                cmc.costo_variable,
                0
            ), 2
        )
        ELSE 0
    END                                                         AS pct_combustible
FROM       control_mensual_costo  cmc
INNER JOIN vehiculo               v   ON v.codigo_vehiculo   = cmc.codigo_vehiculo
INNER JOIN sector_solicitante     ss  ON ss.id_sector        = v.id_sector_asignado
ORDER BY
    cmc.anio_referencia  DESC,
    cmc.mes_referencia   DESC,
    v.codigo_vehiculo    ASC;
