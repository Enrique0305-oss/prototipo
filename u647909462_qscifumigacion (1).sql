-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 13-04-2026 a las 23:40:55
-- Versión del servidor: 11.8.6-MariaDB-log
-- Versión de PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `u647909462_qscifumigacion`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actividades_mantenieminto`
--

CREATE TABLE `actividades_mantenieminto` (
  `id` int(11) NOT NULL,
  `categoria` enum('Programado','Entregado','Garantia') DEFAULT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `tipo_mantenimiento` enum('Preventivo','Correctivo') DEFAULT NULL,
  `tipo_equipo` varchar(80) DEFAULT NULL,
  `frecuencia_sugerida` varchar(40) DEFAULT NULL,
  `estado` enum('Activo','Desactivo') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `actividades_mantenieminto`
--

INSERT INTO `actividades_mantenieminto` (`id`, `categoria`, `motivo`, `tipo_mantenimiento`, `tipo_equipo`, `frecuencia_sugerida`, `estado`) VALUES
(1, 'Programado', 'Derrame de Gasolina, Demora en encedido, descarga rapida', 'Correctivo', 'GENERAL', NULL, 'Activo'),
(2, 'Programado', 'Mantenimiento preventivo', 'Preventivo', 'GENERAL', NULL, 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `area`
--

CREATE TABLE `area` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `estado` enum('Activo','Inactivo') DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `area`
--

INSERT INTO `area` (`id`, `nombre`, `estado`) VALUES
(1, 'Comercial', 'Activo'),
(2, 'Operaciones', 'Activo'),
(3, 'Administración', 'Activo'),
(4, 'Recursos Humanos', 'Activo'),
(5, 'Finanzas', 'Activo'),
(6, 'Gerencia', 'Activo'),
(7, 'Almacén', 'Activo'),
(8, 'Programacion', 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cargo`
--

CREATE TABLE `cargo` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_area` bigint(20) UNSIGNED DEFAULT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cargo`
--

INSERT INTO `cargo` (`id`, `id_area`, `nombre`, `descripcion`, `estado`, `created_at`, `updated_at`) VALUES
(1, 1, 'Coordinador Comercial', NULL, 'activo', '2026-03-31 22:52:31', '2026-03-31 22:53:37'),
(2, 1, 'Asistente Comercial', NULL, 'activo', '2026-03-31 22:52:46', '2026-03-31 22:52:46'),
(3, 6, 'Gerente Comercial', NULL, 'activo', '2026-03-31 22:54:06', '2026-03-31 22:54:06'),
(4, 8, 'Programacion Servicio', NULL, 'activo', '2026-04-10 22:47:50', '2026-04-10 22:47:50'),
(5, 8, 'Programacion Capa-Asesoria', NULL, 'activo', '2026-04-10 22:48:08', '2026-04-10 22:48:08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `catalogo_capacitacion_auditoria`
--

CREATE TABLE `catalogo_capacitacion_auditoria` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tipo` enum('Capacitación','Asesoría') NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio_referencial` decimal(10,2) DEFAULT NULL,
  `duracion_horas` int(11) DEFAULT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(100) DEFAULT NULL,
  `estado` enum('Activo','Inactivo') DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id`, `nombre`, `descripcion`, `estado`) VALUES
(1, 'INSUMOS', NULL, 'Activo'),
(2, 'DISPOSITIVOS', NULL, 'Activo'),
(3, 'EPPS', NULL, 'Activo'),
(4, 'QUIMICOS', NULL, 'Activo'),
(5, 'CONSUMIBLE', NULL, 'Activo');

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
  `persona_contacto` varchar(100) DEFAULT NULL,
  `telefono_contacto` varchar(20) DEFAULT NULL,
  `origen` varchar(50) DEFAULT NULL,
  `fecha_registro` date DEFAULT NULL,
  `estado` enum('Acepta','No acepta','Contactado') DEFAULT 'Contactado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`id`, `nombre_empresa`, `ruc`, `rubro`, `direccion`, `persona_contacto`, `telefono_contacto`, `origen`, `fecha_registro`, `estado`) VALUES
(1, 'YAMBOLY S.A.C', '20510161069', 'Producción y comercialización de helados.', 'Av. Sta. Rosa de Lima 827, URB, LIMA', 'Juanita Mallqui', NULL, NULL, '2026-04-11', 'Acepta'),
(2, 'VILLA NATURA PERU SAC', '20515696017', 'Actividades de Envase y Empaque', 'Av. Jose Pardo Nro. 513 Dpto. 601', 'Power Cerda', NULL, 'Otro', '2026-04-11', 'Acepta'),
(3, 'COSECHAS PERUANAS', '20537676133', 'Industria Agroalimentaria', 'Calle José Aquilar Mz. G Lote 5-6. Urb. Ceres 1ra Etapa Ate Vitarte, Lima Perú.', 'Rossmery Sanchez', NULL, 'Referido', '2026-04-11', 'Acepta'),
(4, 'DRESDEN S.A.', '20507165461', 'Ingredientes alimenticios, farmacéuticos', 'Calle Los Telares N° 197 URB. Vulcano Lima-Lima-Ate', 'Kedy Espinoza', NULL, 'Referido', '2026-04-11', 'Acepta'),
(5, 'SALSAS INDUSTRY S.A.C', '20603031378', 'venta de productos', 'Av. Santa Rosa 474 y 476, Urb. La Aurora, Ate. Lima – Perú.', NULL, NULL, 'Referido', '2026-04-13', 'Acepta'),
(6, 'EXPORTADORA ROMEX S.A', '20522061035', 'Industria Alimentaria', 'Parcela 12 – Cajamarquilla – Lurigancho – Lima – Peru', 'Katherine Larraín', NULL, 'Referido', '2026-04-13', 'Acepta'),
(7, 'DRESDEN FOOD INGREDIENTS S.A.', '20263019807', 'Industria Alimentaria', 'los Telares Nro. 299, Vulcano-Ate', 'Aida Sánchez', NULL, 'Referido', '2026-04-13', 'Acepta'),
(8, 'OLIVEZA S.A.C.', '20513203871', 'Industria Alimentaria', 'Calle 1 Lote 7  Mz RR – Huertos de Lurín- Lurín', 'Erika Vilca', NULL, 'Referido', '2026-04-13', 'Acepta'),
(9, 'P&D Andina Alimentos SA', '20205922149', 'Industria Alimentaria', 'Av. Industrial Nro 741', 'Rosario Perez', NULL, 'Referido', '2026-04-13', 'Acepta'),
(10, 'Agrícola Ecológica SAC', '20381210651', 'Industria Agroalimentaria', 'Av. Argentina 2045, Callao', 'Omar Nilsson', NULL, 'Referido', '2026-04-13', 'Acepta');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente_planta`
--

CREATE TABLE `cliente_planta` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `distrito` varchar(100) DEFAULT NULL,
  `provincia` varchar(100) DEFAULT NULL,
  `departamento` varchar(100) DEFAULT NULL,
  `referencia` varchar(255) DEFAULT NULL,
  `coordenadas` varchar(80) DEFAULT NULL,
  `contacto_nombre` varchar(100) DEFAULT NULL,
  `contacto_telefono` varchar(20) DEFAULT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cliente_planta`
--

INSERT INTO `cliente_planta` (`id`, `id_cliente`, `nombre`, `direccion`, `distrito`, `provincia`, `departamento`, `referencia`, `coordenadas`, `contacto_nombre`, `contacto_telefono`, `estado`) VALUES
(1, 4, 'LINEA FARMACEUTICA', 'Calle Los Telares N° 197 URB. Vulcano', 'Ate', 'LIMA', 'Lima', NULL, NULL, 'Kedy Espinoza', '912 460 368', 'Activo'),
(2, 4, 'LINEA QUÍMICA', 'Calle Los Telares N° 197 URB. Vulcano', 'Ate', 'LIMA', 'Lima', NULL, NULL, 'Kedy Espinoza', '912 460 368', 'Activo'),
(3, 5, 'TIGO ATE', NULL, 'LIMA', 'LIMA', 'LIMA', NULL, NULL, NULL, NULL, 'Activo'),
(4, 9, 'P&D ANDINA ALIMENTOS', 'Av. Industrial Nro 741', 'LIMA', 'LIMA', 'LIMA', NULL, NULL, 'Rosario Perez', NULL, 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente_planta_area`
--

CREATE TABLE `cliente_planta_area` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_cliente_planta` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cliente_planta_area`
--

INSERT INTO `cliente_planta_area` (`id`, `id_cliente_planta`, `nombre`, `descripcion`, `estado`) VALUES
(1, 1, 'SSHH', NULL, 'Activo'),
(2, 1, 'VEHÍCULOS', NULL, 'Activo'),
(3, 1, 'DESRATIZACION', NULL, 'Activo'),
(4, 2, 'SSHH', NULL, 'Activo'),
(5, 2, '2 VEHÍCULOS', NULL, 'Activo'),
(6, 1, 'AREAS INTERNAS', NULL, 'Activo'),
(7, 3, 'KIOSKO', 'Tiendita en exterior de tigo ate', 'Activo'),
(8, 4, 'AREAS INTERNAS', NULL, 'Activo');

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
  `id_multicim` int(11) DEFAULT NULL,
  `estado` enum('Pendiente','Aceptada','Rechazada') DEFAULT 'Pendiente',
  `tipo_cotizacion` enum('Servicio','Producto','Capacitacion','Asesoria') NOT NULL,
  `propuesta_tecnica` longtext DEFAULT NULL,
  `incluye_igv` tinyint(1) NOT NULL DEFAULT 1,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `igv` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `receta_servicio` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'JSON con receta de servicio (equipos y productos)' CHECK (json_valid(`receta_servicio`)),
  `exponentes_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`exponentes_ids`)),
  `objetivos_asesoria` varchar(1000) DEFAULT NULL,
  `fecha_estado_cotizacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `cotizacion`
--

INSERT INTO `cotizacion` (`id`, `numero_cotizacion`, `id_cliente`, `fecha_emision`, `id_personal_creador`, `id_multicim`, `estado`, `tipo_cotizacion`, `propuesta_tecnica`, `incluye_igv`, `subtotal`, `igv`, `total`, `observaciones`, `receta_servicio`, `exponentes_ids`, `objetivos_asesoria`, `fecha_estado_cotizacion`) VALUES
(2, 'COT-2026-001', 4, '2026-04-13', 9, 2, 'Aceptada', 'Servicio', NULL, 0, 1030.00, 0.00, 1030.00, 'Crédito: 30 días | Nota: Esta cotización no incluye IGV. | Nota: Esta cotización no incluye IGV.', '[{\"id_servicio\":14,\"id_equipo\":2,\"equipo_descripcion\":\"MOTOASPERSOR\",\"id_producto\":19,\"cantidad\":1,\"observacion\":\"I+D\",\"id_cliente_planta\":1,\"id_cliente_planta_area\":1},{\"id_servicio\":6,\"id_equipo\":null,\"equipo_descripcion\":null,\"id_producto\":5,\"cantidad\":4,\"observacion\":null,\"id_cliente_planta\":1,\"id_cliente_planta_area\":6},{\"id_servicio\":6,\"id_equipo\":null,\"equipo_descripcion\":null,\"id_producto\":6,\"cantidad\":8,\"observacion\":null,\"id_cliente_planta\":1,\"id_cliente_planta_area\":6},{\"id_servicio\":6,\"id_equipo\":null,\"equipo_descripcion\":null,\"id_producto\":7,\"cantidad\":4,\"observacion\":null,\"id_cliente_planta\":1,\"id_cliente_planta_area\":6},{\"id_servicio\":14,\"id_equipo\":2,\"equipo_descripcion\":\"MOTOASPERSOR\",\"id_producto\":19,\"cantidad\":1,\"observacion\":\"I+D\",\"id_cliente_planta\":2,\"id_cliente_planta_area\":4},{\"id_servicio\":6,\"id_equipo\":null,\"equipo_descripcion\":null,\"id_producto\":22,\"cantidad\":7.99,\"observacion\":null,\"id_cliente_planta\":1,\"id_cliente_planta_area\":6},{\"id_servicio\":6,\"id_equipo\":null,\"equipo_descripcion\":null,\"id_producto\":21,\"cantidad\":4,\"observacion\":null,\"id_cliente_planta\":1,\"id_cliente_planta_area\":6},{\"id_servicio\":14,\"id_equipo\":2,\"equipo_descripcion\":\"MOTOASPERSOR\",\"id_producto\":19,\"cantidad\":1,\"observacion\":null,\"id_cliente_planta\":1,\"id_cliente_planta_area\":2},{\"id_servicio\":14,\"id_equipo\":2,\"equipo_descripcion\":\"MOTOASPERSOR\",\"id_producto\":19,\"cantidad\":1,\"observacion\":null,\"id_cliente_planta\":1,\"id_cliente_planta_area\":3},{\"id_servicio\":14,\"id_equipo\":2,\"equipo_descripcion\":\"MOTOASPERSOR\",\"id_producto\":19,\"cantidad\":1,\"observacion\":null,\"id_cliente_planta\":2,\"id_cliente_planta_area\":5}]', NULL, NULL, '2026-04-13 10:37:32'),
(3, 'COT-2026-002', 4, '2026-04-13', 1, 1, 'Aceptada', 'Servicio', NULL, 0, 450.00, 0.00, 450.00, 'Esta cotización no incluye IGV.', '[{\"id_servicio\":13,\"id_equipo\":2,\"equipo_descripcion\":\"MOTOASPERSOR\",\"id_producto\":20,\"cantidad\":1,\"observacion\":null,\"id_cliente_planta\":1,\"id_cliente_planta_area\":1},{\"id_servicio\":13,\"id_equipo\":2,\"equipo_descripcion\":\"MOTOASPERSOR\",\"id_producto\":3,\"cantidad\":1,\"observacion\":null,\"id_cliente_planta\":1,\"id_cliente_planta_area\":1}]', NULL, NULL, '2026-04-13 10:46:46'),
(4, 'COT-2026-003', 9, '2026-04-13', 9, 2, 'Aceptada', 'Servicio', NULL, 0, 600.00, 0.00, 600.00, 'Esta cotización no incluye IGV.', '[{\"id_servicio\":6,\"id_equipo\":null,\"equipo_descripcion\":null,\"id_producto\":5,\"cantidad\":20,\"observacion\":null,\"id_cliente_planta\":4,\"id_cliente_planta_area\":8},{\"id_servicio\":6,\"id_equipo\":null,\"equipo_descripcion\":null,\"id_producto\":6,\"cantidad\":24,\"observacion\":null,\"id_cliente_planta\":4,\"id_cliente_planta_area\":8},{\"id_servicio\":6,\"id_equipo\":null,\"equipo_descripcion\":null,\"id_producto\":26,\"cantidad\":8,\"observacion\":null,\"id_cliente_planta\":4,\"id_cliente_planta_area\":8},{\"id_servicio\":6,\"id_equipo\":null,\"equipo_descripcion\":null,\"id_producto\":21,\"cantidad\":20,\"observacion\":null,\"id_cliente_planta\":4,\"id_cliente_planta_area\":8},{\"id_servicio\":6,\"id_equipo\":null,\"equipo_descripcion\":null,\"id_producto\":22,\"cantidad\":72,\"observacion\":null,\"id_cliente_planta\":4,\"id_cliente_planta_area\":8}]', NULL, NULL, '2026-04-13 12:21:09'),
(5, 'COT-2026-004', 10, '2026-04-13', 9, 2, 'Aceptada', 'Producto', NULL, 0, 96.00, 0.00, 96.00, 'Esta cotización no incluye IGV.', NULL, NULL, NULL, '2026-04-13 12:54:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cotizacion_beneficio`
--

CREATE TABLE `cotizacion_beneficio` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_cotizacion` int(11) NOT NULL,
  `id_catalogo_cap_aud` bigint(20) UNSIGNED DEFAULT NULL,
  `nombre_beneficio` varchar(255) NOT NULL,
  `modalidad_sugerida` varchar(80) DEFAULT NULL,
  `horas_capacitacion` decimal(8,2) DEFAULT NULL,
  `precio_referencial` decimal(10,2) NOT NULL DEFAULT 0.00,
  `observacion` varchar(255) DEFAULT NULL,
  `orden` int(10) UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cotizacion_detalle`
--

CREATE TABLE `cotizacion_detalle` (
  `id` int(11) NOT NULL,
  `id_cotizacion` int(11) NOT NULL,
  `id_cliente_planta` bigint(20) UNSIGNED DEFAULT NULL,
  `id_cliente_planta_area` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`id_cliente_planta_area`)),
  `id_servicio` int(11) DEFAULT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `id_catalogo_cap_aud` bigint(20) UNSIGNED DEFAULT NULL,
  `descripcion_manual` varchar(255) DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `frecuencia_sugerida` varchar(100) DEFAULT NULL,
  `modalidad_sugerida` varchar(50) DEFAULT NULL,
  `op_tecnicos` char(4) DEFAULT NULL,
  `supervisor` char(4) DEFAULT NULL,
  `horas_capacitacion` int(11) DEFAULT NULL,
  `num_participantes` int(11) DEFAULT NULL,
  `fecha_servicio` date DEFAULT NULL,
  `medida_tanque` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`medida_tanque`)),
  `fosfina_producto` varchar(200) DEFAULT NULL,
  `fosfina_cantidad` int(11) DEFAULT NULL,
  `meses_implementacion` int(11) DEFAULT NULL,
  `frecuencia_visita` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`frecuencia_visita`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `cotizacion_detalle`
--

INSERT INTO `cotizacion_detalle` (`id`, `id_cotizacion`, `id_cliente_planta`, `id_cliente_planta_area`, `id_servicio`, `id_producto`, `id_catalogo_cap_aud`, `descripcion_manual`, `cantidad`, `precio_unitario`, `frecuencia_sugerida`, `modalidad_sugerida`, `op_tecnicos`, `supervisor`, `horas_capacitacion`, `num_participantes`, `fecha_servicio`, `medida_tanque`, `fosfina_producto`, `fosfina_cantidad`, `meses_implementacion`, `frecuencia_visita`) VALUES
(14, 3, 1, '[1]', 13, NULL, NULL, NULL, 1, 450.00, 'Única', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(15, 2, 1, '[1,2,3]', 14, NULL, NULL, NULL, 1, 500.00, 'Semestral', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(16, 2, 1, '[6]', 6, NULL, NULL, NULL, 1, 80.00, 'Mensual', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(17, 2, 2, '[4,5]', 14, NULL, NULL, NULL, 1, 450.00, 'Semestral', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(18, 4, 4, '[8]', 6, NULL, NULL, NULL, 1, 600.00, 'Quincenal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(19, 5, NULL, NULL, NULL, 25, NULL, NULL, 2, 48.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_entrada_devolucion_fabricacion`
--

CREATE TABLE `detalle_entrada_devolucion_fabricacion` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_entrada_devolucion_fabricacion` int(10) UNSIGNED NOT NULL,
  `tipo` enum('EntradaProducto','DevolucionInsumo','ConsumoDiferenciaInsumo') NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` decimal(12,3) NOT NULL,
  `observacion` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `detalle_entrada_devolucion_fabricacion`
--

INSERT INTO `detalle_entrada_devolucion_fabricacion` (`id`, `id_entrada_devolucion_fabricacion`, `tipo`, `id_producto`, `cantidad`, `observacion`, `created_at`, `updated_at`) VALUES
(37, 10, 'EntradaProducto', 1, 150.000, 'Entrada de producto fabricado', '2026-04-13 18:04:11', '2026-04-13 18:04:11'),
(38, 10, 'ConsumoDiferenciaInsumo', 2, 13.000, 'Consumo adicional por diferencia de producción', '2026-04-13 18:04:11', '2026-04-13 18:04:11'),
(39, 10, 'ConsumoDiferenciaInsumo', 3, 13.000, 'Consumo adicional por diferencia de producción', '2026-04-13 18:04:11', '2026-04-13 18:04:11'),
(40, 10, 'ConsumoDiferenciaInsumo', 4, 13.000, 'Consumo adicional por diferencia de producción', '2026-04-13 18:04:11', '2026-04-13 18:04:11');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_entrega_epp`
--

CREATE TABLE `detalle_entrega_epp` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_entrega_epp` bigint(20) UNSIGNED NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `observacion` varchar(255) DEFAULT NULL,
  `condicion_devolucion` varchar(255) DEFAULT NULL,
  `observacion_devolucion` varchar(255) DEFAULT NULL,
  `estado_item` enum('Activo','Devuelto','Reemplazado') NOT NULL DEFAULT 'Activo',
  `id_entrega_reemplazo` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `detalle_entrega_epp`
--

INSERT INTO `detalle_entrega_epp` (`id`, `id_entrega_epp`, `id_producto`, `cantidad`, `observacion`, `condicion_devolucion`, `observacion_devolucion`, `estado_item`, `id_entrega_reemplazo`) VALUES
(1, 1, 11, 1, NULL, 'Bueno', NULL, 'Devuelto', NULL),
(2, 1, 16, 1, NULL, 'Bueno', NULL, 'Devuelto', NULL),
(3, 1, 9, 1, NULL, 'Bueno', NULL, 'Devuelto', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_ordenes_compra`
--

CREATE TABLE `detalle_ordenes_compra` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_orden_compra` bigint(20) UNSIGNED NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(12,4) NOT NULL,
  `subtotal` decimal(12,4) NOT NULL,
  `observacion` varchar(300) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_orden_asesoria`
--

CREATE TABLE `detalle_orden_asesoria` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_orden_asesoria` int(10) UNSIGNED NOT NULL,
  `item` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_orden_capacitacion_equipos`
--

CREATE TABLE `detalle_orden_capacitacion_equipos` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_orden_capacitacion` int(10) UNSIGNED NOT NULL,
  `equipo` varchar(255) NOT NULL,
  `disposicion` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_orden_capacitacion_materiales`
--

CREATE TABLE `detalle_orden_capacitacion_materiales` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_orden_capacitacion` int(10) UNSIGNED NOT NULL,
  `material` varchar(255) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `disposicion` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_orden_fabricacion`
--

CREATE TABLE `detalle_orden_fabricacion` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_orden_fabricacion` int(10) UNSIGNED NOT NULL,
  `id_producto_final` int(11) NOT NULL,
  `cantidad` decimal(12,3) NOT NULL,
  `receta_snapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`receta_snapshot`)),
  `insumos_requeridos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`insumos_requeridos`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `detalle_orden_fabricacion`
--

INSERT INTO `detalle_orden_fabricacion` (`id`, `id_orden_fabricacion`, `id_producto_final`, `cantidad`, `receta_snapshot`, `insumos_requeridos`) VALUES
(11, 9, 1, 127.000, '[{\"id_producto_insumo\":2,\"cantidad\":1,\"unidad\":null,\"observacion\":null,\"insumo\":{\"id\":2,\"descripcion\":\"LAMINA 50X10\",\"unidad\":\"Unidad\",\"inventario\":{\"cantidad_disponible\":9605}}},{\"id_producto_insumo\":3,\"cantidad\":1.88,\"unidad\":\"Gramos\",\"observacion\":null,\"insumo\":{\"id\":3,\"descripcion\":\"TEMOCID\",\"unidad\":\"Gramos\",\"inventario\":{\"cantidad_disponible\":10905}}},{\"id_producto_insumo\":4,\"cantidad\":1,\"unidad\":null,\"observacion\":null,\"insumo\":{\"id\":4,\"descripcion\":\"LAMINA ADHESIVA 50X10\",\"unidad\":null,\"inventario\":{\"cantidad_disponible\":5}}}]', '[{\"id_producto_insumo\":2,\"descripcion\":\"LAMINA 50X10\",\"cantidad_requerida\":127,\"unidad\":\"Unidad\"},{\"id_producto_insumo\":3,\"descripcion\":\"TEMOCID\",\"cantidad_requerida\":238.76,\"unidad\":\"Gramos\"},{\"id_producto_insumo\":4,\"descripcion\":\"LAMINA ADHESIVA 50X10\",\"cantidad_requerida\":127,\"unidad\":null}]');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `detalle_orden_producto`
--

INSERT INTO `detalle_orden_producto` (`id`, `id_orden_producto`, `id_producto`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
(1, 1, 25, 2, 48.00, 96.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_orden_servicio`
--

CREATE TABLE `detalle_orden_servicio` (
  `id` int(11) NOT NULL,
  `id_orden_servicio` int(11) NOT NULL,
  `id_cliente_planta` bigint(20) UNSIGNED DEFAULT NULL,
  `id_cliente_planta_area` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`id_cliente_planta_area`)),
  `id_servicio` int(11) NOT NULL,
  `local` varchar(100) DEFAULT NULL,
  `frecuencia` varchar(100) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `detalle_orden_servicio`
--

INSERT INTO `detalle_orden_servicio` (`id`, `id_orden_servicio`, `id_cliente_planta`, `id_cliente_planta_area`, `id_servicio`, `local`, `frecuencia`, `precio`) VALUES
(11, 4, 1, '[1,2,3]', 14, NULL, 'Semestral', 500.00),
(12, 4, 1, '[6]', 6, NULL, 'Mensual', 80.00),
(13, 4, 2, '[4,5]', 14, NULL, 'Semestral', 450.00),
(14, 5, 4, '[8]', 6, NULL, 'Quincenal', 600.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entrada_devolucion_fabricacion`
--

CREATE TABLE `entrada_devolucion_fabricacion` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_orden_fabricacion` int(10) UNSIGNED NOT NULL,
  `id_programacion_fabricacion` int(10) UNSIGNED NOT NULL,
  `cantidad_esperada_total` decimal(12,3) NOT NULL DEFAULT 0.000,
  `cantidad_producida_total` decimal(12,3) NOT NULL DEFAULT 0.000,
  `motivo_diferencia` text DEFAULT NULL,
  `tiene_sobrante_materia_prima` tinyint(1) NOT NULL DEFAULT 0,
  `observaciones` text DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `estado` enum('Pendiente','Realizado') NOT NULL DEFAULT 'Pendiente',
  `fecha_realizado` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `tiene_diferencia_materia_prima` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `entrada_devolucion_fabricacion`
--

INSERT INTO `entrada_devolucion_fabricacion` (`id`, `id_orden_fabricacion`, `id_programacion_fabricacion`, `cantidad_esperada_total`, `cantidad_producida_total`, `motivo_diferencia`, `tiene_sobrante_materia_prima`, `observaciones`, `creado_por`, `estado`, `fecha_realizado`, `created_at`, `updated_at`, `tiene_diferencia_materia_prima`) VALUES
(10, 9, 10, 127.000, 150.000, 'tecnico hizo mas', 0, NULL, 7, 'Realizado', '2026-04-13 18:04:11', '2026-04-13 18:03:23', '2026-04-13 18:04:11', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entrega_epp`
--

CREATE TABLE `entrega_epp` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `numero_entrega` varchar(20) NOT NULL,
  `id_tecnico` int(11) NOT NULL,
  `fecha_entrega` date NOT NULL,
  `fecha_devolucion` date DEFAULT NULL,
  `estado` enum('Entregado','Devuelto') NOT NULL DEFAULT 'Entregado',
  `motivo_entrega` enum('Primera Asignación','Reemplazo por Daño','Reemplazo por Desgaste','Reemplazo por Pérdida','Reposición Periódica','Solicitud del Técnico') NOT NULL DEFAULT 'Primera Asignación',
  `registrado_por` int(11) NOT NULL,
  `devuelto_por` int(11) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `motivo_devolucion` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `entrega_epp`
--

INSERT INTO `entrega_epp` (`id`, `numero_entrega`, `id_tecnico`, `fecha_entrega`, `fecha_devolucion`, `estado`, `motivo_entrega`, `registrado_por`, `devuelto_por`, `observaciones`, `motivo_devolucion`, `created_at`, `updated_at`) VALUES
(1, 'EPP-2026-001', 1, '2026-01-01', '2026-04-13', 'Devuelto', 'Primera Asignación', 7, 7, NULL, 'prueba', '2026-04-13 15:23:50', '2026-04-13 15:25:25');

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
  `imagen` varchar(500) DEFAULT NULL,
  `estado` enum('Activo','Inactivo') DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `equipo`
--

INSERT INTO `equipo` (`id`, `descripcion`, `marca`, `modelo`, `serie`, `encargado`, `responsable`, `contacto`, `imagen`, `estado`) VALUES
(1, 'TERMONEBULIZADOR', 'VECTOR FOG', 'H200', 3, 'Yordi', 'Yordi', 922824390, 'equipos/vector-fog/termonebulizador-1.png', 'Activo'),
(2, 'MOTOASPERSOR', 'STIHL', 'SR 440', 1, 'Yordi', 'Yordi', 922824390, 'equipos/stihl/motoaspersor-2.png', 'Activo'),
(3, 'MOTOASPERSOR', 'STIHL', 'SR 420', 2, 'Yordi', 'Yordi', 922824390, 'equipos/stihl/motoaspersor-3.png', 'Activo'),
(4, 'PULVERIZADOR MANUAL', 'JACTO', 'PJH', 1, 'Yordi', 'Yordi', 922824390, 'equipos/jacto/pulverizador-manual-4.png', 'Activo'),
(5, 'PULVERIZADOR MANUAL', 'JACTO', 'PJH', 2, 'Yordi', 'Yordi', 922824390, 'equipos/jacto/pulverizador-manual-5.png', 'Activo'),
(6, 'MINI ASPIRADORA', 'ISFOG', 'P25A', 1, 'Yordi', 'Yordi', 922824390, 'equipos/isfog/mini-aspiradora-6.png', 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `exponentes`
--

CREATE TABLE `exponentes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `especialidad` varchar(200) DEFAULT NULL,
  `profesion` varchar(200) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `institucion` varchar(200) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  `id_tecnico_vinculado` bigint(20) UNSIGNED DEFAULT NULL,
  `presentacion` varchar(5000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `inventario`
--

INSERT INTO `inventario` (`id`, `id_productos`, `cantidad_disponible`, `stock_seguridad`, `Tipo`, `Cantidad_total`) VALUES
(1, 1, 1340, 50, 'Entrada', 0),
(2, 2, 9465, 25, 'Entrada', 0),
(3, 3, 10653, 2250, 'Entrada', 0),
(4, 4, 60, 100, 'Entrada', 0),
(5, 5, 31, 12, 'Entrada', 0),
(6, 6, 10, 20, 'Entrada', 0),
(7, 7, 0, 6, 'Entrada', 0),
(8, 8, 3, 1, 'Entrada', 0),
(9, 9, 2, 1, 'Entrada', 0),
(10, 10, 2, 1, 'Entrada', 0),
(11, 11, 1, 1, 'Entrada', 0),
(12, 12, 3, 1, 'Entrada', 0),
(13, 13, 2, 1, 'Entrada', 0),
(14, 14, 3, 1, 'Entrada', 0),
(15, 15, 2, 1, 'Entrada', 0),
(16, 16, 5, 1, 'Entrada', 0),
(17, 17, 0, 1, 'Entrada', 0),
(18, 18, 1, 1, 'Entrada', 0),
(19, 19, 0, 2000, 'Entrada', 0),
(20, 20, 0, 500, 'Entrada', 0),
(21, 21, 0, 200, 'Entrada', 0),
(22, 22, 0, 500, 'Entrada', 0),
(23, 23, 0, 36, 'Entrada', 0),
(24, 24, 0, 2000, 'Entrada', 0),
(25, 25, 14, 6, 'Entrada', 0),
(26, 26, 48, 10, 'Entrada', 0),
(27, 27, 0, 100, 'Entrada', 0),
(28, 28, 0, 20, 'Entrada', 0),
(29, 29, 0, 20, 'Entrada', 0),
(30, 30, 0, 20, 'Entrada', 0),
(31, 31, 0, 20, 'Entrada', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario_ajustes`
--

CREATE TABLE `inventario_ajustes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_producto` int(11) NOT NULL,
  `stock_anterior` int(11) NOT NULL,
  `stock_nuevo` int(11) NOT NULL,
  `diferencia` int(11) NOT NULL,
  `tipo_ajuste` enum('Entrada','Salida') NOT NULL,
  `motivo` varchar(120) NOT NULL,
  `observacion` text DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `fecha_ajuste` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_kardex` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `inventario_ajustes`
--

INSERT INTO `inventario_ajustes` (`id`, `id_producto`, `stock_anterior`, `stock_nuevo`, `diferencia`, `tipo_ajuste`, `motivo`, `observacion`, `id_usuario`, `fecha_ajuste`, `id_kardex`) VALUES
(5, 9, 0, 2, 2, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 14:03:29', 68),
(6, 8, 0, 3, 3, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 14:03:51', 69),
(7, 10, 0, 2, 2, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 14:04:00', 70),
(8, 11, 0, 1, 1, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 14:04:18', 71),
(9, 12, 0, 3, 3, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 14:04:33', 72),
(10, 13, 0, 2, 2, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 14:04:46', 73),
(11, 14, 0, 3, 3, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 14:05:09', 74),
(12, 15, 0, 2, 2, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 14:05:24', 75),
(13, 16, 0, 5, 5, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 14:05:37', 76),
(14, 18, 0, 1, 1, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 14:05:49', 77),
(15, 25, 0, 16, 16, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 17:47:14', 84),
(16, 5, 0, 31, 31, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 17:51:19', 85),
(17, 26, 0, 48, 48, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 17:51:35', 86),
(18, 6, 0, 10, 10, 'Entrada', 'Conteo físico', NULL, 7, '2026-04-13 17:52:05', 87),
(19, 4, 5, 127, 122, 'Entrada', 'Conteo físico', 'prueba', 7, '2026-04-13 18:02:40', 89),
(20, 4, 127, 200, 73, 'Entrada', 'Conteo físico', 'prueba', 7, '2026-04-13 18:03:05', 90);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `kardex`
--

CREATE TABLE `kardex` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_producto` int(11) NOT NULL,
  `tipo_movimiento` enum('Entrada','Salida') NOT NULL,
  `cantidad` int(11) NOT NULL,
  `stock_anterior` int(11) NOT NULL,
  `stock_posterior` int(11) NOT NULL,
  `motivo` varchar(100) NOT NULL,
  `referencia` varchar(100) DEFAULT NULL,
  `id_referencia` bigint(20) UNSIGNED DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `observacion` text DEFAULT NULL,
  `fecha_movimiento` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `kardex`
--

INSERT INTO `kardex` (`id`, `id_producto`, `tipo_movimiento`, `cantidad`, `stock_anterior`, `stock_posterior`, `motivo`, `referencia`, `id_referencia`, `id_usuario`, `observacion`, `fecha_movimiento`) VALUES
(68, 9, 'Entrada', 2, 0, 2, 'Conteo físico', 'Ajuste de Inventario', NULL, 7, NULL, '2026-04-13 14:03:29'),
(69, 8, 'Entrada', 3, 0, 3, 'Conteo físico', 'Ajuste de Inventario', NULL, 7, NULL, '2026-04-13 14:03:51'),
(70, 10, 'Entrada', 2, 0, 2, 'Conteo físico', 'Ajuste de Inventario', NULL, 7, NULL, '2026-04-13 14:04:00'),
(71, 11, 'Entrada', 1, 0, 1, 'Conteo físico', 'Ajuste de Inventario', NULL, 7, NULL, '2026-04-13 14:04:18'),
(72, 12, 'Entrada', 3, 0, 3, 'Conteo físico', 'Ajuste de Inventario', NULL, 7, NULL, '2026-04-13 14:04:33'),
(73, 13, 'Entrada', 2, 0, 2, 'Conteo físico', 'Ajuste de Inventario', NULL, 7, NULL, '2026-04-13 14:04:46'),
(74, 14, 'Entrada', 3, 0, 3, 'Conteo físico', 'Ajuste de Inventario', NULL, 7, NULL, '2026-04-13 14:05:09'),
(75, 15, 'Entrada', 2, 0, 2, 'Conteo físico', 'Ajuste de Inventario', NULL, 7, NULL, '2026-04-13 14:05:24'),
(76, 16, 'Entrada', 5, 0, 5, 'Conteo físico', 'Ajuste de Inventario', NULL, 7, NULL, '2026-04-13 14:05:37'),
(77, 18, 'Entrada', 1, 0, 1, 'Conteo físico', 'Ajuste de Inventario', NULL, 7, NULL, '2026-04-13 14:05:49'),
(78, 11, 'Salida', 1, 1, 0, 'Entrega EPP', 'EPP-2026-001', 1, 7, 'Entrega EPP EPP-2026-001 a técnico', '2026-04-13 15:23:50'),
(79, 16, 'Salida', 1, 5, 4, 'Entrega EPP', 'EPP-2026-001', 1, 7, 'Entrega EPP EPP-2026-001 a técnico', '2026-04-13 15:23:50'),
(80, 9, 'Salida', 1, 2, 1, 'Entrega EPP', 'EPP-2026-001', 1, 7, 'Entrega EPP EPP-2026-001 a técnico', '2026-04-13 15:23:50'),
(81, 11, 'Entrada', 1, 0, 1, 'Devolución EPP', 'EPP-2026-001', 1, 7, 'Devolución EPP EPP-2026-001', '2026-04-13 15:25:25'),
(82, 16, 'Entrada', 1, 4, 5, 'Devolución EPP', 'EPP-2026-001', 1, 7, 'Devolución EPP EPP-2026-001', '2026-04-13 15:25:25'),
(83, 9, 'Entrada', 1, 1, 2, 'Devolución EPP', 'EPP-2026-001', 1, 7, 'Devolución EPP EPP-2026-001', '2026-04-13 15:25:25'),
(84, 25, 'Entrada', 16, 0, 16, 'Conteo físico', 'Ajuste de Inventario', NULL, 7, NULL, '2026-04-13 17:47:14'),
(85, 5, 'Entrada', 31, 0, 31, 'Conteo físico', 'Ajuste de Inventario', NULL, 7, NULL, '2026-04-13 17:51:19'),
(86, 26, 'Entrada', 48, 0, 48, 'Conteo físico', 'Ajuste de Inventario', NULL, 7, NULL, '2026-04-13 17:51:35'),
(87, 6, 'Entrada', 10, 0, 10, 'Conteo físico', 'Ajuste de Inventario', NULL, 7, NULL, '2026-04-13 17:52:05'),
(88, 25, 'Salida', 2, 16, 14, 'Orden Producto', 'OP-2026-001', 1, 7, 'Salida confirmada por almacén.', '2026-04-13 17:56:17'),
(89, 4, 'Entrada', 122, 5, 127, 'Conteo físico', 'Ajuste de Inventario', NULL, 7, 'prueba', '2026-04-13 18:02:40'),
(90, 4, 'Entrada', 73, 127, 200, 'Conteo físico', 'Ajuste de Inventario', NULL, 7, 'prueba', '2026-04-13 18:03:05'),
(91, 2, 'Salida', 127, 9605, 9478, 'Salida Programación Fabricación', 'PROGFAB-10', 10, 7, 'Salida confirmada por almacén.', '2026-04-13 18:03:23'),
(92, 3, 'Salida', 239, 10905, 10666, 'Salida Programación Fabricación', 'PROGFAB-10', 10, 7, 'Salida confirmada por almacén.', '2026-04-13 18:03:23'),
(93, 4, 'Salida', 127, 200, 73, 'Salida Programación Fabricación', 'PROGFAB-10', 10, 7, 'Salida confirmada por almacén.', '2026-04-13 18:03:23'),
(94, 1, 'Entrada', 150, 1190, 1340, 'Entrada por fabricación', 'CIERRE-PROGFAB-10', 10, 7, 'Ingreso de producto terminado por cierre de fabricación.', '2026-04-13 18:04:11'),
(95, 2, 'Salida', 13, 9478, 9465, 'Salida por diferencia de fabricación', 'CIERRE-PROGFAB-10', 10, 7, 'Consumo adicional de materia prima por fabricación mayor a la esperada.', '2026-04-13 18:04:11'),
(96, 3, 'Salida', 13, 10666, 10653, 'Salida por diferencia de fabricación', 'CIERRE-PROGFAB-10', 10, 7, 'Consumo adicional de materia prima por fabricación mayor a la esperada.', '2026-04-13 18:04:11'),
(97, 4, 'Salida', 13, 73, 60, 'Salida por diferencia de fabricación', 'CIERRE-PROGFAB-10', 10, 7, 'Consumo adicional de materia prima por fabricación mayor a la esperada.', '2026-04-13 18:04:11');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mantenimiento`
--

CREATE TABLE `mantenimiento` (
  `id` int(11) NOT NULL,
  `id_programacion` int(10) UNSIGNED DEFAULT NULL,
  `id_equipo` int(11) DEFAULT NULL,
  `id_actmanten` int(11) DEFAULT NULL,
  `fecha` datetime NOT NULL,
  `observaciones` varchar(100) DEFAULT NULL,
  `estado` enum('Pendiente','Realizado','Vencido') NOT NULL DEFAULT 'Pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `mantenimiento`
--

INSERT INTO `mantenimiento` (`id`, `id_programacion`, `id_equipo`, `id_actmanten`, `fecha`, `observaciones`, `estado`) VALUES
(1, 1, 1, 1, '2026-04-15 00:00:00', '', 'Pendiente'),
(3, 3, 2, 2, '2026-05-09 00:00:00', '', 'Pendiente'),
(4, 3, 2, 2, '2026-08-09 00:00:00', '', 'Pendiente'),
(5, 3, 2, 2, '2026-11-09 00:00:00', '', 'Pendiente'),
(6, 4, 3, 2, '2026-05-09 00:00:00', '', 'Pendiente'),
(7, 4, 3, 2, '2026-08-09 00:00:00', '', 'Pendiente'),
(8, 4, 3, 2, '2026-11-09 00:00:00', '', 'Pendiente'),
(9, 5, 6, 2, '2026-05-09 00:00:00', '', 'Pendiente'),
(10, 5, 6, 2, '2026-08-09 00:00:00', '', 'Pendiente'),
(11, 5, 6, 2, '2026-11-09 00:00:00', '', 'Pendiente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mantenimiento_vehiculo`
--

CREATE TABLE `mantenimiento_vehiculo` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_programacion` int(10) UNSIGNED DEFAULT NULL,
  `id_vehiculo` int(11) NOT NULL,
  `motivo` varchar(255) NOT NULL,
  `tipo_mantenimiento` enum('Preventivo','Correctivo') NOT NULL,
  `fecha_programada` datetime NOT NULL,
  `fecha_realizado` datetime DEFAULT NULL,
  `kilometraje` int(11) DEFAULT NULL,
  `observaciones` varchar(255) DEFAULT NULL,
  `estado` enum('Programado','Realizado','Vencido','Cancelado') NOT NULL DEFAULT 'Programado',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `multicim`
--

CREATE TABLE `multicim` (
  `id` int(11) NOT NULL,
  `nombre_empresa` varchar(100) NOT NULL,
  `alias_empresa` varchar(100) NOT NULL,
  `ruc` varchar(11) NOT NULL,
  `cuenta_bcp` varchar(100) NOT NULL,
  `codigo_interbancario_bcp` varchar(100) NOT NULL,
  `banco_nacion` varchar(100) NOT NULL,
  `codigo_interbancario_nacion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `multicim`
--

INSERT INTO `multicim` (`id`, `nombre_empresa`, `alias_empresa`, `ruc`, `cuenta_bcp`, `codigo_interbancario_bcp`, `banco_nacion`, `codigo_interbancario_nacion`) VALUES
(1, 'CIM CONSULTORES PARA LA INDUSTRIA ALIMENTARIA SAC', 'cim', '20604910090', '191-2656778-0-39', '00219100265677803955', '00-004-156900', '1800400000415690000'),
(2, 'Multitasking servicios generales SAC', 'multi', '20607499234', '191-9289661-0-57', '00219100928966105750', '00-054-127251', '01805400005412725174');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Fichas técnicas de servicios realizados';

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Anexos adicionales de las fichas técnicas';

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Detalle de monitoreo para gráficos de tendencias';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oei_informe_detalle_fichas`
--

CREATE TABLE `oei_informe_detalle_fichas` (
  `id_informe` int(11) NOT NULL,
  `id_ficha` int(11) NOT NULL,
  `orden` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Relación entre informes y fichas incluidas';

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Informes mensuales para clientes';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes_compra`
--

CREATE TABLE `ordenes_compra` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `numero_orden_compra` varchar(30) DEFAULT NULL,
  `numero_cotizacion_proveedor` varchar(60) DEFAULT NULL,
  `numero_factura` varchar(60) DEFAULT NULL,
  `id_proveedor` bigint(20) UNSIGNED NOT NULL,
  `fecha_compra` date NOT NULL,
  `fecha_recepcion` date DEFAULT NULL,
  `tipo_moneda` enum('PEN','USD') NOT NULL DEFAULT 'PEN',
  `tipo_cambio` decimal(8,4) DEFAULT NULL,
  `tiene_igv` tinyint(1) NOT NULL DEFAULT 1,
  `subtotal` decimal(12,4) NOT NULL DEFAULT 0.0000,
  `igv` decimal(12,4) NOT NULL DEFAULT 0.0000,
  `total` decimal(12,4) NOT NULL DEFAULT 0.0000,
  `estado` enum('Pendiente','Recibido','Anulado') NOT NULL DEFAULT 'Pendiente',
  `id_usuario` int(11) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_asesoria`
--

CREATE TABLE `orden_asesoria` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `numero_orden` varchar(30) NOT NULL,
  `id_cotizacion` int(10) UNSIGNED NOT NULL,
  `id_cliente` int(10) UNSIGNED NOT NULL,
  `id_cliente_planta` bigint(20) UNSIGNED DEFAULT NULL,
  `id_cliente_planta_area` bigint(20) UNSIGNED DEFAULT NULL,
  `id_servicio` int(10) UNSIGNED DEFAULT NULL,
  `id_exponente` int(10) UNSIGNED DEFAULT NULL,
  `fecha_servicio` date NOT NULL,
  `fecha_aceptacion` date DEFAULT NULL,
  `hora_servicio` time DEFAULT NULL,
  `modalidad` enum('Presencial','Virtual','Híbrido','Asíncrona') NOT NULL,
  `num_participantes` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `num_certificados` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `igv` decimal(12,2) NOT NULL DEFAULT 0.00,
  `incluye_igv` tinyint(1) NOT NULL DEFAULT 1,
  `costo` decimal(12,2) NOT NULL DEFAULT 0.00,
  `estado` varchar(20) NOT NULL DEFAULT 'Aprobado',
  `emitido_por` int(10) UNSIGNED DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_asesoria_exponentes`
--

CREATE TABLE `orden_asesoria_exponentes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_orden_asesoria` int(10) UNSIGNED NOT NULL,
  `id_exponente` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_capacitacion_auditoria`
--

CREATE TABLE `orden_capacitacion_auditoria` (
  `id` int(11) NOT NULL,
  `numero_orden` varchar(20) NOT NULL,
  `id_cotizacion` int(11) DEFAULT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_servicio` int(11) DEFAULT NULL,
  `id_ponente` int(11) DEFAULT NULL,
  `id_exponente` int(11) DEFAULT NULL,
  `fecha_servicio` date DEFAULT NULL,
  `fecha_aceptacion` date DEFAULT NULL,
  `hora_servicio` time DEFAULT NULL,
  `modalidad` enum('Presencial','Virtual','Híbrido','Asíncrona') DEFAULT NULL,
  `num_participantes` int(11) DEFAULT NULL,
  `num_certificados` int(11) DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `igv` decimal(10,2) DEFAULT NULL,
  `incluye_igv` tinyint(1) NOT NULL DEFAULT 1,
  `estado` varchar(100) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `emitido_por` int(10) UNSIGNED DEFAULT NULL,
  `horas_capacitacion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_capacitacion_ponentes`
--

CREATE TABLE `orden_capacitacion_ponentes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_orden_capacitacion` int(11) NOT NULL,
  `id_ponente` int(11) DEFAULT NULL,
  `id_exponente` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_fabricacion`
--

CREATE TABLE `orden_fabricacion` (
  `id` int(10) UNSIGNED NOT NULL,
  `codigo` varchar(30) NOT NULL,
  `fecha_orden` date NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `estado` enum('Borrador','Confirmada','Programada','Fabricada','Anulada') NOT NULL DEFAULT 'Confirmada',
  `resumen_insumos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`resumen_insumos`)),
  `observaciones` text DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `orden_fabricacion`
--

INSERT INTO `orden_fabricacion` (`id`, `codigo`, `fecha_orden`, `motivo`, `estado`, `resumen_insumos`, `observaciones`, `creado_por`, `created_at`, `updated_at`) VALUES
(9, 'OF-20260413-001', '2026-04-12', 'Stock para la semana', 'Fabricada', '[{\"id_producto_insumo\":2,\"descripcion\":\"LAMINA 50X10\",\"cantidad_requerida\":127,\"unidad\":\"Unidad\"},{\"id_producto_insumo\":3,\"descripcion\":\"TEMOCID\",\"cantidad_requerida\":238.76,\"unidad\":\"Gramos\"},{\"id_producto_insumo\":4,\"descripcion\":\"LAMINA ADHESIVA 50X10\",\"cantidad_requerida\":127,\"unidad\":null}]', NULL, 7, '2026-04-13 18:00:05', '2026-04-13 18:04:11');

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
  `fecha_aceptacion` date DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `igv` decimal(10,2) DEFAULT NULL,
  `incluye_igv` tinyint(1) NOT NULL DEFAULT 1,
  `emitido_por` int(11) DEFAULT NULL,
  `estado` varchar(100) NOT NULL DEFAULT 'Aprobado',
  `observaciones` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `orden_producto`
--

INSERT INTO `orden_producto` (`id`, `numero_orden`, `id_cotizacion`, `id_cliente`, `fecha_envio`, `fecha_aceptacion`, `total`, `subtotal`, `igv`, `incluye_igv`, `emitido_por`, `estado`, `observaciones`) VALUES
(1, 'OP-2026-001', 5, 10, '2026-04-13', '2026-04-13', 96.00, 96.00, 0.00, 0, 9, 'Aprobado', NULL);

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
  `subtotal` decimal(10,2) DEFAULT NULL,
  `igv` decimal(10,2) DEFAULT NULL,
  `incluye_igv` tinyint(1) NOT NULL DEFAULT 1,
  `emitido_por` int(11) DEFAULT NULL,
  `estado` varchar(100) NOT NULL DEFAULT 'Aprobado',
  `observaciones` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `orden_servicio`
--

INSERT INTO `orden_servicio` (`id`, `numero_orden`, `codigo_doc`, `version`, `id_cotizacion`, `id_cliente`, `fecha_aceptacion`, `fecha_tentativa`, `total_costo`, `subtotal`, `igv`, `incluye_igv`, `emitido_por`, `estado`, `observaciones`) VALUES
(4, 'OS-2026-001', NULL, '01', 2, 4, '2026-04-13', NULL, 1030.00, 1030.00, 0.00, 0, 9, 'Programado', NULL),
(5, 'OS-2026-002', NULL, '01', 4, 9, '2026-04-13', '2026-04-13', 600.00, 600.00, 0.00, 0, 9, 'Aprobado', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_servicio_equipo`
--

CREATE TABLE `orden_servicio_equipo` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_orden_servicio` int(11) NOT NULL,
  `id_servicio` int(11) DEFAULT NULL,
  `id_cliente_planta` bigint(20) UNSIGNED DEFAULT NULL,
  `id_cliente_planta_area` bigint(20) UNSIGNED DEFAULT NULL,
  `id_equipo` int(11) NOT NULL,
  `observacion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `orden_servicio_equipo`
--

INSERT INTO `orden_servicio_equipo` (`id`, `id_orden_servicio`, `id_servicio`, `id_cliente_planta`, `id_cliente_planta_area`, `id_equipo`, `observacion`) VALUES
(5, 4, 14, 1, 1, 2, 'I+D'),
(6, 4, 14, 2, 4, 2, 'I+D'),
(7, 4, 14, 1, 2, 2, NULL),
(8, 4, 14, 1, 3, 2, NULL),
(9, 4, 14, 2, 5, 2, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_servicio_producto`
--

CREATE TABLE `orden_servicio_producto` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_orden_servicio` int(11) NOT NULL,
  `id_servicio` int(11) DEFAULT NULL,
  `id_cliente_planta` bigint(20) UNSIGNED DEFAULT NULL,
  `id_cliente_planta_area` bigint(20) UNSIGNED DEFAULT NULL,
  `id_equipo` int(11) DEFAULT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `observacion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `orden_servicio_producto`
--

INSERT INTO `orden_servicio_producto` (`id`, `id_orden_servicio`, `id_servicio`, `id_cliente_planta`, `id_cliente_planta_area`, `id_equipo`, `id_producto`, `cantidad`, `observacion`) VALUES
(15, 4, 14, 1, 1, 2, 19, 1.00, 'I+D'),
(16, 4, 6, 1, 6, NULL, 5, 4.00, NULL),
(17, 4, 6, 1, 6, NULL, 6, 8.00, NULL),
(18, 4, 6, 1, 6, NULL, 7, 4.00, NULL),
(19, 4, 14, 2, 4, 2, 19, 1.00, 'I+D'),
(20, 4, 6, 1, 6, NULL, 22, 7.99, NULL),
(21, 4, 6, 1, 6, NULL, 21, 4.00, NULL),
(22, 4, 14, 1, 2, 2, 19, 1.00, NULL),
(23, 4, 14, 1, 3, 2, 19, 1.00, NULL),
(24, 4, 14, 2, 5, 2, 19, 1.00, NULL),
(25, 5, 6, 4, 8, NULL, 5, 20.00, NULL),
(26, 5, 6, 4, 8, NULL, 6, 24.00, NULL),
(27, 5, 6, 4, 8, NULL, 26, 8.00, NULL),
(28, 5, 6, 4, 8, NULL, 21, 20.00, NULL),
(29, 5, 6, 4, 8, NULL, 22, 72.00, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `password` varchar(255) NOT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'Activo',
  `id_cargo` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `personal`
--

INSERT INTO `personal` (`id`, `nombre`, `apellidos`, `celular`, `correo`, `id_area`, `usuario`, `password`, `estado`, `id_cargo`) VALUES
(1, 'Admin', 'Sistema', '999999999', 'admin@qsci.com', 6, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Activo', 3),
(2, 'Comercial', 'prueba', '984677415', 'coordinadorc@qsci.com', 1, 'prueba', '$2y$12$VNuBZf6q49Ezcwh3T.527./nIefQCN0yMzspSAzp4B7ws.lYERb0i', 'Activo', 1),
(3, 'Carlos', 'Mendoza', '987654321', 'operaciones@qsci.com', 2, 'operaciones', '$2y$12$oZsfueikeK0y9jRpJYje7e13CajJwohdXq9qE5u179HikZauS5Yh.', 'Activo', NULL),
(4, 'Laura', 'Torres', '987654322', 'administracion@qsci.com', 3, 'administracion', '$2y$12$NNITiSC7UIPPSRKjzUKUFuHd6fbReLt965BPc3q8ACkOlfE2ztYdu', 'Activo', NULL),
(5, 'María', 'García', '987654323', 'rrhh@qsci.com', 4, 'rrhh', '$2y$12$rydB5Ufq6xHq95h8pOB.E.ks.q/csznwrdyTyCCrjldK74gL9j2Tu', 'Activo', NULL),
(6, 'Jorge', 'Quispe', '987654324', 'finanzas@qsci.com', 5, 'finanzas', '$2y$12$XVRwn8kVEv1SQIeU8gAddeVK.jwvJgFUZ4qH12bFRZreY.BglShLO', 'Activo', NULL),
(7, 'Pedro', 'Vargas', '987654325', 'almacen@qsci.com', 7, 'almacen', '$2y$12$KEhG92xTOrAHtf5EQulU1O2pOp49N6cywQ4nfgJmIhd7CRRcIptye', 'Activo', NULL),
(8, 'Programacion', 'Servicios', '987654321', 'programacion@qsci.com', 8, 'programa', '$2y$12$HxHvW9C8n/LbgzNJ1EI7Ie/OnC03rKkwjsGhZutXtuNHV2YRaF/NO', 'Activo', 4),
(9, 'Area', 'Comercial', '987654321', 'asistentec@qsci.com', 1, 'Comercial', '$2y$12$nwicmVjHPit9YQazBED3Pu1RgaX9SU/4Fv3YhD3Q9cRzfKki8mrHS', 'Activo', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(64, 'App\\Models\\Personal', 9, 'auth-token', '816ae0eaf4fd90a941ebec8eb6b8813585af13c2bcf0d29aafd7c927da3a3300', '[\"*\"]', '2026-04-13 18:39:04', NULL, '2026-04-13 16:20:00', '2026-04-13 18:39:04'),
(77, 'App\\Models\\Personal', 8, 'auth-token', '986a0c931201e17ea0a0af16b5f5b733f46e583aa7944cd34e29842c50539299', '[\"*\"]', '2026-04-13 23:35:44', NULL, '2026-04-13 23:35:23', '2026-04-13 23:35:44'),
(79, 'App\\Models\\Personal', 1, 'auth-token', '7c396b874c21f61ee4e0e85182ee633d62a924d660052beb22ffd1c94974b563', '[\"*\"]', '2026-04-13 23:37:36', NULL, '2026-04-13 23:37:35', '2026-04-13 23:37:36');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `descripcion` varchar(200) NOT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `fecha_vencim` date DEFAULT NULL,
  `ubicacion` varchar(50) NOT NULL,
  `unidad` varchar(20) DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `n_lote` varchar(50) NOT NULL,
  `estado` enum('Activo','Inactivo') DEFAULT 'Activo',
  `imagen` varchar(500) DEFAULT NULL,
  `ingre_activo` varchar(500) DEFAULT NULL,
  `plag_objetivo` varchar(500) DEFAULT NULL,
  `presentacion` varchar(500) DEFAULT NULL,
  `es_fabricable` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `sku`, `descripcion`, `id_categoria`, `fecha_vencim`, `ubicacion`, `unidad`, `precio_unitario`, `n_lote`, `estado`, `imagen`, `ingre_activo`, `plag_objetivo`, `presentacion`, `es_fabricable`) VALUES
(1, 'DIS-LAM-0003', 'LAMINA DE TRAMPA DE LUZ 50X10', 2, NULL, '', 'Unidad', NULL, '', 'Activo', NULL, NULL, NULL, '50X10', 1),
(2, 'INS-LAM-0001', 'LAMINA 50X10', 1, NULL, '', 'Unidad', NULL, '', 'Activo', NULL, NULL, NULL, NULL, 0),
(3, 'INS-TEM-0002', 'TEMOCID', 1, NULL, '', 'Gramos', NULL, '925548', 'Activo', NULL, NULL, NULL, NULL, 0),
(4, 'INS-LAM-0002', 'LAMINA ADHESIVA 50X10', 1, NULL, '', NULL, NULL, '', 'Activo', NULL, NULL, NULL, NULL, 0),
(5, 'DIS-CAJ-0002', 'CAJA CEBADERA', 2, NULL, '', 'Unidad', NULL, '', 'Activo', 'productos/dispositivos/caja-cebadera-5.png', NULL, NULL, NULL, 0),
(6, 'DIS-JAU-0002', 'JAULA TOMAHACK', 2, NULL, '', 'Unidad', NULL, '', 'Activo', 'productos/dispositivos/jaula-tomahack-6.png', NULL, NULL, NULL, 0),
(7, 'DIS-BAN-0001', 'BANDEJA PEGANTE', 2, '2028-05-01', '', 'Unidad', NULL, '525', 'Activo', NULL, NULL, NULL, NULL, 0),
(8, 'EPP-BAT-0001', 'BATA M', 3, NULL, 'ARMARIO MARRON', 'Unidad', NULL, '', 'Activo', NULL, NULL, NULL, NULL, 0),
(9, 'EPP-BAT-0002', 'BATA L', 3, NULL, '', 'Unidad', NULL, '', 'Activo', NULL, NULL, NULL, NULL, 0),
(10, 'EPP-BAT-0003', 'BATA S', 3, NULL, '', 'Unidad', NULL, '', 'Activo', NULL, NULL, NULL, NULL, 0),
(11, 'EPP-POL-0001', 'POLO L', 3, NULL, '', 'Unidad', NULL, '', 'Activo', NULL, NULL, NULL, NULL, 0),
(12, 'EPP-CHA-0001', 'CHALECO L', 3, NULL, '', 'Unidad', NULL, '', 'Activo', NULL, NULL, NULL, NULL, 0),
(13, 'EPP-CHA-0002', 'CHALECO XL', 3, NULL, '', 'Unidad', NULL, '', 'Activo', NULL, NULL, NULL, NULL, 0),
(14, 'EPP-PAN-0001', 'PANTALON XL', 3, NULL, '', 'Unidad', NULL, '', 'Activo', NULL, NULL, NULL, NULL, 0),
(15, 'EPP-PAN-0002', 'PANTALON M', 3, NULL, '', 'Unidad', NULL, '', 'Activo', NULL, NULL, NULL, NULL, 0),
(16, 'EPP-PAN-0003', 'PANTALON L', 3, NULL, '', 'Unidad', NULL, '', 'Activo', NULL, NULL, NULL, NULL, 0),
(17, 'EPP-PAN-0004', 'PANTALON S', 3, NULL, '', 'Unidad', NULL, '', 'Activo', NULL, NULL, NULL, NULL, 0),
(18, 'EPP-PAN-0005', 'PANTALON XXL', 3, NULL, '', 'Unidad', NULL, '', 'Activo', NULL, NULL, NULL, NULL, 0),
(19, 'QUI-BET-0003', 'BETAFOX', 4, '2027-10-01', '', 'Mililitros', 95.00, 'FUM2000BF25', 'Activo', 'productos/quimicos/betafox-19.png', 'Beta-cipermetrina', 'Insectos Voladores', '1L', 0),
(20, 'QUI-DMQ-0001', 'DMQ', 4, '2027-09-01', '', 'Mililitros', 105.00, '1351-25', 'Activo', 'productos/quimicos/dmq-20.png', 'Amonio Cuaternario de Quinta Generación', 'agente virucida, bactericida y fungicida', '3.75 L', 0),
(21, 'QUI-CEB-0001', 'CEBO FINAL ALL', 4, '2027-07-01', '', 'Unidad', NULL, 'WEC52022', 'Activo', 'productos/consumible/cebo-final-all-21.png', 'Brodifacoum', 'Roedores', NULL, 0),
(22, 'CON-CRO-0001', 'CROQUETAS', 5, '2027-02-19', '', 'Gramos', NULL, '15260219-2', 'Activo', NULL, NULL, NULL, 'Saco 9kg', 0),
(23, 'DIS-LAM-0004', 'LAMINA PEGANTE', 2, '2028-03-04', '', 'Unidad', NULL, 'WT253012', 'Activo', 'productos/dispositivos/lamina-pegante-23.png', NULL, NULL, 'caja de 72 unidades', 0),
(24, 'QUI-BOM-0001', 'BOMBAMAX', 4, '2026-02-01', '', 'Mililitros', NULL, '0021T260138', 'Activo', 'productos/quimicos/bombamax-24.png', 'ALFACIPERMETRINA/PIRIPROXYFEN', 'INSECTOS', '1L', 0),
(25, 'DIS-FLU-0002', 'FLUORESCENTE 20W', 2, NULL, '', 'Unidad', NULL, '', 'Activo', 'productos/dispositivos/foco-18w-25.png', NULL, NULL, NULL, 0),
(26, 'DIS-TUB-0001', 'TUBO CEBADERO', 2, NULL, '', 'Unidad', NULL, '', 'Activo', 'productos/dispositivos/tubo-cebadero-26.png', NULL, NULL, NULL, 0),
(27, 'INS-BAN-0001', 'BANDEJA SALCHIPAPERA', 1, NULL, '', 'Unidad', NULL, '', 'Activo', NULL, NULL, NULL, NULL, 0),
(28, 'INS-STI-0001', 'STICKER CONTROL DE ROEDORES', 1, NULL, '', 'Unidad', NULL, '', 'Activo', NULL, NULL, NULL, NULL, 0),
(29, 'INS-STI-0002', 'STICKER MONITOREO DE ROEDORES', 1, NULL, '', 'Unidad', NULL, '', 'Activo', NULL, NULL, NULL, NULL, 0),
(30, 'INS-STI-0003', 'STICKER CONTROL DE TRAMPA DE LUZ', 1, NULL, '', 'Unidad', NULL, '', 'Activo', NULL, NULL, NULL, NULL, 0),
(31, 'INS-STI-0004', 'STICKER CONTROL DE ROEDORES LP', 1, NULL, '', 'Unidad', NULL, '', 'Activo', NULL, NULL, NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_receta_detalle`
--

CREATE TABLE `producto_receta_detalle` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_producto_final` int(11) NOT NULL,
  `id_producto_insumo` int(11) NOT NULL,
  `cantidad` decimal(10,3) NOT NULL,
  `unidad` varchar(20) DEFAULT NULL,
  `observacion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `producto_receta_detalle`
--

INSERT INTO `producto_receta_detalle` (`id`, `id_producto_final`, `id_producto_insumo`, `cantidad`, `unidad`, `observacion`) VALUES
(1, 1, 2, 1.000, NULL, NULL),
(2, 1, 4, 1.000, NULL, NULL),
(3, 1, 3, 1.880, 'Gramos', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_asesoria`
--

CREATE TABLE `programacion_asesoria` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_orden_asesoria` int(11) NOT NULL,
  `id_supervisor` int(11) DEFAULT NULL,
  `id_vehiculo` int(11) DEFAULT NULL,
  `id_cliente_planta` bigint(20) UNSIGNED DEFAULT NULL,
  `id_cliente_planta_area` bigint(20) UNSIGNED DEFAULT NULL,
  `fecha_programada` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time DEFAULT NULL,
  `local_sede` varchar(150) DEFAULT NULL,
  `direccion_completa` varchar(255) DEFAULT NULL,
  `modalidad_visita` varchar(20) DEFAULT NULL,
  `estado_ejecucion` enum('Programado','Confirmado','En Camino','En Ejecucion','Realizado','Reprogramado','Cancelado') NOT NULL DEFAULT 'Programado',
  `observaciones` text DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_asesoria_exponentes`
--

CREATE TABLE `programacion_asesoria_exponentes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_programacion_asesoria` int(11) NOT NULL,
  `id_exponente` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_capacitacion`
--

CREATE TABLE `programacion_capacitacion` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_orden_capacitacion` int(11) NOT NULL,
  `id_supervisor` int(11) DEFAULT NULL,
  `id_vehiculo` int(11) DEFAULT NULL,
  `id_cliente_planta` bigint(20) UNSIGNED DEFAULT NULL,
  `id_cliente_planta_area` bigint(20) UNSIGNED DEFAULT NULL,
  `fecha_programada` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time DEFAULT NULL,
  `local_sede` varchar(150) DEFAULT NULL,
  `direccion_completa` varchar(255) DEFAULT NULL,
  `estado_ejecucion` enum('Programado','Confirmado','En Camino','En Ejecucion','Realizado','Reprogramado','Cancelado') NOT NULL DEFAULT 'Programado',
  `observaciones` text DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_capacitacion_exponentes`
--

CREATE TABLE `programacion_capacitacion_exponentes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_programacion_capacitacion` int(11) NOT NULL,
  `id_exponente` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_exponentes`
--

CREATE TABLE `programacion_exponentes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_programacion` bigint(20) UNSIGNED NOT NULL,
  `id_exponente` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_fabricacion`
--

CREATE TABLE `programacion_fabricacion` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_orden_fabricacion` int(10) UNSIGNED DEFAULT NULL,
  `motivo_fabricacion` varchar(255) NOT NULL,
  `productos_fabricacion` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`productos_fabricacion`)),
  `receta_fabricacion` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`receta_fabricacion`)),
  `id_tecnico_asignado` int(11) DEFAULT NULL,
  `tecnicos_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tecnicos_ids`)),
  `id_supervisor` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`id_supervisor`)),
  `fecha_programada` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time DEFAULT NULL,
  `estado_ejecucion` enum('Programado','Confirmado','En Camino','En Ejecución','Realizado','Reprogramado','Cancelado') NOT NULL DEFAULT 'Programado',
  `observaciones` text DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `programacion_fabricacion`
--

INSERT INTO `programacion_fabricacion` (`id`, `id_orden_fabricacion`, `motivo_fabricacion`, `productos_fabricacion`, `receta_fabricacion`, `id_tecnico_asignado`, `tecnicos_ids`, `id_supervisor`, `fecha_programada`, `hora_inicio`, `hora_fin`, `estado_ejecucion`, `observaciones`, `creado_por`, `created_at`, `updated_at`) VALUES
(10, 9, 'Stock para la semana', '[1]', '[{\"id\":1,\"descripcion\":\"LAMINA DE TRAMPA DE LUZ 50X10\",\"cantidad_a_fabricar\":127,\"receta\":[{\"id_producto_insumo\":2,\"cantidad\":1,\"unidad\":null,\"observacion\":null,\"insumo\":{\"id\":2,\"descripcion\":\"LAMINA 50X10\",\"unidad\":\"Unidad\",\"inventario\":{\"cantidad_disponible\":9605}}},{\"id_producto_insumo\":3,\"cantidad\":1.88,\"unidad\":\"Gramos\",\"observacion\":null,\"insumo\":{\"id\":3,\"descripcion\":\"TEMOCID\",\"unidad\":\"Gramos\",\"inventario\":{\"cantidad_disponible\":10905}}},{\"id_producto_insumo\":4,\"cantidad\":1,\"unidad\":null,\"observacion\":null,\"insumo\":{\"id\":4,\"descripcion\":\"LAMINA ADHESIVA 50X10\",\"unidad\":null,\"inventario\":{\"cantidad_disponible\":5}}}],\"insumos_requeridos\":[{\"id_producto_insumo\":2,\"descripcion\":\"LAMINA 50X10\",\"cantidad_requerida\":127,\"unidad\":\"Unidad\"},{\"id_producto_insumo\":3,\"descripcion\":\"TEMOCID\",\"cantidad_requerida\":238.76,\"unidad\":\"Gramos\"},{\"id_producto_insumo\":4,\"descripcion\":\"LAMINA ADHESIVA 50X10\",\"cantidad_requerida\":127,\"unidad\":null}]}]', 1, '[1]', NULL, '2026-04-12', '09:00:00', '10:00:00', 'Realizado', NULL, 1, '2026-04-13 18:01:03', '2026-04-13 18:04:11');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_mantenimiento`
--

CREATE TABLE `programacion_mantenimiento` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_equipo` int(11) NOT NULL,
  `id_actmanten` int(11) NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `anio` int(11) NOT NULL,
  `modo_programacion` enum('Anual','Unica') NOT NULL DEFAULT 'Anual',
  `frecuencia_meses` int(11) NOT NULL COMMENT 'Cada cuántos meses: 1,2,3,4,6,12',
  `fecha_inicio` date NOT NULL,
  `total_programados` int(11) NOT NULL DEFAULT 0,
  `observaciones` varchar(255) DEFAULT NULL,
  `es_prueba` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `programacion_mantenimiento`
--

INSERT INTO `programacion_mantenimiento` (`id`, `id_equipo`, `id_actmanten`, `motivo`, `anio`, `modo_programacion`, `frecuencia_meses`, `fecha_inicio`, `total_programados`, `observaciones`, `es_prueba`, `created_at`) VALUES
(1, 1, 1, 'Derrame de Gasolina, Demora en encedido, descarga rapida', 2026, 'Unica', 0, '2026-04-15', 1, NULL, 0, '2026-04-13 15:31:44'),
(3, 2, 2, 'Mantenimiento preventivo', 2026, 'Anual', 3, '2026-05-09', 3, NULL, 0, '2026-04-13 16:29:22'),
(4, 3, 2, 'Mantenimiento preventivo', 2026, 'Anual', 3, '2026-05-09', 3, NULL, 0, '2026-04-13 16:29:47'),
(5, 6, 2, 'Mantenimiento preventivo', 2026, 'Anual', 3, '2026-05-09', 3, NULL, 0, '2026-04-13 16:33:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_mantenimiento_vehiculo`
--

CREATE TABLE `programacion_mantenimiento_vehiculo` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_vehiculo` int(11) NOT NULL,
  `motivo` varchar(255) NOT NULL,
  `anio` int(11) NOT NULL,
  `frecuencia_meses` int(11) NOT NULL COMMENT 'Cada cuántos meses: 1,2,3,4,6,12',
  `fecha_inicio` date NOT NULL,
  `total_programados` int(11) NOT NULL DEFAULT 0,
  `observaciones` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_otros`
--

CREATE TABLE `programacion_otros` (
  `id` int(10) UNSIGNED NOT NULL,
  `motivo` varchar(255) NOT NULL,
  `id_tecnico_asignado` int(11) DEFAULT NULL,
  `tecnicos_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tecnicos_ids`)),
  `id_supervisor` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`id_supervisor`)),
  `id_vehiculo` int(11) DEFAULT NULL,
  `fecha_programada` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time DEFAULT NULL,
  `ubicacion_manual` varchar(255) NOT NULL,
  `estado_ejecucion` enum('Programado','Confirmado','En Camino','En Ejecución','Realizado','Reprogramado','Cancelado') NOT NULL DEFAULT 'Programado',
  `observaciones` text DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_servicio`
--

CREATE TABLE `programacion_servicio` (
  `id` int(11) NOT NULL,
  `id_orden_servicio` int(11) DEFAULT NULL,
  `id_orden_capacitacion` int(11) DEFAULT NULL,
  `id_cliente_planta` bigint(20) UNSIGNED DEFAULT NULL,
  `id_cliente_planta_area` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`id_cliente_planta_area`)),
  `id_servicio` int(11) NOT NULL,
  `id_tecnico_asignado` int(11) NOT NULL,
  `id_supervisor` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`id_supervisor`)),
  `id_vehiculo` int(11) DEFAULT NULL,
  `fecha_programada` date NOT NULL,
  `dias_semana` varchar(100) DEFAULT NULL COMMENT 'Días de la semana específicos cuando frecuencia es "Días de la semana" (CSV: Lunes,Martes,etc.)',
  `hora_inicio` time NOT NULL,
  `hora_fin` time DEFAULT NULL,
  `duracion_real` int(11) DEFAULT NULL,
  `local_sede` varchar(150) DEFAULT NULL,
  `direccion_completa` varchar(255) DEFAULT NULL,
  `coordenadas` varchar(50) DEFAULT NULL,
  `estado_ejecucion` enum('Programado','Confirmado','En Camino','En Ejecución','Realizado','Reprogramado','Cancelado') DEFAULT 'Programado',
  `requiere_asignacion_recursos` tinyint(1) NOT NULL DEFAULT 0,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_tecnicos`
--

CREATE TABLE `programacion_tecnicos` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_programacion` int(11) NOT NULL,
  `id_tecnico` int(11) NOT NULL,
  `rol` enum('Principal','Apoyo') NOT NULL DEFAULT 'Apoyo',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_visita`
--

CREATE TABLE `programacion_visita` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `tipo_visita` varchar(120) NOT NULL,
  `id_tecnico_asignado` int(11) DEFAULT NULL,
  `tecnicos_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tecnicos_ids`)),
  `id_supervisor` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`id_supervisor`)),
  `id_vehiculo` int(11) DEFAULT NULL,
  `id_cliente_planta` bigint(20) UNSIGNED DEFAULT NULL,
  `id_cliente_planta_area` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`id_cliente_planta_area`)),
  `fecha_programada` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time DEFAULT NULL,
  `local_sede` varchar(150) DEFAULT NULL,
  `direccion_completa` varchar(255) DEFAULT NULL,
  `estado_ejecucion` enum('Programado','Confirmado','En Camino','En Ejecución','Realizado','Reprogramado','Cancelado') NOT NULL DEFAULT 'Programado',
  `observaciones` text DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `razon_social` varchar(200) NOT NULL,
  `ruc` varchar(20) DEFAULT NULL,
  `nombre_comercial` varchar(200) DEFAULT NULL,
  `contacto_nombre` varchar(150) DEFAULT NULL,
  `contacto_telefono` varchar(30) DEFAULT NULL,
  `contacto_email` varchar(150) DEFAULT NULL,
  `direccion` varchar(300) DEFAULT NULL,
  `banco` varchar(100) DEFAULT NULL,
  `numero_cuenta` varchar(50) DEFAULT NULL,
  `cci` varchar(50) DEFAULT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proyecciones`
--

CREATE TABLE `proyecciones` (
  `id` int(11) NOT NULL,
  `actividad` varchar(100) NOT NULL,
  `id_multicim` int(11) NOT NULL,
  `id_orden_servicio` int(11) DEFAULT NULL,
  `id_orden_producto` int(11) DEFAULT NULL,
  `id_orden_capacitacion_auditoria` int(11) DEFAULT NULL,
  `n_factura` varchar(100) NOT NULL,
  `monto_detrax` decimal(10,2) NOT NULL,
  `total_final` decimal(10,2) NOT NULL,
  `fecha_factura` date DEFAULT NULL,
  `dias_credito` int(11) NOT NULL,
  `fecha_vcto` date DEFAULT NULL,
  `dia_vencer` int(11) DEFAULT NULL,
  `fecha_pago` date DEFAULT NULL,
  `fecha_ejecucion` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  `hora_inicio_almuerzo` time DEFAULT NULL,
  `hora_fin_almuerzo` time DEFAULT NULL,
  `exceso_almuerzo_minutos` int(11) NOT NULL DEFAULT 0,
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
  `tiempo_extra_minutos` int(11) NOT NULL DEFAULT 0,
  `horas_extra_asignadas` tinyint(1) NOT NULL DEFAULT 0,
  `hora_inicio_extra` time DEFAULT NULL,
  `estado` enum('Puntual','Tardanza','Falta','Fuera de Rango','Incompleto','Justificada') DEFAULT 'Incompleto',
  `observaciones` text DEFAULT NULL,
  `justificacion` varchar(255) DEFAULT NULL,
  `registrado_via` enum('AppSheet','Web','Manual') DEFAULT 'AppSheet',
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `modificado_por` int(11) DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Registro unificado de asistencia para administrativos y técnicos';

--
-- Volcado de datos para la tabla `rrhh_asistencia`
--

INSERT INTO `rrhh_asistencia` (`id`, `id_personal`, `id_tecnico`, `id_programacion`, `fecha`, `tipo_registro`, `hora_entrada`, `hora_salida`, `hora_inicio_almuerzo`, `hora_fin_almuerzo`, `exceso_almuerzo_minutos`, `hora_esperada_entrada`, `hora_esperada_salida`, `gps_entrada`, `gps_salida`, `distancia_cliente_metros`, `dentro_rango_50m`, `foto_entrada`, `foto_salida`, `fotos_servicio`, `horas_trabajadas`, `tardanza_minutos`, `tiempo_extra_minutos`, `horas_extra_asignadas`, `hora_inicio_extra`, `estado`, `observaciones`, `justificacion`, `registrado_via`, `fecha_creacion`, `modificado_por`, `fecha_modificacion`) VALUES
(1, 2, NULL, NULL, '2026-04-12', 'Oficina', '11:00:46', '17:37:07', '14:49:36', '15:41:14', 6, '11:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 6.51, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-12 11:00:46', NULL, '2026-04-12 17:37:07'),
(2, 1, NULL, NULL, '2026-04-12', 'Oficina', '11:05:22', '17:37:34', '14:50:23', '15:40:50', 5, '11:00:00', '17:30:00', NULL, NULL, NULL, 0, NULL, NULL, NULL, 6.46, 0, 0, 0, NULL, 'Puntual', NULL, NULL, 'Web', '2026-04-12 11:05:22', NULL, '2026-04-12 17:37:34');

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
  `activo` tinyint(1) DEFAULT 1,
  `es_descanso` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Si es true, es día de descanso (no se marca asistencia)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Horarios laborales esperados por empleado';

--
-- Volcado de datos para la tabla `rrhh_horarios`
--

INSERT INTO `rrhh_horarios` (`id`, `id_personal`, `id_tecnico`, `dia_semana`, `hora_entrada_esperada`, `hora_salida_esperada`, `tolerancia_minutos`, `activo`, `es_descanso`) VALUES
(1, 1, NULL, 'Lunes', '08:00:00', '17:30:00', 10, 1, 0),
(2, 1, NULL, 'Martes', '08:00:00', '17:30:00', 10, 1, 0),
(3, 1, NULL, 'Miércoles', '08:00:00', '17:30:00', 10, 1, 0),
(4, 1, NULL, 'Jueves', '08:00:00', '17:30:00', 10, 1, 0),
(5, 1, NULL, 'Viernes', '08:00:00', '17:30:00', 10, 1, 0),
(6, 1, NULL, 'Sábado', '08:00:00', '17:00:00', 10, 1, 0),
(7, 1, NULL, 'Domingo', '11:00:00', '17:30:00', 10, 1, 0),
(8, 2, NULL, 'Lunes', '08:00:00', '17:30:00', 10, 1, 0),
(9, 2, NULL, 'Martes', '08:00:00', '17:30:00', 10, 1, 0),
(10, 2, NULL, 'Miércoles', '08:00:00', '17:30:00', 10, 1, 0),
(11, 2, NULL, 'Jueves', '08:00:00', '17:30:00', 10, 1, 0),
(12, 2, NULL, 'Viernes', '08:00:00', '17:30:00', 10, 1, 0),
(13, 2, NULL, 'Sábado', '08:00:00', '17:00:00', 10, 1, 0),
(14, 2, NULL, 'Domingo', '11:00:00', '17:30:00', 10, 1, 0),
(15, 3, NULL, 'Lunes', '08:00:00', '17:30:00', 10, 1, 0),
(16, 3, NULL, 'Martes', '08:00:00', '17:30:00', 10, 1, 0),
(17, 3, NULL, 'Miércoles', '08:00:00', '17:30:00', 10, 1, 0),
(18, 3, NULL, 'Jueves', '08:00:00', '17:30:00', 10, 1, 0),
(19, 3, NULL, 'Viernes', '08:00:00', '17:30:00', 10, 1, 0),
(20, 3, NULL, 'Sábado', '08:00:00', '17:00:00', 10, 1, 0),
(21, 3, NULL, 'Domingo', '11:00:00', '17:30:00', 10, 1, 0),
(22, 4, NULL, 'Lunes', '08:00:00', '17:30:00', 10, 1, 0),
(23, 4, NULL, 'Martes', '08:00:00', '17:30:00', 10, 1, 0),
(24, 4, NULL, 'Miércoles', '08:00:00', '17:30:00', 10, 1, 0),
(25, 4, NULL, 'Jueves', '08:00:00', '17:30:00', 10, 1, 0),
(26, 4, NULL, 'Viernes', '08:00:00', '17:30:00', 10, 1, 0),
(27, 4, NULL, 'Sábado', '08:00:00', '17:00:00', 10, 1, 0),
(28, 4, NULL, 'Domingo', '11:00:00', '17:30:00', 10, 1, 0),
(29, 5, NULL, 'Lunes', '08:00:00', '17:30:00', 10, 1, 0),
(30, 5, NULL, 'Martes', '08:00:00', '17:30:00', 10, 1, 0),
(31, 5, NULL, 'Miércoles', '08:00:00', '17:30:00', 10, 1, 0),
(32, 5, NULL, 'Jueves', '08:00:00', '17:30:00', 10, 1, 0),
(33, 5, NULL, 'Viernes', '08:00:00', '17:30:00', 10, 1, 0),
(34, 5, NULL, 'Sábado', '08:00:00', '17:00:00', 10, 1, 0),
(35, 5, NULL, 'Domingo', '11:00:00', '17:30:00', 10, 1, 0),
(36, 6, NULL, 'Lunes', '08:00:00', '17:30:00', 10, 1, 0),
(37, 6, NULL, 'Martes', '08:00:00', '17:30:00', 10, 1, 0),
(38, 6, NULL, 'Miércoles', '08:00:00', '17:30:00', 10, 1, 0),
(39, 6, NULL, 'Jueves', '08:00:00', '17:30:00', 10, 1, 0),
(40, 6, NULL, 'Viernes', '08:00:00', '17:30:00', 10, 1, 0),
(41, 6, NULL, 'Sábado', '08:00:00', '17:00:00', 10, 1, 0),
(42, 6, NULL, 'Domingo', '11:00:00', '17:30:00', 10, 1, 0),
(43, 7, NULL, 'Lunes', '08:00:00', '17:30:00', 10, 1, 0),
(44, 7, NULL, 'Martes', '08:00:00', '17:30:00', 10, 1, 0),
(45, 7, NULL, 'Miércoles', '08:00:00', '17:30:00', 10, 1, 0),
(46, 7, NULL, 'Jueves', '08:00:00', '17:30:00', 10, 1, 0),
(47, 7, NULL, 'Viernes', '08:00:00', '17:30:00', 10, 1, 0),
(48, 7, NULL, 'Sábado', '08:00:00', '17:00:00', 10, 1, 0),
(49, 7, NULL, 'Domingo', '11:00:00', '17:30:00', 10, 1, 0),
(50, 8, NULL, 'Lunes', '08:00:00', '17:30:00', 10, 1, 0),
(51, 8, NULL, 'Martes', '08:00:00', '17:30:00', 10, 1, 0),
(52, 8, NULL, 'Miércoles', '08:00:00', '17:30:00', 10, 1, 0),
(53, 8, NULL, 'Jueves', '08:00:00', '17:30:00', 10, 1, 0),
(54, 8, NULL, 'Viernes', '08:00:00', '17:30:00', 10, 1, 0),
(55, 8, NULL, 'Sábado', '08:00:00', '17:00:00', 10, 1, 0),
(56, 8, NULL, 'Domingo', '11:00:00', '17:30:00', 10, 1, 0),
(57, 9, NULL, 'Lunes', '08:00:00', '17:30:00', 10, 1, 0),
(58, 9, NULL, 'Martes', '08:00:00', '17:30:00', 10, 1, 0),
(59, 9, NULL, 'Miércoles', '08:00:00', '17:30:00', 10, 1, 0),
(60, 9, NULL, 'Jueves', '08:00:00', '17:30:00', 10, 1, 0),
(61, 9, NULL, 'Viernes', '08:00:00', '17:30:00', 10, 1, 0),
(62, 9, NULL, 'Sábado', '08:00:00', '17:00:00', 10, 1, 0),
(63, 9, NULL, 'Domingo', '11:00:00', '17:30:00', 10, 1, 0);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Justificaciones de tardanzas y faltas';

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `servicios`
--

INSERT INTO `servicios` (`id`, `nombre`, `descripcion`, `estado`, `duracion_estimada`, `requiere_movilidad`, `requiere_certificado`, `plantilla_certificado`) VALUES
(1, 'DESINSECTACION QUIMICA', '---', 'inactivo', 60, 0, 0, NULL),
(2, 'DESINSECTACION QUIMICA', '---', 'activo', 60, 0, 0, NULL),
(3, 'DESINFECCION', '---', 'activo', 60, 0, 0, NULL),
(4, 'DESINSECTACION QUIMICA CON FOSFINA', '---', 'activo', 60, 0, 0, NULL),
(5, 'MEDICION GAS DE FOSFINA', '---', 'activo', 60, 0, 0, NULL),
(6, 'DESRATIZACION', '---', 'activo', 60, 0, 0, NULL),
(7, 'MONITOREO DE CUCARACHAS', '---', 'activo', 60, 0, 0, NULL),
(8, 'INTERVENCION POR CUCARACHAS', '---', 'activo', 60, 0, 0, NULL),
(9, 'DESINSECTACION FISICA', '---', 'activo', 60, 0, 0, NULL),
(10, 'LIMPIEZA DE CISTERNAS Y RESERVORIOS', '---', 'activo', 60, 0, 0, NULL),
(11, 'CONTROL AVIAR', '---', 'activo', 60, 0, 0, NULL),
(12, 'LIMPIEZA DE TRAMPA DE GRASA', '---', 'activo', 60, 0, 0, NULL),
(13, 'FUMIGACION', '---', 'activo', 60, 0, 0, NULL),
(14, 'FUMIGACION Y DESINFECCION', '---', 'activo', 60, 0, 0, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicio_producto`
--

CREATE TABLE `servicio_producto` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_servicio` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_equipo` int(11) DEFAULT NULL,
  `cantidad_default` decimal(10,2) NOT NULL DEFAULT 1.00,
  `observacion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `estado` enum('Activo','Inactivo','Licencia') DEFAULT 'Activo',
  `id_exponente_vinculado` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `tecnicos`
--

INSERT INTO `tecnicos` (`id`, `nombre`, `apellidos`, `dni`, `celular`, `correo`, `especialidad`, `autorizado_conducir`, `carga_maxima_semanal`, `estado`, `id_exponente_vinculado`) VALUES
(1, 'Ricki Yordi', 'Choque Alacote', '47931115', NULL, NULL, 'Técnico Fumigación', 1, 40, 'Activo', NULL);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `vehiculos`
--

INSERT INTO `vehiculos` (`id`, `placa`, `modelo`, `marca`, `anio`, `capacidad_carga`, `estado`) VALUES
(1, 'CMY-562', 'C37', 'DFSK', 2024, 200.00, 'Disponible');

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
-- Indices de la tabla `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indices de la tabla `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indices de la tabla `caja_chica`
--
ALTER TABLE `caja_chica`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `cargo`
--
ALTER TABLE `cargo`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `catalogo_capacitacion_auditoria`
--
ALTER TABLE `catalogo_capacitacion_auditoria`
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
-- Indices de la tabla `cliente_planta`
--
ALTER TABLE `cliente_planta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cliente_planta_id_cliente_foreign` (`id_cliente`);

--
-- Indices de la tabla `cliente_planta_area`
--
ALTER TABLE `cliente_planta_area`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cliente_planta_area_id_cliente_planta_foreign` (`id_cliente_planta`);

--
-- Indices de la tabla `cotizacion`
--
ALTER TABLE `cotizacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cot_cli` (`id_cliente`),
  ADD KEY `fk_cot_per` (`id_personal_creador`),
  ADD KEY `fk_cotizacion_multicim` (`id_multicim`);

--
-- Indices de la tabla `cotizacion_beneficio`
--
ALTER TABLE `cotizacion_beneficio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cotizacion_beneficio_id_cotizacion_foreign` (`id_cotizacion`),
  ADD KEY `cotizacion_beneficio_id_catalogo_cap_aud_foreign` (`id_catalogo_cap_aud`);

--
-- Indices de la tabla `cotizacion_detalle`
--
ALTER TABLE `cotizacion_detalle`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_det_cot_orig` (`id_cotizacion`),
  ADD KEY `fk_det_cot_ser` (`id_servicio`),
  ADD KEY `fk_det_cot_pro` (`id_producto`),
  ADD KEY `cotizacion_detalle_id_catalogo_cap_aud_foreign` (`id_catalogo_cap_aud`),
  ADD KEY `cotizacion_detalle_id_cliente_planta_foreign` (`id_cliente_planta`);

--
-- Indices de la tabla `detalle_entrada_devolucion_fabricacion`
--
ALTER TABLE `detalle_entrada_devolucion_fabricacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_det_efd_producto` (`id_producto`),
  ADD KEY `idx_det_efd_header` (`id_entrada_devolucion_fabricacion`),
  ADD KEY `idx_det_efd_tipo_producto` (`tipo`,`id_producto`);

--
-- Indices de la tabla `detalle_entrega_epp`
--
ALTER TABLE `detalle_entrega_epp`
  ADD PRIMARY KEY (`id`),
  ADD KEY `detalle_entrega_epp_id_entrega_epp_foreign` (`id_entrega_epp`),
  ADD KEY `detalle_entrega_epp_id_producto_foreign` (`id_producto`),
  ADD KEY `detalle_entrega_epp_id_entrega_reemplazo_foreign` (`id_entrega_reemplazo`);

--
-- Indices de la tabla `detalle_ordenes_compra`
--
ALTER TABLE `detalle_ordenes_compra`
  ADD PRIMARY KEY (`id`),
  ADD KEY `detalle_ordenes_compra_id_orden_compra_index` (`id_orden_compra`),
  ADD KEY `detalle_ordenes_compra_id_producto_index` (`id_producto`);

--
-- Indices de la tabla `detalle_orden_asesoria`
--
ALTER TABLE `detalle_orden_asesoria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `detalle_orden_asesoria_id_orden_asesoria_index` (`id_orden_asesoria`);

--
-- Indices de la tabla `detalle_orden_capacitacion_equipos`
--
ALTER TABLE `detalle_orden_capacitacion_equipos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `detalle_orden_capacitacion_materiales`
--
ALTER TABLE `detalle_orden_capacitacion_materiales`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `detalle_orden_fabricacion`
--
ALTER TABLE `detalle_orden_fabricacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_det_of_producto` (`id_producto_final`),
  ADD KEY `idx_det_of_orden` (`id_orden_fabricacion`);

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
  ADD KEY `fk_dos_ser` (`id_servicio`),
  ADD KEY `detalle_orden_servicio_id_cliente_planta_foreign` (`id_cliente_planta`);

--
-- Indices de la tabla `entrada_devolucion_fabricacion`
--
ALTER TABLE `entrada_devolucion_fabricacion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_efd_prog` (`id_programacion_fabricacion`),
  ADD KEY `idx_efd_orden` (`id_orden_fabricacion`),
  ADD KEY `idx_efd_estado` (`estado`);

--
-- Indices de la tabla `entrega_epp`
--
ALTER TABLE `entrega_epp`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `entrega_epp_numero_entrega_unique` (`numero_entrega`),
  ADD KEY `entrega_epp_id_tecnico_foreign` (`id_tecnico`),
  ADD KEY `entrega_epp_registrado_por_foreign` (`registrado_por`),
  ADD KEY `entrega_epp_devuelto_por_foreign` (`devuelto_por`);

--
-- Indices de la tabla `equipo`
--
ALTER TABLE `equipo`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `exponentes`
--
ALTER TABLE `exponentes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_exponentes_tecnico_vinculado` (`id_tecnico_vinculado`);

--
-- Indices de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indices de la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_inventario_productos` (`id_productos`);

--
-- Indices de la tabla `inventario_ajustes`
--
ALTER TABLE `inventario_ajustes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inventario_ajustes_id_producto_fecha_ajuste_index` (`id_producto`,`fecha_ajuste`),
  ADD KEY `inventario_ajustes_id_usuario_index` (`id_usuario`),
  ADD KEY `inventario_ajustes_tipo_ajuste_index` (`tipo_ajuste`);

--
-- Indices de la tabla `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indices de la tabla `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `kardex`
--
ALTER TABLE `kardex`
  ADD PRIMARY KEY (`id`),
  ADD KEY `kardex_id_usuario_foreign` (`id_usuario`),
  ADD KEY `kardex_id_producto_fecha_movimiento_index` (`id_producto`,`fecha_movimiento`),
  ADD KEY `kardex_tipo_movimiento_index` (`tipo_movimiento`);

--
-- Indices de la tabla `mantenimiento`
--
ALTER TABLE `mantenimiento`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_mantenimiento_equipo` (`id_equipo`),
  ADD KEY `fk_mantenimiento_act` (`id_actmanten`),
  ADD KEY `mantenimiento_id_programacion_foreign` (`id_programacion`);

--
-- Indices de la tabla `mantenimiento_vehiculo`
--
ALTER TABLE `mantenimiento_vehiculo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mantenimiento_vehiculo_id_programacion_foreign` (`id_programacion`),
  ADD KEY `mantenimiento_vehiculo_id_vehiculo_foreign` (`id_vehiculo`);

--
-- Indices de la tabla `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

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
-- Indices de la tabla `ordenes_compra`
--
ALTER TABLE `ordenes_compra`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ordenes_compra_numero_orden_compra_unique` (`numero_orden_compra`),
  ADD KEY `ordenes_compra_id_usuario_foreign` (`id_usuario`),
  ADD KEY `ordenes_compra_estado_fecha_compra_index` (`estado`,`fecha_compra`),
  ADD KEY `ordenes_compra_id_proveedor_index` (`id_proveedor`);

--
-- Indices de la tabla `orden_asesoria`
--
ALTER TABLE `orden_asesoria`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orden_asesoria_numero_orden_unique` (`numero_orden`),
  ADD UNIQUE KEY `orden_asesoria_id_cotizacion_unique` (`id_cotizacion`),
  ADD KEY `orden_asesoria_id_cliente_index` (`id_cliente`),
  ADD KEY `orden_asesoria_id_servicio_index` (`id_servicio`),
  ADD KEY `orden_asesoria_estado_index` (`estado`),
  ADD KEY `orden_asesoria_fecha_servicio_index` (`fecha_servicio`),
  ADD KEY `orden_asesoria_id_cliente_planta_foreign` (`id_cliente_planta`),
  ADD KEY `orden_asesoria_id_cliente_planta_area_foreign` (`id_cliente_planta_area`);

--
-- Indices de la tabla `orden_asesoria_exponentes`
--
ALTER TABLE `orden_asesoria_exponentes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_orden_asesoria_exponente` (`id_orden_asesoria`,`id_exponente`);

--
-- Indices de la tabla `orden_capacitacion_auditoria`
--
ALTER TABLE `orden_capacitacion_auditoria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_oca_cot` (`id_cotizacion`),
  ADD KEY `fk_oca_cli` (`id_cliente`),
  ADD KEY `fk_oca_ser` (`id_servicio`),
  ADD KEY `fk_oca_pon` (`id_ponente`),
  ADD KEY `orden_capacitacion_auditoria_id_exponente_foreign` (`id_exponente`);

--
-- Indices de la tabla `orden_capacitacion_ponentes`
--
ALTER TABLE `orden_capacitacion_ponentes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `oc_ponentes_orden_ponente_unique` (`id_orden_capacitacion`,`id_ponente`),
  ADD KEY `orden_capacitacion_ponentes_id_ponente_foreign` (`id_ponente`),
  ADD KEY `orden_capacitacion_ponentes_id_exponente_foreign` (`id_exponente`);

--
-- Indices de la tabla `orden_fabricacion`
--
ALTER TABLE `orden_fabricacion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orden_fabricacion_codigo_unique` (`codigo`),
  ADD KEY `idx_of_fecha_estado` (`fecha_orden`,`estado`);

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
-- Indices de la tabla `orden_servicio_equipo`
--
ALTER TABLE `orden_servicio_equipo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ose_orden_equipo_planta_area_unique` (`id_orden_servicio`,`id_servicio`,`id_equipo`,`id_cliente_planta`,`id_cliente_planta_area`),
  ADD KEY `orden_servicio_equipo_id_equipo_foreign` (`id_equipo`),
  ADD KEY `ose_servicio_fk` (`id_servicio`),
  ADD KEY `ose_id_orden_servicio_index` (`id_orden_servicio`),
  ADD KEY `orden_servicio_equipo_id_cliente_planta_foreign` (`id_cliente_planta`),
  ADD KEY `orden_servicio_equipo_id_cliente_planta_area_foreign` (`id_cliente_planta_area`);

--
-- Indices de la tabla `orden_servicio_producto`
--
ALTER TABLE `orden_servicio_producto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orden_servicio_producto_id_orden_servicio_foreign` (`id_orden_servicio`),
  ADD KEY `orden_servicio_producto_id_producto_foreign` (`id_producto`),
  ADD KEY `osp_servicio_fk` (`id_servicio`),
  ADD KEY `orden_servicio_producto_id_cliente_planta_foreign` (`id_cliente_planta`),
  ADD KEY `orden_servicio_producto_id_cliente_planta_area_foreign` (`id_cliente_planta_area`),
  ADD KEY `orden_servicio_producto_id_equipo_foreign` (`id_equipo`);

--
-- Indices de la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indices de la tabla `personal`
--
ALTER TABLE `personal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_personal_area` (`id_area`);

--
-- Indices de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `productos_sku_unique` (`sku`),
  ADD KEY `fk_productos_categoria` (`id_categoria`);

--
-- Indices de la tabla `producto_receta_detalle`
--
ALTER TABLE `producto_receta_detalle`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_producto_receta_final_insumo` (`id_producto_final`,`id_producto_insumo`),
  ADD KEY `producto_receta_detalle_id_producto_insumo_foreign` (`id_producto_insumo`);

--
-- Indices de la tabla `programacion_asesoria`
--
ALTER TABLE `programacion_asesoria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prog_asesoria_orden_fecha` (`id_orden_asesoria`,`fecha_programada`);

--
-- Indices de la tabla `programacion_asesoria_exponentes`
--
ALTER TABLE `programacion_asesoria_exponentes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_prog_ase_exponente` (`id_programacion_asesoria`,`id_exponente`),
  ADD KEY `idx_prog_ase_exp_prog` (`id_programacion_asesoria`),
  ADD KEY `idx_prog_ase_exp_exp` (`id_exponente`);

--
-- Indices de la tabla `programacion_capacitacion`
--
ALTER TABLE `programacion_capacitacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prog_cap_orden_fecha` (`id_orden_capacitacion`,`fecha_programada`);

--
-- Indices de la tabla `programacion_capacitacion_exponentes`
--
ALTER TABLE `programacion_capacitacion_exponentes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_prog_cap_exponente` (`id_programacion_capacitacion`,`id_exponente`),
  ADD KEY `idx_prog_cap_exp_prog` (`id_programacion_capacitacion`),
  ADD KEY `idx_prog_cap_exp_exp` (`id_exponente`);

--
-- Indices de la tabla `programacion_exponentes`
--
ALTER TABLE `programacion_exponentes`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `programacion_fabricacion`
--
ALTER TABLE `programacion_fabricacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prog_fabricacion_fecha_estado` (`fecha_programada`,`estado_ejecucion`),
  ADD KEY `idx_prog_fabricacion_tecnico` (`id_tecnico_asignado`),
  ADD KEY `idx_prog_fabricacion_of` (`id_orden_fabricacion`);

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
-- Indices de la tabla `programacion_mantenimiento`
--
ALTER TABLE `programacion_mantenimiento`
  ADD PRIMARY KEY (`id`),
  ADD KEY `programacion_mantenimiento_id_equipo_foreign` (`id_equipo`),
  ADD KEY `programacion_mantenimiento_id_actmanten_foreign` (`id_actmanten`);

--
-- Indices de la tabla `programacion_mantenimiento_vehiculo`
--
ALTER TABLE `programacion_mantenimiento_vehiculo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `programacion_mantenimiento_vehiculo_id_vehiculo_foreign` (`id_vehiculo`);

--
-- Indices de la tabla `programacion_notificaciones`
--
ALTER TABLE `programacion_notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notif_prog` (`id_programacion`);

--
-- Indices de la tabla `programacion_otros`
--
ALTER TABLE `programacion_otros`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prog_otros_fecha_estado` (`fecha_programada`,`estado_ejecucion`),
  ADD KEY `idx_prog_otros_tecnico` (`id_tecnico_asignado`);

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
  ADD KEY `fk_prog_veh` (`id_vehiculo`),
  ADD KEY `fk_prog_creador` (`creado_por`),
  ADD KEY `fk_prog_modificador` (`modificado_por`),
  ADD KEY `idx_prog_estado` (`estado_ejecucion`),
  ADD KEY `idx_prog_fecha_estado` (`fecha_programada`,`estado_ejecucion`),
  ADD KEY `programacion_servicio_id_cliente_planta_foreign` (`id_cliente_planta`),
  ADD KEY `idx_prog_serv_requiere_recursos` (`requiere_asignacion_recursos`);

--
-- Indices de la tabla `programacion_tecnicos`
--
ALTER TABLE `programacion_tecnicos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `programacion_tecnicos_id_programacion_id_tecnico_unique` (`id_programacion`,`id_tecnico`),
  ADD KEY `programacion_tecnicos_id_tecnico_foreign` (`id_tecnico`);

--
-- Indices de la tabla `programacion_visita`
--
ALTER TABLE `programacion_visita`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prog_visita_cliente_fecha` (`id_cliente`,`fecha_programada`),
  ADD KEY `idx_prog_visita_tecnico` (`id_tecnico_asignado`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `proveedores_ruc_unique` (`ruc`),
  ADD KEY `proveedores_estado_index` (`estado`),
  ADD KEY `proveedores_razon_social_index` (`razon_social`);

--
-- Indices de la tabla `proyecciones`
--
ALTER TABLE `proyecciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_proyeccion_multicim` (`id_multicim`),
  ADD KEY `fk_proyeccion_os` (`id_orden_servicio`),
  ADD KEY `fk_proyeccion_op` (`id_orden_producto`),
  ADD KEY `fk_proyeccion_oca` (`id_orden_capacitacion_auditoria`);

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
-- Indices de la tabla `servicio_producto`
--
ALTER TABLE `servicio_producto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sp_servicio_producto_equipo_unique` (`id_servicio`,`id_producto`,`id_equipo`),
  ADD KEY `servicio_producto_id_producto_foreign` (`id_producto`),
  ADD KEY `servicio_producto_id_equipo_foreign` (`id_equipo`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indices de la tabla `tecnicos`
--
ALTER TABLE `tecnicos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD UNIQUE KEY `uq_tecnicos_exponente_vinculado` (`id_exponente_vinculado`),
  ADD KEY `idx_tecnico_estado` (`estado`);

--
-- Indices de la tabla `tecnico_disponibilidad`
--
ALTER TABLE `tecnico_disponibilidad`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_tecnico_fecha` (`id_tecnico`,`fecha`),
  ADD KEY `fk_disp_creador` (`creado_por`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `area`
--
ALTER TABLE `area`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `caja_chica`
--
ALTER TABLE `caja_chica`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cargo`
--
ALTER TABLE `cargo`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `catalogo_capacitacion_auditoria`
--
ALTER TABLE `catalogo_capacitacion_auditoria`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `cliente_planta`
--
ALTER TABLE `cliente_planta`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `cliente_planta_area`
--
ALTER TABLE `cliente_planta_area`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `cotizacion`
--
ALTER TABLE `cotizacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `cotizacion_beneficio`
--
ALTER TABLE `cotizacion_beneficio`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cotizacion_detalle`
--
ALTER TABLE `cotizacion_detalle`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `detalle_entrada_devolucion_fabricacion`
--
ALTER TABLE `detalle_entrada_devolucion_fabricacion`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `detalle_entrega_epp`
--
ALTER TABLE `detalle_entrega_epp`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `detalle_ordenes_compra`
--
ALTER TABLE `detalle_ordenes_compra`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_orden_asesoria`
--
ALTER TABLE `detalle_orden_asesoria`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_orden_capacitacion_equipos`
--
ALTER TABLE `detalle_orden_capacitacion_equipos`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_orden_capacitacion_materiales`
--
ALTER TABLE `detalle_orden_capacitacion_materiales`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_orden_fabricacion`
--
ALTER TABLE `detalle_orden_fabricacion`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `detalle_orden_producto`
--
ALTER TABLE `detalle_orden_producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `detalle_orden_servicio`
--
ALTER TABLE `detalle_orden_servicio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `entrada_devolucion_fabricacion`
--
ALTER TABLE `entrada_devolucion_fabricacion`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `entrega_epp`
--
ALTER TABLE `entrega_epp`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `equipo`
--
ALTER TABLE `equipo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `exponentes`
--
ALTER TABLE `exponentes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `inventario_ajustes`
--
ALTER TABLE `inventario_ajustes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `kardex`
--
ALTER TABLE `kardex`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=98;

--
-- AUTO_INCREMENT de la tabla `mantenimiento`
--
ALTER TABLE `mantenimiento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `mantenimiento_vehiculo`
--
ALTER TABLE `mantenimiento_vehiculo`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `multicim`
--
ALTER TABLE `multicim`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
-- AUTO_INCREMENT de la tabla `ordenes_compra`
--
ALTER TABLE `ordenes_compra`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `orden_asesoria`
--
ALTER TABLE `orden_asesoria`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `orden_asesoria_exponentes`
--
ALTER TABLE `orden_asesoria_exponentes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `orden_capacitacion_auditoria`
--
ALTER TABLE `orden_capacitacion_auditoria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `orden_capacitacion_ponentes`
--
ALTER TABLE `orden_capacitacion_ponentes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `orden_fabricacion`
--
ALTER TABLE `orden_fabricacion`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `orden_producto`
--
ALTER TABLE `orden_producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `orden_servicio`
--
ALTER TABLE `orden_servicio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `orden_servicio_equipo`
--
ALTER TABLE `orden_servicio_equipo`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `orden_servicio_producto`
--
ALTER TABLE `orden_servicio_producto`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de la tabla `personal`
--
ALTER TABLE `personal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `producto_receta_detalle`
--
ALTER TABLE `producto_receta_detalle`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `programacion_asesoria`
--
ALTER TABLE `programacion_asesoria`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programacion_asesoria_exponentes`
--
ALTER TABLE `programacion_asesoria_exponentes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programacion_capacitacion`
--
ALTER TABLE `programacion_capacitacion`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programacion_capacitacion_exponentes`
--
ALTER TABLE `programacion_capacitacion_exponentes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programacion_exponentes`
--
ALTER TABLE `programacion_exponentes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programacion_fabricacion`
--
ALTER TABLE `programacion_fabricacion`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `programacion_historial`
--
ALTER TABLE `programacion_historial`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programacion_insumos`
--
ALTER TABLE `programacion_insumos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `programacion_mantenimiento`
--
ALTER TABLE `programacion_mantenimiento`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `programacion_mantenimiento_vehiculo`
--
ALTER TABLE `programacion_mantenimiento_vehiculo`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programacion_notificaciones`
--
ALTER TABLE `programacion_notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programacion_otros`
--
ALTER TABLE `programacion_otros`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programacion_servicio`
--
ALTER TABLE `programacion_servicio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `programacion_tecnicos`
--
ALTER TABLE `programacion_tecnicos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `programacion_visita`
--
ALTER TABLE `programacion_visita`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `proyecciones`
--
ALTER TABLE `proyecciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rrhh_asistencia`
--
ALTER TABLE `rrhh_asistencia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `rrhh_horarios`
--
ALTER TABLE `rrhh_horarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT de la tabla `rrhh_justificaciones`
--
ALTER TABLE `rrhh_justificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `servicios`
--
ALTER TABLE `servicios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `servicio_producto`
--
ALTER TABLE `servicio_producto`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tecnicos`
--
ALTER TABLE `tecnicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `tecnico_disponibilidad`
--
ALTER TABLE `tecnico_disponibilidad`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cliente_planta`
--
ALTER TABLE `cliente_planta`
  ADD CONSTRAINT `cliente_planta_id_cliente_foreign` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `cliente_planta_area`
--
ALTER TABLE `cliente_planta_area`
  ADD CONSTRAINT `cliente_planta_area_id_cliente_planta_foreign` FOREIGN KEY (`id_cliente_planta`) REFERENCES `cliente_planta` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `cotizacion`
--
ALTER TABLE `cotizacion`
  ADD CONSTRAINT `fk_cot_cli` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`),
  ADD CONSTRAINT `fk_cot_per` FOREIGN KEY (`id_personal_creador`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_cotizacion_multicim` FOREIGN KEY (`id_multicim`) REFERENCES `multicim` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `cotizacion_beneficio`
--
ALTER TABLE `cotizacion_beneficio`
  ADD CONSTRAINT `cotizacion_beneficio_id_catalogo_cap_aud_foreign` FOREIGN KEY (`id_catalogo_cap_aud`) REFERENCES `catalogo_capacitacion_auditoria` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cotizacion_beneficio_id_cotizacion_foreign` FOREIGN KEY (`id_cotizacion`) REFERENCES `cotizacion` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `cotizacion_detalle`
--
ALTER TABLE `cotizacion_detalle`
  ADD CONSTRAINT `cotizacion_detalle_id_catalogo_cap_aud_foreign` FOREIGN KEY (`id_catalogo_cap_aud`) REFERENCES `catalogo_capacitacion_auditoria` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cotizacion_detalle_id_cliente_planta_foreign` FOREIGN KEY (`id_cliente_planta`) REFERENCES `cliente_planta` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_det_cot_orig` FOREIGN KEY (`id_cotizacion`) REFERENCES `cotizacion` (`id`),
  ADD CONSTRAINT `fk_det_cot_pro` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`),
  ADD CONSTRAINT `fk_det_cot_ser` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id`);

--
-- Filtros para la tabla `detalle_entrada_devolucion_fabricacion`
--
ALTER TABLE `detalle_entrada_devolucion_fabricacion`
  ADD CONSTRAINT `fk_det_efd_header` FOREIGN KEY (`id_entrada_devolucion_fabricacion`) REFERENCES `entrada_devolucion_fabricacion` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_det_efd_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `detalle_entrega_epp`
--
ALTER TABLE `detalle_entrega_epp`
  ADD CONSTRAINT `detalle_entrega_epp_id_entrega_epp_foreign` FOREIGN KEY (`id_entrega_epp`) REFERENCES `entrega_epp` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_entrega_epp_id_entrega_reemplazo_foreign` FOREIGN KEY (`id_entrega_reemplazo`) REFERENCES `entrega_epp` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `detalle_entrega_epp_id_producto_foreign` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `detalle_ordenes_compra`
--
ALTER TABLE `detalle_ordenes_compra`
  ADD CONSTRAINT `detalle_ordenes_compra_id_orden_compra_foreign` FOREIGN KEY (`id_orden_compra`) REFERENCES `ordenes_compra` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_ordenes_compra_id_producto_foreign` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `detalle_orden_fabricacion`
--
ALTER TABLE `detalle_orden_fabricacion`
  ADD CONSTRAINT `fk_det_of_orden` FOREIGN KEY (`id_orden_fabricacion`) REFERENCES `orden_fabricacion` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_det_of_producto` FOREIGN KEY (`id_producto_final`) REFERENCES `productos` (`id`);

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
  ADD CONSTRAINT `detalle_orden_servicio_id_cliente_planta_foreign` FOREIGN KEY (`id_cliente_planta`) REFERENCES `cliente_planta` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_dos_os` FOREIGN KEY (`id_orden_servicio`) REFERENCES `orden_servicio` (`id`),
  ADD CONSTRAINT `fk_dos_ser` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id`);

--
-- Filtros para la tabla `entrada_devolucion_fabricacion`
--
ALTER TABLE `entrada_devolucion_fabricacion`
  ADD CONSTRAINT `fk_efd_orden` FOREIGN KEY (`id_orden_fabricacion`) REFERENCES `orden_fabricacion` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_efd_programacion` FOREIGN KEY (`id_programacion_fabricacion`) REFERENCES `programacion_fabricacion` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `entrega_epp`
--
ALTER TABLE `entrega_epp`
  ADD CONSTRAINT `entrega_epp_devuelto_por_foreign` FOREIGN KEY (`devuelto_por`) REFERENCES `personal` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `entrega_epp_id_tecnico_foreign` FOREIGN KEY (`id_tecnico`) REFERENCES `tecnicos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `entrega_epp_registrado_por_foreign` FOREIGN KEY (`registrado_por`) REFERENCES `personal` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD CONSTRAINT `fk_inventario_productos` FOREIGN KEY (`id_productos`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `kardex`
--
ALTER TABLE `kardex`
  ADD CONSTRAINT `kardex_id_producto_foreign` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `kardex_id_usuario_foreign` FOREIGN KEY (`id_usuario`) REFERENCES `personal` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `mantenimiento`
--
ALTER TABLE `mantenimiento`
  ADD CONSTRAINT `fk_mantenimiento_act` FOREIGN KEY (`id_actmanten`) REFERENCES `actividades_mantenieminto` (`id`),
  ADD CONSTRAINT `fk_mantenimiento_equipo` FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id`),
  ADD CONSTRAINT `mantenimiento_id_programacion_foreign` FOREIGN KEY (`id_programacion`) REFERENCES `programacion_mantenimiento` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `mantenimiento_vehiculo`
--
ALTER TABLE `mantenimiento_vehiculo`
  ADD CONSTRAINT `mantenimiento_vehiculo_id_programacion_foreign` FOREIGN KEY (`id_programacion`) REFERENCES `programacion_mantenimiento_vehiculo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mantenimiento_vehiculo_id_vehiculo_foreign` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculos` (`id`);

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
-- Filtros para la tabla `ordenes_compra`
--
ALTER TABLE `ordenes_compra`
  ADD CONSTRAINT `ordenes_compra_id_proveedor_foreign` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id`),
  ADD CONSTRAINT `ordenes_compra_id_usuario_foreign` FOREIGN KEY (`id_usuario`) REFERENCES `personal` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `orden_asesoria`
--
ALTER TABLE `orden_asesoria`
  ADD CONSTRAINT `orden_asesoria_id_cliente_planta_area_foreign` FOREIGN KEY (`id_cliente_planta_area`) REFERENCES `cliente_planta_area` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orden_asesoria_id_cliente_planta_foreign` FOREIGN KEY (`id_cliente_planta`) REFERENCES `cliente_planta` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `orden_capacitacion_auditoria`
--
ALTER TABLE `orden_capacitacion_auditoria`
  ADD CONSTRAINT `fk_oca_cli` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`),
  ADD CONSTRAINT `fk_oca_cot` FOREIGN KEY (`id_cotizacion`) REFERENCES `cotizacion` (`id`),
  ADD CONSTRAINT `fk_oca_ser` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id`);

--
-- Filtros para la tabla `orden_capacitacion_ponentes`
--
ALTER TABLE `orden_capacitacion_ponentes`
  ADD CONSTRAINT `orden_capacitacion_ponentes_id_exponente_foreign` FOREIGN KEY (`id_exponente`) REFERENCES `exponentes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orden_capacitacion_ponentes_id_orden_capacitacion_foreign` FOREIGN KEY (`id_orden_capacitacion`) REFERENCES `orden_capacitacion_auditoria` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orden_capacitacion_ponentes_id_ponente_foreign` FOREIGN KEY (`id_ponente`) REFERENCES `personal` (`id`) ON DELETE CASCADE;

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
-- Filtros para la tabla `orden_servicio_equipo`
--
ALTER TABLE `orden_servicio_equipo`
  ADD CONSTRAINT `orden_servicio_equipo_id_cliente_planta_area_foreign` FOREIGN KEY (`id_cliente_planta_area`) REFERENCES `cliente_planta_area` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orden_servicio_equipo_id_cliente_planta_foreign` FOREIGN KEY (`id_cliente_planta`) REFERENCES `cliente_planta` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orden_servicio_equipo_id_equipo_foreign` FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orden_servicio_equipo_id_orden_servicio_foreign` FOREIGN KEY (`id_orden_servicio`) REFERENCES `orden_servicio` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ose_servicio_fk` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `orden_servicio_producto`
--
ALTER TABLE `orden_servicio_producto`
  ADD CONSTRAINT `orden_servicio_producto_id_cliente_planta_area_foreign` FOREIGN KEY (`id_cliente_planta_area`) REFERENCES `cliente_planta_area` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orden_servicio_producto_id_cliente_planta_foreign` FOREIGN KEY (`id_cliente_planta`) REFERENCES `cliente_planta` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orden_servicio_producto_id_equipo_foreign` FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orden_servicio_producto_id_orden_servicio_foreign` FOREIGN KEY (`id_orden_servicio`) REFERENCES `orden_servicio` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orden_servicio_producto_id_producto_foreign` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `osp_servicio_fk` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id`) ON DELETE SET NULL;

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
-- Filtros para la tabla `producto_receta_detalle`
--
ALTER TABLE `producto_receta_detalle`
  ADD CONSTRAINT `producto_receta_detalle_id_producto_final_foreign` FOREIGN KEY (`id_producto_final`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `producto_receta_detalle_id_producto_insumo_foreign` FOREIGN KEY (`id_producto_insumo`) REFERENCES `productos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `programacion_fabricacion`
--
ALTER TABLE `programacion_fabricacion`
  ADD CONSTRAINT `fk_prog_fabricacion_of` FOREIGN KEY (`id_orden_fabricacion`) REFERENCES `orden_fabricacion` (`id`) ON DELETE SET NULL;

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
-- Filtros para la tabla `programacion_mantenimiento`
--
ALTER TABLE `programacion_mantenimiento`
  ADD CONSTRAINT `programacion_mantenimiento_id_actmanten_foreign` FOREIGN KEY (`id_actmanten`) REFERENCES `actividades_mantenieminto` (`id`),
  ADD CONSTRAINT `programacion_mantenimiento_id_equipo_foreign` FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id`);

--
-- Filtros para la tabla `programacion_mantenimiento_vehiculo`
--
ALTER TABLE `programacion_mantenimiento_vehiculo`
  ADD CONSTRAINT `programacion_mantenimiento_vehiculo_id_vehiculo_foreign` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculos` (`id`);

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
  ADD CONSTRAINT `fk_prog_tec` FOREIGN KEY (`id_tecnico_asignado`) REFERENCES `tecnicos` (`id`),
  ADD CONSTRAINT `fk_prog_veh` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculos` (`id`),
  ADD CONSTRAINT `programacion_servicio_id_cliente_planta_foreign` FOREIGN KEY (`id_cliente_planta`) REFERENCES `cliente_planta` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `programacion_tecnicos`
--
ALTER TABLE `programacion_tecnicos`
  ADD CONSTRAINT `programacion_tecnicos_id_programacion_foreign` FOREIGN KEY (`id_programacion`) REFERENCES `programacion_servicio` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `programacion_tecnicos_id_tecnico_foreign` FOREIGN KEY (`id_tecnico`) REFERENCES `tecnicos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `proyecciones`
--
ALTER TABLE `proyecciones`
  ADD CONSTRAINT `fk_proyeccion_multicim` FOREIGN KEY (`id_multicim`) REFERENCES `multicim` (`id`),
  ADD CONSTRAINT `fk_proyeccion_oca` FOREIGN KEY (`id_orden_capacitacion_auditoria`) REFERENCES `orden_capacitacion_auditoria` (`id`),
  ADD CONSTRAINT `fk_proyeccion_op` FOREIGN KEY (`id_orden_producto`) REFERENCES `orden_producto` (`id`),
  ADD CONSTRAINT `fk_proyeccion_os` FOREIGN KEY (`id_orden_servicio`) REFERENCES `orden_servicio` (`id`);

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
-- Filtros para la tabla `servicio_producto`
--
ALTER TABLE `servicio_producto`
  ADD CONSTRAINT `servicio_producto_id_equipo_foreign` FOREIGN KEY (`id_equipo`) REFERENCES `equipo` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `servicio_producto_id_producto_foreign` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `servicio_producto_id_servicio_foreign` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id`) ON DELETE CASCADE;

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
