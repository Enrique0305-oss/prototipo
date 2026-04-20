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