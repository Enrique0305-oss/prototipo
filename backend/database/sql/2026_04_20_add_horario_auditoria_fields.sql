-- ============================================================================
-- Auditoria: migrar de horas por día / horas totales a horario por rango
-- Fecha: 2026-04-20
-- Descripción:
--   1) Agrega horario_auditoria (JSON) en cotizacion_detalle.
--   2) Agrega hora_fin_auditoria (TIME) en orden_auditoria.
--   3) Elimina horas_totales (legado) en orden_auditoria.
-- ============================================================================

ALTER TABLE cotizacion_detalle
    ADD COLUMN horario_auditoria JSON NULL AFTER frecuencia_visita;

ALTER TABLE orden_auditoria
    ADD COLUMN hora_fin_auditoria TIME NULL AFTER hora_servicio;

ALTER TABLE orden_auditoria
    DROP COLUMN horas_totales;

-- Para agregar columna costo_envio a ordenes_compra
ALTER TABLE ordenes_compra ADD COLUMN costo_envio DECIMAL(12, 4) DEFAULT 0 AFTER subtotal;

-- Para Proyecciones
ALTER TABLE proyecciones 
MODIFY actividad VARCHAR(100) NULL,
MODIFY n_factura VARCHAR(100) NULL,
MODIFY dias_credito INT NULL;

--  PROYECCIONES AUTOMATICAS
INSERT INTO proyecciones (
    id_multicim,
    id_orden_servicio,
    actividad,
    n_factura,
    dias_credito,
    fecha_factura,
    fecha_pago,
    fecha_ejecucion,
    fecha_vcto,
    dia_vencer,
    monto_detrax,
    total_final
)
SELECT
    1 as id_multicim,
    os.id as id_orden_servicio,
    NULL as actividad,
    NULL as n_factura,
    NULL as dias_credito,
    NULL as fecha_factura,
    NULL as fecha_pago,
    os.fecha_tentativa as fecha_ejecucion,
    NULL as fecha_vcto,
    NULL as dia_vencer,
    IF(os.total_costo > 700, ROUND(os.total_costo * 0.12, 2), 0) as monto_detrax,
    IF(os.total_costo > 700, os.total_costo - ROUND(os.total_costo * 0.12, 2), os.total_costo) as total_final
FROM orden_servicio os
LEFT JOIN proyecciones p ON os.id = p.id_orden_servicio
WHERE os.estado != 'cancelada'
AND p.id IS NULL;