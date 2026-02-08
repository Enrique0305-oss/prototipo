-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 07-02-2026 a las 08:40:11
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sistema_plagas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actividades_mantenieminto`
--

CREATE TABLE `actividades_mantenieminto` (
  `id` int(11) NOT NULL,
  `categoria` enum('Programado','Entregado','Garantia') DEFAULT NULL,
  `estado` enum('Activo','Desactivo') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `area`
--

CREATE TABLE `area` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `estado` enum('Activo','Inactivo') DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `caja_chica`
--

CREATE TABLE `caja_chica` (
  `id` int(11) NOT NULL,
  `fecha` date DEFAULT NULL,
  `solicitante` varchar(100) NOT NULL,
  `area` varchar(100) NOT NULL,
  `proveedor` varchar(100) NOT NULL,
  `n_documento` varchar(100) NOT NULL,
  `concepto` varchar(100) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `egreso` decimal(10,2) NOT NULL,
  `ingreso` decimal(10,2) NOT NULL,
  `saldo` decimal(10,2) NOT NULL,
  `campo_nuevo` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `estado` enum('Activo','Inactivo') DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `id` int(11) NOT NULL,
  `nombre_empresa` varchar(100) NOT NULL,
  `ruc` char(11) NOT NULL,
  `rubro` varchar(150) NOT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `estado` enum('Acepta','No acepta','Contactado') NOT NULL DEFAULT 'Contactado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cotizacion`
--

CREATE TABLE `cotizacion` (
  `id` int(11) NOT NULL,
  `numero_cotizacion` varchar(20) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `fecha_emision` date NOT NULL,
  `id_personal_creador` int(11) NOT NULL,
  `estado` enum('Pendiente','Aceptada','Rechazada') DEFAULT 'Pendiente',
  `tipo_cotizacion` enum('Servicio','Producto','Capacitacion') NOT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `igv` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cotizacion_detalle`
--

CREATE TABLE `cotizacion_detalle` (
  `id` int(11) NOT NULL,
  `id_cotizacion` int(11) NOT NULL,
  `id_servicio` int(11) DEFAULT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `descripcion_manual` varchar(255) DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `frecuencia_sugerida` varchar(100) DEFAULT NULL,
  `modalidad_sugerida` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_orden_producto`
--

CREATE TABLE `detalle_orden_producto` (
  `id` int(11) NOT NULL,
  `id_orden_producto` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_orden_servicio`
--

CREATE TABLE `detalle_orden_servicio` (
  `id` int(11) NOT NULL,
  `id_orden_servicio` int(11) NOT NULL,
  `id_servicio` int(11) NOT NULL,
  `local` varchar(100) DEFAULT NULL,
  `frecuencia` varchar(100) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `equipo`
--

CREATE TABLE `equipo` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `marca` varchar(100) NOT NULL,
  `modelo` varchar(100) NOT NULL,
  `serie` int(11) NOT NULL,
  `encargado` varchar(100) NOT NULL,
  `responsable` varchar(100) NOT NULL,
  `contacto` int(11) NOT NULL,
  `estado` enum('Activo','Inactivo') DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE `inventario` (
  `id` int(11) NOT NULL,
  `id_productos` int(11) DEFAULT NULL,
  `cantidad_disponible` int(11) NOT NULL,
  `stock_seguridad` int(11) NOT NULL,
  `Tipo` enum('Entrada','Salida') DEFAULT NULL,
  `Cantidad_total` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mantenimiento`
--

CREATE TABLE `mantenimiento` (
  `id` int(11) NOT NULL,
  `id_equipo` int(11) DEFAULT NULL,
  `id_actmanten` int(11) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `observaciones` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `multicim`
--

CREATE TABLE `multicim` (
  `id` int(11) NOT NULL,
  `nombre_empresa` varchar(100) NOT NULL,
  `alias_empresa` varchar(100) NOT NULL,
  `ruc` int(11) NOT NULL,
  `cuenta_bcp` varchar(100) NOT NULL,
  `codigo_interbancario_bcp` varchar(100) NOT NULL,
  `banco_nacion` varchar(100) NOT NULL,
  `codigo_interbancario_nacion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oei_fichas`
--

CREATE TABLE `oei_fichas` (
  `id` int(11) NOT NULL,
  `n_ficha` varchar(20) NOT NULL,
  `id_programacion` int(11) NOT NULL,
  `id_tecnico` int(11) NOT NULL,
  `fecha_servicio` date NOT NULL,
  `hora_inicio_servicio` time DEFAULT NULL,
  `hora_fin_servicio` time DEFAULT NULL,
  `diagnostico_previo` text DEFAULT NULL,
  `condicion_sanitaria` text DEFAULT NULL,
  `observaciones_tecnicas` text DEFAULT NULL,
  `acciones_realizadas` text DEFAULT NULL,
  `fotos_evidencia` text DEFAULT NULL,
  `firma_tecnico` varchar(255) DEFAULT NULL,
  `firma_cliente` varchar(255) DEFAULT NULL,
  `nombre_quien_recibe` varchar(100) DEFAULT NULL,
  `estado_servicio` enum('Completo','Parcial','Reprogramado','Cancelado') DEFAULT 'Completo',
  `recibida_oei` tinyint(1) DEFAULT 0,
  `recibida_por` int(11) DEFAULT NULL,
  `fecha_recepcion` datetime DEFAULT NULL,
  `coincide_cronograma` tinyint(1) DEFAULT 1,
  `creado_por` int(11) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `modificado_por` int(11) DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Fichas técnicas de servicios realizados';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oei_ficha_anexos`
--

CREATE TABLE `oei_ficha_anexos` (
  `id` int(11) NOT NULL,
  `id_ficha` int(11) NOT NULL,
  `tipo_anexo` enum('Plano','Foto','Documento','Otro') NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `ruta_archivo` varchar(255) NOT NULL,
  `fecha_carga` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Anexos adicionales de las fichas técnicas';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oei_ficha_monitoreo`
--

CREATE TABLE `oei_ficha_monitoreo` (
  `id` int(11) NOT NULL,
  `id_ficha` int(11) NOT NULL,
  `codigo_dispositivo` varchar(20) NOT NULL,
  `tipo_dispositivo` enum('Trampa de Luz','Cebadero','Trampa de Pegamento','Estación','Otro') DEFAULT 'Otro',
  `area_ubicacion` varchar(100) DEFAULT NULL,
  `animal_objetivo` varchar(50) DEFAULT NULL,
  `especimen` varchar(50) DEFAULT NULL,
  `hallazgo_cantidad` int(11) DEFAULT 0,
  `estado_dispositivo` enum('Bueno','Regular','Dañado','Reemplazado') DEFAULT 'Bueno',
  `accion_tomada` varchar(255) DEFAULT NULL,
  `foto_evidencia` varchar(255) DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Detalle de monitoreo para gráficos de tendencias';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oei_informe_detalle_fichas`
--

CREATE TABLE `oei_informe_detalle_fichas` (
  `id_informe` int(11) NOT NULL,
  `id_ficha` int(11) NOT NULL,
  `orden` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Relación entre informes y fichas incluidas';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oei_informe_final`
--

CREATE TABLE `oei_informe_final` (
  `id` int(11) NOT NULL,
  `codigo_informe` varchar(20) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `mes_reportado` int(11) NOT NULL,
  `anio_reportado` int(11) NOT NULL,
  `periodo` varchar(7) GENERATED ALWAYS AS (concat(`anio_reportado`,_utf8mb4'-',lpad(`mes_reportado`,2,_utf8mb4'0'))) STORED,
  `fecha_emision` date DEFAULT NULL,
  `fecha_revision` date DEFAULT NULL,
  `fecha_aprobacion` date DEFAULT NULL,
  `fecha_envio_cliente` date DEFAULT NULL,
  `id_personal_elaboro` int(11) NOT NULL,
  `id_personal_reviso` int(11) DEFAULT NULL,
  `id_personal_aprobo` int(11) DEFAULT NULL,
  `conclusiones_generales` text DEFAULT NULL,
  `recomendaciones_cliente` text DEFAULT NULL,
  `observaciones_revision` text DEFAULT NULL,
  `estado_informe` enum('Borrador','En Revisión','Aprobado','Enviado','Rechazado') DEFAULT 'Borrador',
  `ruta_pdf_final` varchar(255) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `modificado_por` int(11) DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Informes mensuales para clientes';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_capacitacion_auditoria`
--

CREATE TABLE `orden_capacitacion_auditoria` (
  `id` int(11) NOT NULL,
  `numero_orden` varchar(20) NOT NULL,
  `id_cotizacion` int(11) DEFAULT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_servicio` int(11) NOT NULL,
  `id_ponente` int(11) NOT NULL,
  `fecha_servicio` date DEFAULT NULL,
  `hora_servicio` time DEFAULT NULL,
  `modalidad` enum('Presencial','Virtual','Híbrido') DEFAULT NULL,
  `num_participantes` int(11) DEFAULT NULL,
  `num_certificados` int(11) DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT NULL,
  `aprobacion` varchar(100) DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_producto`
--

CREATE TABLE `orden_producto` (
  `id` int(11) NOT NULL,
  `numero_orden` varchar(20) NOT NULL,
  `id_cotizacion` int(11) DEFAULT NULL,
  `id_cliente` int(11) NOT NULL,
  `fecha_envio` date DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `emitido_por` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_servicio`
--

CREATE TABLE `orden_servicio` (
  `id` int(11) NOT NULL,
  `numero_orden` varchar(20) NOT NULL,
  `codigo_doc` varchar(20) DEFAULT 'OS-AC-001',
  `version` varchar(10) DEFAULT '01',
  `id_cotizacion` int(11) DEFAULT NULL,
  `id_cliente` int(11) NOT NULL,
  `fecha_aceptacion` date DEFAULT NULL,
  `fecha_tentativa` date DEFAULT NULL,
  `total_costo` decimal(10,2) DEFAULT NULL,
  `emitido_por` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal`
--

CREATE TABLE `personal` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `celular` char(13) NOT NULL,
  `correo` varchar(50) NOT NULL,
  `id_area` int(11) DEFAULT NULL,
  `usuario` varchar(100) NOT NULL,
  `password` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(200) NOT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `fecha_vencim` date DEFAULT NULL,
  `ubicacion` varchar(50) NOT NULL,
  `n_lote` varchar(50) NOT NULL,
  `estado` enum('Activo','Inactivo') DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_historial`
--

CREATE TABLE `programacion_historial` (
  `id` int(11) NOT NULL,
  `id_programacion` int(11) NOT NULL,
  `campo_modificado` varchar(50) DEFAULT NULL,
  `valor_anterior` varchar(255) DEFAULT NULL,
  `valor_nuevo` varchar(255) DEFAULT NULL,
  `motivo` text DEFAULT NULL,
  `modificado_por` int(11) DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_insumos`
--

CREATE TABLE `programacion_insumos` (
  `id` int(11) NOT NULL,
  `id_programacion` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad_asignada` int(11) NOT NULL,
  `cantidad_utilizada` int(11) DEFAULT NULL,
  `estado` enum('Asignado','Entregado','Utilizado','Devuelto') DEFAULT 'Asignado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_notificaciones`
--

CREATE TABLE `programacion_notificaciones` (
  `id` int(11) NOT NULL,
  `id_programacion` int(11) NOT NULL,
  `tipo` enum('Asignacion','Modificacion','Recordatorio','Cancelacion') NOT NULL,
  `destinatario_tipo` enum('Tecnico','Cliente','Supervisor') NOT NULL,
  `id_destinatario` int(11) NOT NULL,
  `mensaje` text DEFAULT NULL,
  `enviado` tinyint(1) DEFAULT 0,
  `fecha_envio` datetime DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_servicio`
--

CREATE TABLE `programacion_servicio` (
  `id` int(11) NOT NULL,
  `id_orden_servicio` int(11) DEFAULT NULL,
  `id_orden_capacitacion` int(11) DEFAULT NULL,
  `id_servicio` int(11) NOT NULL,
  `id_tecnico_asignado` int(11) NOT NULL,
  `id_supervisor` int(11) DEFAULT NULL,
  `id_vehiculo` int(11) DEFAULT NULL,
  `fecha_programada` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time DEFAULT NULL,
  `duracion_real` int(11) DEFAULT NULL,
  `local_sede` varchar(150) DEFAULT NULL,
  `direccion_completa` varchar(255) DEFAULT NULL,
  `coordenadas` varchar(50) DEFAULT NULL,
  `estado_ejecucion` enum('Programado','Confirmado','En Camino','En Ejecución','Realizado','Reprogramado','Cancelado') DEFAULT 'Programado',
  `fecha_ejecucion_real` datetime DEFAULT NULL,
  `certificado_generado` tinyint(1) DEFAULT 0,
  `ruta_pdf_certificado` varchar(255) DEFAULT NULL,
  `ruta_pdf_agenda` varchar(255) DEFAULT NULL,
  `fotos_evidencia` text DEFAULT NULL,
  `firma_cliente` varchar(255) DEFAULT NULL,
  `calificacion_cliente` int(11) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `modificado_por` int(11) DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proyecciones`
--

CREATE TABLE `proyecciones` (
  `id` int(11) NOT NULL,
  `actividad` varchar(100) NOT NULL,
  `id_multicim` int(11) NOT NULL,
  `id_orden_servicio` int(11) NOT NULL,
  `n_factura` varchar(100) NOT NULL,
  `monto_detrax` decimal(10,2) NOT NULL,
  `total_final` decimal(10,2) NOT NULL,
  `fecha_factura` date DEFAULT NULL,
  `dias_credito` int(11) NOT NULL,
  `fecha_vcto` date DEFAULT NULL,
  `dia_vencer` int(11) NOT NULL,
  `fecha_pago` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rrhh_asistencia`
--

CREATE TABLE `rrhh_asistencia` (
  `id` int(11) NOT NULL,
  `id_personal` int(11) DEFAULT NULL,
  `id_tecnico` int(11) DEFAULT NULL,
  `id_programacion` int(11) DEFAULT NULL,
  `fecha` date NOT NULL,
  `tipo_registro` enum('Oficina','Campo') NOT NULL,
  `hora_entrada` time NOT NULL,
  `hora_salida` time DEFAULT NULL,
  `hora_esperada_entrada` time DEFAULT NULL,
  `hora_esperada_salida` time DEFAULT NULL,
  `gps_entrada` varchar(100) DEFAULT NULL,
  `gps_salida` varchar(100) DEFAULT NULL,
  `distancia_cliente_metros` decimal(10,2) DEFAULT NULL,
  `dentro_rango_50m` tinyint(1) DEFAULT 0,
  `foto_entrada` varchar(255) DEFAULT NULL,
  `foto_salida` varchar(255) DEFAULT NULL,
  `fotos_servicio` text DEFAULT NULL,
  `horas_trabajadas` decimal(5,2) DEFAULT NULL,
  `tardanza_minutos` int(11) DEFAULT 0,
  `estado` enum('Puntual','Tardanza','Falta','Fuera de Rango','Incompleto','Justificada') DEFAULT 'Incompleto',
  `observaciones` text DEFAULT NULL,
  `justificacion` varchar(255) DEFAULT NULL,
  `registrado_via` enum('AppSheet','Web','Manual') DEFAULT 'AppSheet',
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `modificado_por` int(11) DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Registro unificado de asistencia para administrativos y técnicos';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rrhh_horarios`
--

CREATE TABLE `rrhh_horarios` (
  `id` int(11) NOT NULL,
  `id_personal` int(11) DEFAULT NULL,
  `id_tecnico` int(11) DEFAULT NULL,
  `dia_semana` enum('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo') NOT NULL,
  `hora_entrada_esperada` time NOT NULL,
  `hora_salida_esperada` time NOT NULL,
  `tolerancia_minutos` int(11) DEFAULT 10,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Horarios laborales esperados por empleado';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rrhh_justificaciones`
--

CREATE TABLE `rrhh_justificaciones` (
  `id` int(11) NOT NULL,
  `id_asistencia` int(11) NOT NULL,
  `tipo` enum('Tardanza','Falta','Salida Anticipada','Permiso') NOT NULL,
  `motivo` text NOT NULL,
  `documento_respaldo` varchar(255) DEFAULT NULL,
  `aprobado_por` int(11) DEFAULT NULL,
  `estado_aprobacion` enum('Pendiente','Aprobado','Rechazado') DEFAULT 'Pendiente',
  `fecha_solicitud` datetime DEFAULT current_timestamp(),
  `fecha_respuesta` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Justificaciones de tardanzas y faltas';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios`
--

CREATE TABLE `servicios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `duracion_estimada` int(11) DEFAULT 60 COMMENT 'Duración estimada en minutos',
  `requiere_movilidad` tinyint(1) DEFAULT 0 COMMENT 'Si necesita vehículo (asignar a Jordi)',
  `requiere_certificado` tinyint(1) DEFAULT 0 COMMENT 'Si genera certificado al finalizar',
  `plantilla_certificado` varchar(255) DEFAULT NULL COMMENT 'Ruta de plantilla PDF'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tecnicos`
--

CREATE TABLE `tecnicos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `dni` char(8) NOT NULL,
  `celular` char(13) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `especialidad` varchar(100) DEFAULT NULL,
  `autorizado_conducir` tinyint(1) DEFAULT 0,
  `carga_maxima_semanal` int(11) DEFAULT 40,
  `estado` enum('Activo','Inactivo','Licencia') DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tecnico_disponibilidad`
--

CREATE TABLE `tecnico_disponibilidad` (
  `id` int(11) NOT NULL,
  `id_tecnico` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `tipo` enum('Laboral','Descanso','Vacaciones','Licencia','Feriado') DEFAULT 'Laboral',
  `horas_disponibles` int(11) DEFAULT 8,
  `observaciones` varchar(255) DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vehiculos`
--

CREATE TABLE `vehiculos` (
  `id` int(11) NOT NULL,
  `placa` varchar(10) NOT NULL,
  `modelo` varchar(50) DEFAULT NULL,
  `marca` varchar(50) DEFAULT NULL,
  `anio` int(11) DEFAULT NULL,
  `capacidad_carga` decimal(8,2) DEFAULT NULL,
  `estado` enum('Disponible','En Uso','Mantenimiento','Fuera de Servicio') DEFAULT 'Disponible'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `actividades_mantenieminto`
--
ALTER TABLE `actividades_mantenieminto`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `area`
--
ALTER TABLE `area`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `caja_chica`
--
ALTER TABLE `caja_chica`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `cotizacion`
--
ALTER TABLE `cotizacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cot_cli` (`id_cliente`),
  ADD KEY `fk_cot_per` (`id_personal_creador`);

--
-- Indices de la tabla `cotizacion_detalle`
--
ALTER TABLE `cotizacion_detalle`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_det_cot_orig` (`id_cotizacion`),
  ADD KEY `fk_det_cot_ser` (`id_servicio`),
  ADD KEY `fk_det_cot_pro` (`id_producto`);

--
-- Indices de la tabla `detalle_orden_producto`
--
ALTER TABLE `detalle_orden_producto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_dop_op` (`id_orden_producto`),
  ADD KEY `fk_dop_pro` (`id_producto`);

--
-- Indices de la tabla `detalle_orden_servicio`
--
ALTER TABLE `detalle_orden_servicio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_dos_os` (`id_orden_servicio`),
  ADD KEY `fk_dos_ser` (`id_servicio`);

--
-- Indices de la tabla `equipo`
--
ALTER TABLE `equipo`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_inventario_productos` (`id_productos`);

--
-- Indices de la tabla `mantenimiento`
--
ALTER TABLE `mantenimiento`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_mantenimiento_equipo` (`id_equipo`),
  ADD KEY `fk_mantenimiento_act` (`id_actmanten`);

--
-- Indices de la tabla `multicim`
--
ALTER TABLE `multicim`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `oei_fichas`
--
ALTER TABLE `oei_fichas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_n_ficha` (`n_ficha`),
  ADD KEY `idx_fecha` (`fecha_servicio`),
  ADD KEY `idx_estado` (`estado_servicio`),
  ADD KEY `idx_recibida` (`recibida_oei`),
  ADD KEY `fk_ficha_prog` (`id_programacion`),
  ADD KEY `fk_ficha_tec` (`id_tecnico`),
  ADD KEY `fk_ficha_recibidor` (`recibida_por`),
  ADD KEY `fk_ficha_creador` (`creado_por`),
  ADD KEY `fk_ficha_modificador` (`modificado_por`),
  ADD KEY `idx_fichas_pendientes` (`recibida_oei`,`fecha_servicio`);

--
-- Indices de la tabla `oei_ficha_anexos`
--
ALTER TABLE `oei_ficha_anexos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_anexo_ficha` (`id_ficha`);

--
-- Indices de la tabla `oei_ficha_monitoreo`
--
ALTER TABLE `oei_ficha_monitoreo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_dispositivo` (`codigo_dispositivo`),
  ADD KEY `fk_monitoreo_ficha` (`id_ficha`);

--
-- Indices de la tabla `oei_informe_detalle_fichas`
--
ALTER TABLE `oei_informe_detalle_fichas`
  ADD PRIMARY KEY (`id_informe`,`id_ficha`),
  ADD KEY `fk_bridge_ficha` (`id_ficha`);

--
-- Indices de la tabla `oei_informe_final`
--
ALTER TABLE `oei_informe_final`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_informe` (`codigo_informe`),
  ADD KEY `idx_periodo` (`periodo`),
  ADD KEY `idx_cliente` (`id_cliente`),
  ADD KEY `idx_estado` (`estado_informe`),
  ADD KEY `fk_inf_elaboro` (`id_personal_elaboro`),
  ADD KEY `fk_inf_reviso` (`id_personal_reviso`),
  ADD KEY `fk_inf_aprobo` (`id_personal_aprobo`),
  ADD KEY `fk_inf_modificador` (`modificado_por`),
  ADD KEY `idx_informes_cliente_periodo` (`id_cliente`,`periodo`);

--
-- Indices de la tabla `orden_capacitacion_auditoria`
--
ALTER TABLE `orden_capacitacion_auditoria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_oca_cot` (`id_cotizacion`),
  ADD KEY `fk_oca_cli` (`id_cliente`),
  ADD KEY `fk_oca_ser` (`id_servicio`),
  ADD KEY `fk_oca_pon` (`id_ponente`);

--
-- Indices de la tabla `orden_producto`
--
ALTER TABLE `orden_producto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_op_cot` (`id_cotizacion`),
  ADD KEY `fk_op_cli` (`id_cliente`),
  ADD KEY `fk_op_per` (`emitido_por`);

--
-- Indices de la tabla `orden_servicio`
--
ALTER TABLE `orden_servicio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_os_cot` (`id_cotizacion`),
  ADD KEY `fk_os_cli` (`id_cliente`),
  ADD KEY `fk_os_per` (`emitido_por`);

--
-- Indices de la tabla `personal`
--
ALTER TABLE `personal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_personal_area` (`id_area`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_productos_categoria` (`id_categoria`);

--
-- Indices de la tabla `programacion_historial`
--
ALTER TABLE `programacion_historial`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_hist_prog` (`id_programacion`),
  ADD KEY `fk_hist_user` (`modificado_por`);

--
-- Indices de la tabla `programacion_insumos`
--
ALTER TABLE `programacion_insumos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pi_prog` (`id_programacion`),
  ADD KEY `fk_pi_prod` (`id_producto`);

--
-- Indices de la tabla `programacion_notificaciones`
--
ALTER TABLE `programacion_notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notif_prog` (`id_programacion`);

--
-- Indices de la tabla `programacion_servicio`
--
ALTER TABLE `programacion_servicio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_fecha` (`fecha_programada`),
  ADD KEY `idx_tecnico_fecha` (`id_tecnico_asignado`,`fecha_programada`),
  ADD KEY `fk_prog_os` (`id_orden_servicio`),
  ADD KEY `fk_prog_oca` (`id_orden_capacitacion`),
  ADD KEY `fk_prog_serv` (`id_servicio`),
  ADD KEY `fk_prog_sup` (`id_supervisor`),
  ADD KEY `fk_prog_veh` (`id_vehiculo`),
  ADD KEY `fk_prog_creador` (`creado_por`),
  ADD KEY `fk_prog_modificador` (`modificado_por`),
  ADD KEY `idx_prog_estado` (`estado_ejecucion`),
  ADD KEY `idx_prog_fecha_estado` (`fecha_programada`,`estado_ejecucion`);

--
-- Indices de la tabla `proyecciones`
--
ALTER TABLE `proyecciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_proyeccion_multicim` (`id_multicim`),
  ADD KEY `fk_proyeccion_orden` (`id_orden_servicio`);

--
-- Indices de la tabla `rrhh_asistencia`
--
ALTER TABLE `rrhh_asistencia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_fecha` (`fecha`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_tipo` (`tipo_registro`),
  ADD KEY `fk_asist_per` (`id_personal`),
  ADD KEY `fk_asist_tec` (`id_tecnico`),
  ADD KEY `fk_asist_prog` (`id_programacion`),
  ADD KEY `fk_asist_mod` (`modificado_por`),
  ADD KEY `idx_asistencia_fecha_tipo` (`fecha`,`tipo_registro`);

--
-- Indices de la tabla `rrhh_horarios`
--
ALTER TABLE `rrhh_horarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_horario_per` (`id_personal`),
  ADD KEY `fk_horario_tec` (`id_tecnico`);

--
-- Indices de la tabla `rrhh_justificaciones`
--
ALTER TABLE `rrhh_justificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_just_asist` (`id_asistencia`),
  ADD KEY `fk_just_aprobador` (`aprobado_por`);

--
-- Indices de la tabla `servicios`
--
ALTER TABLE `servicios`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tecnicos`
--
ALTER TABLE `tecnicos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD KEY `idx_tecnico_estado` (`estado`);

--
-- Indices de la tabla `tecnico_disponibilidad`
--
ALTER TABLE `tecnico_disponibilidad`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_tecnico_fecha` (`id_tecnico`,`fecha`),
  ADD KEY `fk_disp_creador` (`creado_por`);

--
-- Indices de la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_vehiculo_estado` (`estado`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `actividades_mantenieminto`
--
ALTER TABLE `actividades_mantenieminto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `area`
--
ALTER TABLE `area`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `caja_chica`
--
ALTER TABLE `caja_chica`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cotizacion`
--
ALTER TABLE `cotizacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cotizacion_detalle`
--
ALTER TABLE `cotizacion_detalle`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_orden_producto`
--
ALTER TABLE `detalle_orden_producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_orden_servicio`
--
ALTER TABLE `detalle_orden_servicio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `equipo`
--
ALTER TABLE `equipo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `mantenimiento`
--
ALTER TABLE `mantenimiento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `multicim`
--
ALTER TABLE `multicim`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `oei_fichas`
--
ALTER TABLE `oei_fichas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `oei_ficha_anexos`
--
ALTER TABLE `oei_ficha_anexos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `oei_ficha_monitoreo`
--
ALTER TABLE `oei_ficha_monitoreo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `oei_informe_final`
--
ALTER TABLE `oei_informe_final`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `orden_capacitacion_auditoria`
--
ALTER TABLE `orden_capacitacion_auditoria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `orden_producto`
--
ALTER TABLE `orden_producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `orden_servicio`
--
ALTER TABLE `orden_servicio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `personal`
--
ALTER TABLE `personal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programacion_historial`
--
ALTER TABLE `programacion_historial`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programacion_insumos`
--
ALTER TABLE `programacion_insumos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programacion_notificaciones`
--
ALTER TABLE `programacion_notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programacion_servicio`
--
ALTER TABLE `programacion_servicio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `proyecciones`
--
ALTER TABLE `proyecciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rrhh_asistencia`
--
ALTER TABLE `rrhh_asistencia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rrhh_horarios`
--
ALTER TABLE `rrhh_horarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rrhh_justificaciones`
--
ALTER TABLE `rrhh_justificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `servicios`
--
ALTER TABLE `servicios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tecnicos`
--
ALTER TABLE `tecnicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tecnico_disponibilidad`
--
ALTER TABLE `tecnico_disponibilidad`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cotizacion`
--
ALTER TABLE `cotizacion`
  ADD CONSTRAINT `fk_cot_cli` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`),
  ADD CONSTRAINT `fk_cot_per` FOREIGN KEY (`id_personal_creador`) REFERENCES `personal` (`id`);

--
-- Filtros para la tabla `cotizacion_detalle`
--
ALTER TABLE `cotizacion_detalle`
  ADD CONSTRAINT `fk_det_cot_orig` FOREIGN KEY (`id_cotizacion`) REFERENCES `cotizacion` (`id`),
  ADD CONSTRAINT `fk_det_cot_pro` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`),
  ADD CONSTRAINT `fk_det_cot_ser` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id`);

--
-- Filtros para la tabla `detalle_orden_producto`
--
ALTER TABLE `detalle_orden_producto`
  ADD CONSTRAINT `fk_dop_op` FOREIGN KEY (`id_orden_producto`) REFERENCES `orden_producto` (`id`),
  ADD CONSTRAINT `fk_dop_pro` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `detalle_orden_servicio`
--
ALTER TABLE `detalle_orden_servicio`
  ADD CONSTRAINT `fk_dos_os` FOREIGN KEY (`id_orden_servicio`) REFERENCES `orden_servicio` (`id`),
  ADD CONSTRAINT `fk_dos_ser` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id`);

--
-- Filtros para la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD CONSTRAINT `fk_inventario_productos` FOREIGN KEY (`id_productos`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `mantenimiento`
--
ALTER TABLE `mantenimiento`
  ADD CONSTRAINT `fk_mantenimiento_act` FOREIGN KEY (`id_actmanten`) REFERENCES `actividades_mantenieminto` (`id`),
  ADD CONSTRAINT `fk_mantenimiento_equipo` FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id`);

--
-- Filtros para la tabla `oei_fichas`
--
ALTER TABLE `oei_fichas`
  ADD CONSTRAINT `fk_ficha_creador` FOREIGN KEY (`creado_por`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_ficha_modificador` FOREIGN KEY (`modificado_por`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_ficha_prog` FOREIGN KEY (`id_programacion`) REFERENCES `programacion_servicio` (`id`),
  ADD CONSTRAINT `fk_ficha_recibidor` FOREIGN KEY (`recibida_por`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_ficha_tec` FOREIGN KEY (`id_tecnico`) REFERENCES `tecnicos` (`id`);

--
-- Filtros para la tabla `oei_ficha_anexos`
--
ALTER TABLE `oei_ficha_anexos`
  ADD CONSTRAINT `fk_anexo_ficha` FOREIGN KEY (`id_ficha`) REFERENCES `oei_fichas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `oei_ficha_monitoreo`
--
ALTER TABLE `oei_ficha_monitoreo`
  ADD CONSTRAINT `fk_monitoreo_ficha` FOREIGN KEY (`id_ficha`) REFERENCES `oei_fichas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `oei_informe_detalle_fichas`
--
ALTER TABLE `oei_informe_detalle_fichas`
  ADD CONSTRAINT `fk_bridge_ficha` FOREIGN KEY (`id_ficha`) REFERENCES `oei_fichas` (`id`),
  ADD CONSTRAINT `fk_bridge_inf` FOREIGN KEY (`id_informe`) REFERENCES `oei_informe_final` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `oei_informe_final`
--
ALTER TABLE `oei_informe_final`
  ADD CONSTRAINT `fk_inf_aprobo` FOREIGN KEY (`id_personal_aprobo`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_inf_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`),
  ADD CONSTRAINT `fk_inf_elaboro` FOREIGN KEY (`id_personal_elaboro`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_inf_modificador` FOREIGN KEY (`modificado_por`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_inf_reviso` FOREIGN KEY (`id_personal_reviso`) REFERENCES `personal` (`id`);

--
-- Filtros para la tabla `orden_capacitacion_auditoria`
--
ALTER TABLE `orden_capacitacion_auditoria`
  ADD CONSTRAINT `fk_oca_cli` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`),
  ADD CONSTRAINT `fk_oca_cot` FOREIGN KEY (`id_cotizacion`) REFERENCES `cotizacion` (`id`),
  ADD CONSTRAINT `fk_oca_pon` FOREIGN KEY (`id_ponente`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_oca_ser` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id`);

--
-- Filtros para la tabla `orden_producto`
--
ALTER TABLE `orden_producto`
  ADD CONSTRAINT `fk_op_cli` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`),
  ADD CONSTRAINT `fk_op_cot` FOREIGN KEY (`id_cotizacion`) REFERENCES `cotizacion` (`id`),
  ADD CONSTRAINT `fk_op_per` FOREIGN KEY (`emitido_por`) REFERENCES `personal` (`id`);

--
-- Filtros para la tabla `orden_servicio`
--
ALTER TABLE `orden_servicio`
  ADD CONSTRAINT `fk_os_cli` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`),
  ADD CONSTRAINT `fk_os_cot` FOREIGN KEY (`id_cotizacion`) REFERENCES `cotizacion` (`id`),
  ADD CONSTRAINT `fk_os_per` FOREIGN KEY (`emitido_por`) REFERENCES `personal` (`id`);

--
-- Filtros para la tabla `personal`
--
ALTER TABLE `personal`
  ADD CONSTRAINT `fk_personal_area` FOREIGN KEY (`id_area`) REFERENCES `area` (`id`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `fk_productos_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id`);

--
-- Filtros para la tabla `programacion_historial`
--
ALTER TABLE `programacion_historial`
  ADD CONSTRAINT `fk_hist_prog` FOREIGN KEY (`id_programacion`) REFERENCES `programacion_servicio` (`id`),
  ADD CONSTRAINT `fk_hist_user` FOREIGN KEY (`modificado_por`) REFERENCES `personal` (`id`);

--
-- Filtros para la tabla `programacion_insumos`
--
ALTER TABLE `programacion_insumos`
  ADD CONSTRAINT `fk_pi_prod` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`),
  ADD CONSTRAINT `fk_pi_prog` FOREIGN KEY (`id_programacion`) REFERENCES `programacion_servicio` (`id`);

--
-- Filtros para la tabla `programacion_notificaciones`
--
ALTER TABLE `programacion_notificaciones`
  ADD CONSTRAINT `fk_notif_prog` FOREIGN KEY (`id_programacion`) REFERENCES `programacion_servicio` (`id`);

--
-- Filtros para la tabla `programacion_servicio`
--
ALTER TABLE `programacion_servicio`
  ADD CONSTRAINT `fk_prog_creador` FOREIGN KEY (`creado_por`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_prog_modificador` FOREIGN KEY (`modificado_por`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_prog_oca` FOREIGN KEY (`id_orden_capacitacion`) REFERENCES `orden_capacitacion_auditoria` (`id`),
  ADD CONSTRAINT `fk_prog_os` FOREIGN KEY (`id_orden_servicio`) REFERENCES `orden_servicio` (`id`),
  ADD CONSTRAINT `fk_prog_serv` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id`),
  ADD CONSTRAINT `fk_prog_sup` FOREIGN KEY (`id_supervisor`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_prog_tec` FOREIGN KEY (`id_tecnico_asignado`) REFERENCES `tecnicos` (`id`),
  ADD CONSTRAINT `fk_prog_veh` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculos` (`id`);

--
-- Filtros para la tabla `proyecciones`
--
ALTER TABLE `proyecciones`
  ADD CONSTRAINT `fk_proyeccion_multicim` FOREIGN KEY (`id_multicim`) REFERENCES `multicim` (`id`),
  ADD CONSTRAINT `fk_proyeccion_orden` FOREIGN KEY (`id_orden_servicio`) REFERENCES `orden_servicio` (`id`);

--
-- Filtros para la tabla `rrhh_asistencia`
--
ALTER TABLE `rrhh_asistencia`
  ADD CONSTRAINT `fk_asist_mod` FOREIGN KEY (`modificado_por`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_asist_per` FOREIGN KEY (`id_personal`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_asist_prog` FOREIGN KEY (`id_programacion`) REFERENCES `programacion_servicio` (`id`),
  ADD CONSTRAINT `fk_asist_tec` FOREIGN KEY (`id_tecnico`) REFERENCES `tecnicos` (`id`);

--
-- Filtros para la tabla `rrhh_horarios`
--
ALTER TABLE `rrhh_horarios`
  ADD CONSTRAINT `fk_horario_per` FOREIGN KEY (`id_personal`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_horario_tec` FOREIGN KEY (`id_tecnico`) REFERENCES `tecnicos` (`id`);

--
-- Filtros para la tabla `rrhh_justificaciones`
--
ALTER TABLE `rrhh_justificaciones`
  ADD CONSTRAINT `fk_just_aprobador` FOREIGN KEY (`aprobado_por`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_just_asist` FOREIGN KEY (`id_asistencia`) REFERENCES `rrhh_asistencia` (`id`);

--
-- Filtros para la tabla `tecnico_disponibilidad`
--
ALTER TABLE `tecnico_disponibilidad`
  ADD CONSTRAINT `fk_disp_creador` FOREIGN KEY (`creado_por`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_disp_tec` FOREIGN KEY (`id_tecnico`) REFERENCES `tecnicos` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
