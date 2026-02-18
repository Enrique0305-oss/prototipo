-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 17-02-2026 a las 18:55:35
-- Versión del servidor: 8.0.44
-- Versión de PHP: 8.4.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sfumigacion`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actividades_mantenieminto`
--

CREATE TABLE `actividades_mantenieminto` (
  `id` int NOT NULL,
  `categoria` enum('Programado','Entregado','Garantia') DEFAULT NULL,
  `estado` enum('Activo','Desactivo') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `actividades_mantenieminto`
--

INSERT INTO `actividades_mantenieminto` (`id`, `categoria`, `estado`) VALUES
(1, 'Programado', 'Activo'),
(2, 'Garantia', 'Activo'),
(3, 'Entregado', 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `area`
--

CREATE TABLE `area` (
  `id` int NOT NULL,
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
(5, 'Finanzas', 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `caja_chica`
--

CREATE TABLE `caja_chica` (
  `id` int NOT NULL,
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
-- Estructura de tabla para la tabla `catalogo_capacitacion_auditoria`
--

CREATE TABLE `catalogo_capacitacion_auditoria` (
  `id` bigint UNSIGNED NOT NULL,
  `tipo` enum('Capacitación','Auditoría') COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `precio_referencial` decimal(10,2) DEFAULT NULL,
  `duracion_horas` int DEFAULT NULL,
  `estado` enum('activo','inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `catalogo_capacitacion_auditoria`
--

INSERT INTO `catalogo_capacitacion_auditoria` (`id`, `tipo`, `nombre`, `descripcion`, `precio_referencial`, `duracion_horas`, `estado`) VALUES
(1, 'Capacitación', 'Manejo Integrado de Plagas', 'Capacitación sobre control y prevención de plagas urbanas', 850.00, 4, 'activo'),
(2, 'Capacitación', 'Seguridad y Salud Ocupacional', 'Normativa SST y buenas prácticas en el trabajo', 600.00, 3, 'activo'),
(3, 'Auditoría', 'Auditoría HACCP', 'Auditoría del sistema de análisis de peligros y puntos críticos de control', 1200.00, 8, 'activo'),
(4, 'Auditoría', 'Auditoría BPM', 'Auditoría de buenas prácticas de manufactura', 950.00, 6, 'activo'),
(5, 'Capacitación', 'Uso Correcto de EPPs', 'Equipos de protección personal: selección, uso y mantenimiento', 450.00, 2, 'activo'),
(6, 'Capacitación', 'Prueba', 'Prueba', 50.00, 2, 'inactivo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `estado` enum('Activo','Inactivo') DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id`, `nombre`, `descripcion`, `estado`) VALUES
(1, 'Insecticidas', 'Productos para control de insectos', 'Activo'),
(2, 'Rodenticidas', 'Productos para control de roedores', 'Activo'),
(3, 'Equipos', 'Equipos de fumigación', 'Activo'),
(4, 'EPP', 'Equipos de protección personal', 'Activo'),
(5, 'Prueba', 'Pruebita 2.0', 'Inactivo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `id` int NOT NULL,
  `nombre_empresa` varchar(100) NOT NULL,
  `ruc` char(11) NOT NULL,
  `rubro` varchar(150) NOT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `persona_contacto` varchar(100) DEFAULT NULL,
  `telefono_contacto` varchar(20) DEFAULT NULL,
  `origen` varchar(50) DEFAULT NULL,
  `fecha_registro` date DEFAULT NULL,
  `estado` enum('Acepta','No acepta','Contactado') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'Contactado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`id`, `nombre_empresa`, `ruc`, `rubro`, `direccion`, `persona_contacto`, `telefono_contacto`, `origen`, `fecha_registro`, `estado`) VALUES
(1, 'Restaurante El Buen Sabor', '20456789123', 'Alimenticio', 'Jr. Comercio 456, Lima', NULL, NULL, NULL, NULL, 'Contactado'),
(2, 'Hotel Plaza', '20987654321', 'Hotelería', 'Av. Arequipa 1234, Lima', 'Nose', '987654321', 'Redes sociales', NULL, 'Acepta'),
(3, 'Supermercado MegaMax', '20123456789', 'Retail', 'Av. Javier Prado 890, Lima', 'Nose', '987654321', 'Referido', NULL, 'Acepta'),
(4, 'Clínica San José', '20555666777', 'Salud', 'Jr. Salud 123, Lima', 'Nose', '321654987', 'Referido', NULL, 'Contactado'),
(5, 'Colegio Santa María', '20999888777', 'Educación', 'Av. Educación 567, Lima', NULL, NULL, NULL, NULL, 'No acepta'),
(9, 'Grupo Textil Lima', '12345678914', 'Industria Textil', 'Jr. Salud 123, Lima', 'Nose', '987654321', 'Web', '2026-02-12', 'Acepta');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cotizacion`
--

CREATE TABLE `cotizacion` (
  `id` int NOT NULL,
  `numero_cotizacion` varchar(20) NOT NULL,
  `id_cliente` int NOT NULL,
  `fecha_emision` date NOT NULL,
  `id_personal_creador` int NOT NULL,
  `estado` enum('Pendiente','Aceptada','Rechazada') DEFAULT 'Pendiente',
  `tipo_cotizacion` enum('Servicio','Producto','Capacitacion') NOT NULL,
  `incluye_igv` tinyint(1) NOT NULL DEFAULT '1',
  `subtotal` decimal(10,2) DEFAULT NULL,
  `igv` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `observaciones` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `cotizacion`
--

INSERT INTO `cotizacion` (`id`, `numero_cotizacion`, `id_cliente`, `fecha_emision`, `id_personal_creador`, `estado`, `tipo_cotizacion`, `incluye_igv`, `subtotal`, `igv`, `total`, `observaciones`) VALUES
(2, 'COT-2026-001', 3, '2026-02-08', 1, 'Aceptada', 'Producto', 1, 2355.00, 423.90, 2778.90, NULL),
(3, 'COT-2026-002', 1, '2026-02-08', 1, 'Aceptada', 'Servicio', 1, 1500.00, 270.00, 1770.00, NULL),
(4, 'COT-2026-003', 5, '2026-02-08', 1, 'Aceptada', 'Capacitacion', 1, 3500.00, 630.00, 4130.00, NULL),
(5, 'COT-2026-004', 9, '2026-02-12', 1, 'Aceptada', 'Servicio', 0, 350.00, 0.00, 350.00, 'Esta cotización no incluye IGV.'),
(6, 'COT-2026-005', 9, '2026-02-12', 1, 'Aceptada', 'Servicio', 1, 150.00, 27.00, 177.00, NULL),
(7, 'COT-2026-006', 9, '2026-02-12', 1, 'Rechazada', 'Servicio', 1, 300.00, 54.00, 354.00, NULL),
(8, 'COT-2026-007', 9, '2026-02-12', 1, 'Aceptada', 'Servicio', 0, 330.00, 0.00, 330.00, 'Esta cotización no incluye IGV.'),
(9, 'COT-2026-008', 9, '2026-02-16', 1, 'Aceptada', 'Servicio', 0, 500.00, 0.00, 500.00, 'Esta cotización no incluye IGV.'),
(10, 'COT-2026-009', 2, '2026-02-16', 1, 'Aceptada', 'Producto', 0, 100.00, 0.00, 100.00, 'Esta cotización no incluye IGV.'),
(11, 'COT-2026-010', 9, '2026-02-16', 1, 'Aceptada', 'Producto', 0, 50.00, 0.00, 50.00, 'Esta cotización no incluye IGV.'),
(12, 'COT-2026-011', 2, '2026-02-16', 1, 'Aceptada', 'Capacitacion', 0, 600.00, 0.00, 600.00, 'Esta cotización no incluye IGV.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cotizacion_detalle`
--

CREATE TABLE `cotizacion_detalle` (
  `id` int NOT NULL,
  `id_cotizacion` int NOT NULL,
  `id_servicio` int DEFAULT NULL,
  `id_producto` int DEFAULT NULL,
  `id_catalogo_cap_aud` bigint UNSIGNED DEFAULT NULL,
  `descripcion_manual` varchar(255) DEFAULT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `frecuencia_sugerida` varchar(100) DEFAULT NULL,
  `modalidad_sugerida` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `cotizacion_detalle`
--

INSERT INTO `cotizacion_detalle` (`id`, `id_cotizacion`, `id_servicio`, `id_producto`, `id_catalogo_cap_aud`, `descripcion_manual`, `cantidad`, `precio_unitario`, `frecuencia_sugerida`, `modalidad_sugerida`) VALUES
(3, 2, NULL, 1, NULL, NULL, 10, 85.50, NULL, NULL),
(4, 2, NULL, 2, NULL, NULL, 5, 120.00, NULL, NULL),
(5, 2, NULL, 3, NULL, NULL, 20, 45.00, NULL, NULL),
(6, 3, 1, NULL, NULL, 'Fumigación completa del local', 1, 850.00, 'Mensual', 'Presencial'),
(7, 3, 3, NULL, NULL, 'Desratización de almacenes', 1, 650.00, 'Trimestral', 'Presencial'),
(8, 4, 5, NULL, NULL, 'Capacitación HACCP para 25 personas', 1, 3500.00, 'Una vez', 'Presencial'),
(9, 5, 3, NULL, NULL, 'Control y eliminación de roedores', 1, 150.00, 'Semanal', 'Presencial'),
(10, 5, 1, NULL, NULL, 'Servicio de fumigación para hogares', 1, 200.00, 'Quincenal', 'Presencial'),
(11, 6, 4, NULL, NULL, 'Control de insectos rastreros y voladores', 1, 150.00, 'Semanal', 'Presencial'),
(12, 7, 1, NULL, NULL, 'Servicio de fumigación para hogares', 1, 150.00, 'Semanal', 'Presencial'),
(13, 7, 4, NULL, NULL, 'Control de insectos rastreros y voladores', 1, 150.00, 'Quincenal', 'Presencial'),
(14, 8, 1, NULL, NULL, 'Servicio de fumigación para hogares', 1, 150.00, 'Semanal', 'Presencial'),
(15, 8, 4, NULL, NULL, 'Control de insectos rastreros y voladores', 1, 180.00, 'Quincenal', 'Presencial'),
(16, 9, 4, NULL, NULL, 'Control de insectos rastreros y voladores', 1, 500.00, 'Semanal', 'Presencial'),
(17, 10, NULL, 7, NULL, NULL, 1, 100.00, NULL, NULL),
(18, 11, NULL, 8, NULL, NULL, 1, 50.00, NULL, NULL),
(19, 12, NULL, NULL, 2, 'Normativa SST y buenas prácticas en el trabajo', 1, 600.00, 'Semanal', 'Virtual');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_orden_producto`
--

CREATE TABLE `detalle_orden_producto` (
  `id` int NOT NULL,
  `id_orden_producto` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `detalle_orden_producto`
--

INSERT INTO `detalle_orden_producto` (`id`, `id_orden_producto`, `id_producto`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
(2, 2, 7, 1, 100.00, 100.00),
(3, 2, 3, 1, 0.00, 0.00),
(4, 3, 8, 1, 50.00, 50.00),
(5, 3, 2, 1, 100.00, 100.00),
(6, 4, 1, 10, 85.50, 855.00),
(7, 4, 2, 5, 120.00, 600.00),
(8, 4, 3, 20, 45.00, 900.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_orden_servicio`
--

CREATE TABLE `detalle_orden_servicio` (
  `id` int NOT NULL,
  `id_orden_servicio` int NOT NULL,
  `id_servicio` int NOT NULL,
  `local` varchar(100) DEFAULT NULL,
  `frecuencia` varchar(100) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `detalle_orden_servicio`
--

INSERT INTO `detalle_orden_servicio` (`id`, `id_orden_servicio`, `id_servicio`, `local`, `frecuencia`, `precio`) VALUES
(1, 11, 1, 'Local Principal - Jr. Comercio 456', 'Mensual', 850.00),
(2, 12, 3, NULL, 'Semanal', 150.00),
(3, 12, 1, NULL, 'Quincenal', 200.00),
(4, 12, 4, NULL, 'Unica', 100.00),
(5, 13, 4, NULL, 'Semanal', 150.00),
(6, 14, 1, NULL, 'Semanal', 150.00),
(7, 14, 4, NULL, 'Quincenal', 180.00),
(8, 15, 4, NULL, 'Semanal', 500.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `equipo`
--

CREATE TABLE `equipo` (
  `id` int NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `marca` varchar(100) NOT NULL,
  `modelo` varchar(100) NOT NULL,
  `serie` int NOT NULL,
  `encargado` varchar(100) NOT NULL,
  `responsable` varchar(100) NOT NULL,
  `contacto` int NOT NULL,
  `estado` enum('Activo','Inactivo') DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `equipo`
--

INSERT INTO `equipo` (`id`, `descripcion`, `marca`, `modelo`, `serie`, `encargado`, `responsable`, `contacto`, `estado`) VALUES
(1, 'Fumigadora Industrial', 'Stihl', 'SR 450', 12345, 'Juan Pérez', 'María López', 987654325, 'Activo'),
(2, 'Fumigadora', 'Stihl', 'SR 470', 1025486, 'Juan Pérez', 'María López', 984677415, 'Inactivo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE `inventario` (
  `id` int NOT NULL,
  `id_productos` int DEFAULT NULL,
  `cantidad_disponible` int NOT NULL,
  `stock_seguridad` int NOT NULL,
  `Tipo` enum('Entrada','Salida') DEFAULT NULL,
  `Cantidad_total` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `inventario`
--

INSERT INTO `inventario` (`id`, `id_productos`, `cantidad_disponible`, `stock_seguridad`, `Tipo`, `Cantidad_total`) VALUES
(1, 1, 50, 10, 'Entrada', 50),
(2, 2, 30, 10, 'Entrada', 30),
(3, 3, 100, 20, 'Entrada', 100),
(4, 4, 5, 2, 'Entrada', 5),
(5, 5, 200, 50, 'Entrada', 200);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mantenimiento`
--

CREATE TABLE `mantenimiento` (
  `id` int NOT NULL,
  `id_equipo` int DEFAULT NULL,
  `id_actmanten` int DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `observaciones` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `mantenimiento`
--

INSERT INTO `mantenimiento` (`id`, `id_equipo`, `id_actmanten`, `fecha`, `observaciones`) VALUES
(1, 1, 1, '2026-02-09', 'Mantenimiento preventivo completado - equipo en óptimas condiciones'),
(3, 1, 1, '2026-03-15', 'Próximo mantenimiento programado'),
(4, 1, 1, '2026-02-20', ''),
(5, 1, 1, '2026-03-06', '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_02_07_075051_create_personal_access_tokens_table', 1),
(5, '2026_02_12_053309_add_sku_unidad_precio_to_productos_table', 2),
(6, '2026_02_12_200000_add_contacto_origen_to_cliente_table', 3),
(7, '2026_02_12_210000_add_igv_observaciones_to_cotizacion_table', 4),
(8, '2026_02_16_072301_add_igv_fields_to_orden_servicio_table', 5),
(9, '2026_02_16_031948_add_igv_fields_to_orden_producto_table', 6),
(10, '2026_02_16_185315_create_catalogo_capacitacion_auditoria_table', 7),
(11, '2026_02_16_211438_add_id_catalogo_cap_aud_to_cotizacion_detalle_table', 8),
(12, '2026_02_16_220426_make_id_servicio_nullable_on_orden_capacitacion_auditoria_table', 9),
(13, '2026_02_17_001012_add_aprobacion_to_orden_servicio_and_orden_producto_tables', 10),
(14, '2026_02_17_002349_rename_aprobacion_to_estado_in_order_tables', 11);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `multicim`
--

CREATE TABLE `multicim` (
  `id` int NOT NULL,
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
  `id` int NOT NULL,
  `n_ficha` varchar(20) NOT NULL,
  `id_programacion` int NOT NULL,
  `id_tecnico` int NOT NULL,
  `fecha_servicio` date NOT NULL,
  `hora_inicio_servicio` time DEFAULT NULL,
  `hora_fin_servicio` time DEFAULT NULL,
  `diagnostico_previo` text,
  `condicion_sanitaria` text,
  `observaciones_tecnicas` text,
  `acciones_realizadas` text,
  `fotos_evidencia` text,
  `firma_tecnico` varchar(255) DEFAULT NULL,
  `firma_cliente` varchar(255) DEFAULT NULL,
  `nombre_quien_recibe` varchar(100) DEFAULT NULL,
  `estado_servicio` enum('Completo','Parcial','Reprogramado','Cancelado') DEFAULT 'Completo',
  `recibida_oei` tinyint(1) DEFAULT '0',
  `recibida_por` int DEFAULT NULL,
  `fecha_recepcion` datetime DEFAULT NULL,
  `coincide_cronograma` tinyint(1) DEFAULT '1',
  `creado_por` int DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `modificado_por` int DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Fichas técnicas de servicios realizados';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oei_ficha_anexos`
--

CREATE TABLE `oei_ficha_anexos` (
  `id` int NOT NULL,
  `id_ficha` int NOT NULL,
  `tipo_anexo` enum('Plano','Foto','Documento','Otro') NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `ruta_archivo` varchar(255) NOT NULL,
  `fecha_carga` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Anexos adicionales de las fichas técnicas';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oei_ficha_monitoreo`
--

CREATE TABLE `oei_ficha_monitoreo` (
  `id` int NOT NULL,
  `id_ficha` int NOT NULL,
  `codigo_dispositivo` varchar(20) NOT NULL,
  `tipo_dispositivo` enum('Trampa de Luz','Cebadero','Trampa de Pegamento','Estación','Otro') DEFAULT 'Otro',
  `area_ubicacion` varchar(100) DEFAULT NULL,
  `animal_objetivo` varchar(50) DEFAULT NULL,
  `especimen` varchar(50) DEFAULT NULL,
  `hallazgo_cantidad` int DEFAULT '0',
  `estado_dispositivo` enum('Bueno','Regular','Dañado','Reemplazado') DEFAULT 'Bueno',
  `accion_tomada` varchar(255) DEFAULT NULL,
  `foto_evidencia` varchar(255) DEFAULT NULL,
  `observaciones` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Detalle de monitoreo para gráficos de tendencias';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oei_informe_detalle_fichas`
--

CREATE TABLE `oei_informe_detalle_fichas` (
  `id_informe` int NOT NULL,
  `id_ficha` int NOT NULL,
  `orden` int DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Relación entre informes y fichas incluidas';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `oei_informe_final`
--

CREATE TABLE `oei_informe_final` (
  `id` int NOT NULL,
  `codigo_informe` varchar(20) NOT NULL,
  `id_cliente` int NOT NULL,
  `mes_reportado` int NOT NULL,
  `anio_reportado` int NOT NULL,
  `periodo` varchar(7) GENERATED ALWAYS AS (concat(`anio_reportado`,_utf8mb4'-',lpad(`mes_reportado`,2,_utf8mb4'0'))) STORED,
  `fecha_emision` date DEFAULT NULL,
  `fecha_revision` date DEFAULT NULL,
  `fecha_aprobacion` date DEFAULT NULL,
  `fecha_envio_cliente` date DEFAULT NULL,
  `id_personal_elaboro` int NOT NULL,
  `id_personal_reviso` int DEFAULT NULL,
  `id_personal_aprobo` int DEFAULT NULL,
  `conclusiones_generales` text,
  `recomendaciones_cliente` text,
  `observaciones_revision` text,
  `estado_informe` enum('Borrador','En Revisión','Aprobado','Enviado','Rechazado') DEFAULT 'Borrador',
  `ruta_pdf_final` varchar(255) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `modificado_por` int DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Informes mensuales para clientes';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_capacitacion_auditoria`
--

CREATE TABLE `orden_capacitacion_auditoria` (
  `id` int NOT NULL,
  `numero_orden` varchar(20) NOT NULL,
  `id_cotizacion` int DEFAULT NULL,
  `id_cliente` int NOT NULL,
  `id_servicio` int DEFAULT NULL,
  `id_ponente` int NOT NULL,
  `fecha_servicio` date DEFAULT NULL,
  `hora_servicio` time DEFAULT NULL,
  `modalidad` enum('Presencial','Virtual','Híbrido') DEFAULT NULL,
  `num_participantes` int DEFAULT NULL,
  `num_certificados` int DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT NULL,
  `estado` varchar(100) DEFAULT NULL,
  `observaciones` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `orden_capacitacion_auditoria`
--

INSERT INTO `orden_capacitacion_auditoria` (`id`, `numero_orden`, `id_cotizacion`, `id_cliente`, `id_servicio`, `id_ponente`, `fecha_servicio`, `hora_servicio`, `modalidad`, `num_participantes`, `num_certificados`, `costo`, `estado`, `observaciones`) VALUES
(1, 'OC-2026-001', 4, 5, 5, 1, '2026-02-15', '09:00:00', 'Presencial', 25, 25, 3500.00, 'Aprobado', 'Capacitación HACCP para personal de cocina'),
(2, 'OC-2026-002', 12, 2, 2, 1, '2026-02-17', '17:00:00', 'Virtual', 10, 10, 600.00, 'Pendiente', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_producto`
--

CREATE TABLE `orden_producto` (
  `id` int NOT NULL,
  `numero_orden` varchar(20) NOT NULL,
  `id_cotizacion` int DEFAULT NULL,
  `id_cliente` int NOT NULL,
  `fecha_envio` date DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `igv` decimal(10,2) DEFAULT NULL,
  `incluye_igv` tinyint(1) NOT NULL DEFAULT '1',
  `emitido_por` int DEFAULT NULL,
  `estado` varchar(100) NOT NULL DEFAULT 'Aprobado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `orden_producto`
--

INSERT INTO `orden_producto` (`id`, `numero_orden`, `id_cotizacion`, `id_cliente`, `fecha_envio`, `total`, `subtotal`, `igv`, `incluye_igv`, `emitido_por`, `estado`) VALUES
(2, 'OP-2026-001', 10, 2, '2026-02-16', 100.00, 100.00, 0.00, 0, 1, 'Aprobado'),
(3, 'OP-2026-002', 11, 9, '2026-02-16', 150.00, 150.00, 0.00, 0, 1, 'Aprobado'),
(4, 'OP-2026-003', 2, 3, '2026-02-16', 2355.00, 2355.00, 0.00, 0, 1, 'Aprobado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_servicio`
--

CREATE TABLE `orden_servicio` (
  `id` int NOT NULL,
  `numero_orden` varchar(20) NOT NULL,
  `codigo_doc` varchar(20) DEFAULT 'OS-AC-001',
  `version` varchar(10) DEFAULT '01',
  `id_cotizacion` int DEFAULT NULL,
  `id_cliente` int NOT NULL,
  `fecha_aceptacion` date DEFAULT NULL,
  `fecha_tentativa` date DEFAULT NULL,
  `total_costo` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `igv` decimal(10,2) DEFAULT NULL,
  `incluye_igv` tinyint(1) NOT NULL DEFAULT '1',
  `emitido_por` int DEFAULT NULL,
  `estado` varchar(100) NOT NULL DEFAULT 'Aprobado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `orden_servicio`
--

INSERT INTO `orden_servicio` (`id`, `numero_orden`, `codigo_doc`, `version`, `id_cotizacion`, `id_cliente`, `fecha_aceptacion`, `fecha_tentativa`, `total_costo`, `subtotal`, `igv`, `incluye_igv`, `emitido_por`, `estado`) VALUES
(11, 'OS-2026-001', 'DOC-001', '1.0', 3, 1, '2026-02-08', '2026-02-15', 850.00, NULL, NULL, 1, 1, 'Aprobado'),
(12, 'OS-2026-002', 'OS-AC-001', '01', 5, 9, '2026-02-16', NULL, 450.00, 450.00, 0.00, 0, 1, 'Aprobado'),
(13, 'OS-2026-003', 'OS-AC-001', '01', 6, 9, '2026-02-16', '2026-02-24', 150.00, 150.00, 0.00, 0, 1, 'Aprobado'),
(14, 'OS-2026-004', 'OS-AC-001', '01', 8, 9, '2026-02-16', '2026-02-26', 330.00, 330.00, 0.00, 0, 1, 'Aprobado'),
(15, 'OS-2026-005', 'OS-AC-001', '01', 9, 9, '2026-02-16', '2026-02-24', 500.00, 500.00, 0.00, 0, 1, 'Aprobado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal`
--

CREATE TABLE `personal` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `celular` char(13) NOT NULL,
  `correo` varchar(50) NOT NULL,
  `id_area` int DEFAULT NULL,
  `usuario` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `personal`
--

INSERT INTO `personal` (`id`, `nombre`, `apellidos`, `celular`, `correo`, `id_area`, `usuario`, `password`) VALUES
(1, 'Admin', 'Sistema', '999999999', 'admin@qsci.com', NULL, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int NOT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `descripcion` varchar(200) NOT NULL,
  `id_categoria` int DEFAULT NULL,
  `fecha_vencim` date DEFAULT NULL,
  `ubicacion` varchar(50) NOT NULL,
  `unidad` varchar(20) DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `n_lote` varchar(50) NOT NULL,
  `estado` enum('Activo','Inactivo') DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `sku`, `descripcion`, `id_categoria`, `fecha_vencim`, `ubicacion`, `unidad`, `precio_unitario`, `n_lote`, `estado`) VALUES
(1, NULL, 'Cipermetrina 25% EC - 1L', 1, '2026-12-31', 'Almacén A1', NULL, NULL, 'LOT2025001', 'Inactivo'),
(2, NULL, 'Deltametrina 2.5% WP - 1kg', 1, '2026-12-31', 'Almacén A1', NULL, NULL, 'LOT2025002', 'Activo'),
(3, 'INS-BRO-0001', 'Bromadiolona 0.005% - 200g', 1, '2027-06-30', 'Almacén A2', NULL, NULL, 'LOT2025002', 'Activo'),
(4, 'INS-FUM-0001', 'Fumigadora manual 10L', 1, '2026-03-12', 'Almacén B1', 'Litros', NULL, 'EQ001', 'Activo'),
(5, NULL, 'Mascarilla respiratoria 3M', 4, '2026-03-15', 'Almacén C1', NULL, NULL, 'EPP001', 'Activo'),
(6, NULL, 'Gel Desinfectante Antibacterial 500ml', 1, '2027-12-31', 'Almacén Principal - Zona A', NULL, NULL, 'LOT-2026-010', 'Inactivo'),
(7, 'INS-CIP-0001', 'Cipermentrina', 1, '2026-03-10', 'Almacen A', 'Litros', NULL, 'L2006-001', 'Activo'),
(8, 'EPP-GEL-0001', 'Gel Desinfectante', 4, '2026-03-04', 'Almacen B', 'Litros', NULL, 'L2006-002', 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_historial`
--

CREATE TABLE `programacion_historial` (
  `id` int NOT NULL,
  `id_programacion` int NOT NULL,
  `campo_modificado` varchar(50) DEFAULT NULL,
  `valor_anterior` varchar(255) DEFAULT NULL,
  `valor_nuevo` varchar(255) DEFAULT NULL,
  `motivo` text,
  `modificado_por` int DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_insumos`
--

CREATE TABLE `programacion_insumos` (
  `id` int NOT NULL,
  `id_programacion` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad_asignada` int NOT NULL,
  `cantidad_utilizada` int DEFAULT NULL,
  `estado` enum('Asignado','Entregado','Utilizado','Devuelto') DEFAULT 'Asignado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_notificaciones`
--

CREATE TABLE `programacion_notificaciones` (
  `id` int NOT NULL,
  `id_programacion` int NOT NULL,
  `tipo` enum('Asignacion','Modificacion','Recordatorio','Cancelacion') NOT NULL,
  `destinatario_tipo` enum('Tecnico','Cliente','Supervisor') NOT NULL,
  `id_destinatario` int NOT NULL,
  `mensaje` text,
  `enviado` tinyint(1) DEFAULT '0',
  `fecha_envio` datetime DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programacion_servicio`
--

CREATE TABLE `programacion_servicio` (
  `id` int NOT NULL,
  `id_orden_servicio` int DEFAULT NULL,
  `id_orden_capacitacion` int DEFAULT NULL,
  `id_servicio` int NOT NULL,
  `id_tecnico_asignado` int NOT NULL,
  `id_supervisor` int DEFAULT NULL,
  `id_vehiculo` int DEFAULT NULL,
  `fecha_programada` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time DEFAULT NULL,
  `duracion_real` int DEFAULT NULL,
  `local_sede` varchar(150) DEFAULT NULL,
  `direccion_completa` varchar(255) DEFAULT NULL,
  `coordenadas` varchar(50) DEFAULT NULL,
  `estado_ejecucion` enum('Programado','Confirmado','En Camino','En Ejecución','Realizado','Reprogramado','Cancelado') DEFAULT 'Programado',
  `fecha_ejecucion_real` datetime DEFAULT NULL,
  `certificado_generado` tinyint(1) DEFAULT '0',
  `ruta_pdf_certificado` varchar(255) DEFAULT NULL,
  `ruta_pdf_agenda` varchar(255) DEFAULT NULL,
  `fotos_evidencia` text,
  `firma_cliente` varchar(255) DEFAULT NULL,
  `calificacion_cliente` int DEFAULT NULL,
  `observaciones` text,
  `creado_por` int DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `modificado_por` int DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proyecciones`
--

CREATE TABLE `proyecciones` (
  `id` int NOT NULL,
  `actividad` varchar(100) NOT NULL,
  `id_multicim` int NOT NULL,
  `id_orden_servicio` int DEFAULT NULL,
  `id_orden_producto` int DEFAULT NULL,
  `id_orden_capacitacion_auditoria` int DEFAULT NULL,
  `n_factura` varchar(100) NOT NULL,
  `monto_detrax` decimal(10,2) NOT NULL,
  `total_final` decimal(10,2) NOT NULL,
  `fecha_factura` date DEFAULT NULL,
  `dias_credito` int NOT NULL,
  `fecha_vcto` date DEFAULT NULL,
  `dia_vencer` int DEFAULT NULL,
  `fecha_pago` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rrhh_asistencia`
--

CREATE TABLE `rrhh_asistencia` (
  `id` int NOT NULL,
  `id_personal` int DEFAULT NULL,
  `id_tecnico` int DEFAULT NULL,
  `id_programacion` int DEFAULT NULL,
  `fecha` date NOT NULL,
  `tipo_registro` enum('Oficina','Campo') NOT NULL,
  `hora_entrada` time NOT NULL,
  `hora_salida` time DEFAULT NULL,
  `hora_esperada_entrada` time DEFAULT NULL,
  `hora_esperada_salida` time DEFAULT NULL,
  `gps_entrada` varchar(100) DEFAULT NULL,
  `gps_salida` varchar(100) DEFAULT NULL,
  `distancia_cliente_metros` decimal(10,2) DEFAULT NULL,
  `dentro_rango_50m` tinyint(1) DEFAULT '0',
  `foto_entrada` varchar(255) DEFAULT NULL,
  `foto_salida` varchar(255) DEFAULT NULL,
  `fotos_servicio` text,
  `horas_trabajadas` decimal(5,2) DEFAULT NULL,
  `tardanza_minutos` int DEFAULT '0',
  `estado` enum('Puntual','Tardanza','Falta','Fuera de Rango','Incompleto','Justificada') DEFAULT 'Incompleto',
  `observaciones` text,
  `justificacion` varchar(255) DEFAULT NULL,
  `registrado_via` enum('AppSheet','Web','Manual') DEFAULT 'AppSheet',
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `modificado_por` int DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Registro unificado de asistencia para administrativos y técnicos';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rrhh_horarios`
--

CREATE TABLE `rrhh_horarios` (
  `id` int NOT NULL,
  `id_personal` int DEFAULT NULL,
  `id_tecnico` int DEFAULT NULL,
  `dia_semana` enum('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo') NOT NULL,
  `hora_entrada_esperada` time NOT NULL,
  `hora_salida_esperada` time NOT NULL,
  `tolerancia_minutos` int DEFAULT '10',
  `activo` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Horarios laborales esperados por empleado';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rrhh_justificaciones`
--

CREATE TABLE `rrhh_justificaciones` (
  `id` int NOT NULL,
  `id_asistencia` int NOT NULL,
  `tipo` enum('Tardanza','Falta','Salida Anticipada','Permiso') NOT NULL,
  `motivo` text NOT NULL,
  `documento_respaldo` varchar(255) DEFAULT NULL,
  `aprobado_por` int DEFAULT NULL,
  `estado_aprobacion` enum('Pendiente','Aprobado','Rechazado') DEFAULT 'Pendiente',
  `fecha_solicitud` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_respuesta` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Justificaciones de tardanzas y faltas';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios`
--

CREATE TABLE `servicios` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `duracion_estimada` int DEFAULT '60' COMMENT 'Duración estimada en minutos',
  `requiere_movilidad` tinyint(1) DEFAULT '0' COMMENT 'Si necesita vehículo (asignar a Jordi)',
  `requiere_certificado` tinyint(1) DEFAULT '0' COMMENT 'Si genera certificado al finalizar',
  `plantilla_certificado` varchar(255) DEFAULT NULL COMMENT 'Ruta de plantilla PDF'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `servicios`
--

INSERT INTO `servicios` (`id`, `nombre`, `descripcion`, `estado`, `duracion_estimada`, `requiere_movilidad`, `requiere_certificado`, `plantilla_certificado`) VALUES
(1, 'Fumigación Residencial', 'Servicio de fumigación para hogares', 'activo', 120, 1, 1, NULL),
(2, 'Fumigación Comercial', 'Servicio de fumigación para negocios', 'activo', 180, 1, 0, NULL),
(3, 'Desratización', 'Control y eliminación de roedores', 'activo', 90, 1, 0, NULL),
(4, 'Desinsectación', 'Control de insectos rastreros y voladores', 'activo', 60, 1, 0, NULL),
(5, 'Capacitación HACCP', 'Capacitación en buenas prácticas de manufactura', 'activo', 240, 0, 1, NULL),
(6, 'Prueba', 'Prueba', 'inactivo', 60, 1, 1, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('g4ylZ7Hp36egaRSssGTmgwuD4NbX8QxregttPSMC', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiYWpEYnh5Sm9sY01yVXcwM0N4bmFoODRDcWlIOWhkQkM0eHJudnRQeCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1770453569),
('OIEwWMHCyr2FXpSA5XcIM8SwGxGo90lCWEKLUp89', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRGVEclV2WW11V1BGdEFPVFlCd3JrcjRrOEZMUkx6VktWVVhBMGEwUSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mzk6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9jb3RpemFjaW9uL3Rlc3QvMyI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1770543012),
('qyCKtLVdiuP0F42RKp9dMcKv9vA9ktvaEwlNUId4', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRERmdzdOWnMwcGtrMWpMV3lRb0xVMEc3TDNMc0pMUXR5T2ZQZ3dCeSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mzg6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9jb3RpemFjaW9uL3BkZi80IjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1770547766);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tecnicos`
--

CREATE TABLE `tecnicos` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `dni` char(8) NOT NULL,
  `celular` char(13) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `especialidad` varchar(100) DEFAULT NULL,
  `autorizado_conducir` tinyint(1) DEFAULT '0',
  `carga_maxima_semanal` int DEFAULT '40',
  `estado` enum('Activo','Inactivo','Licencia') DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `tecnicos`
--

INSERT INTO `tecnicos` (`id`, `nombre`, `apellidos`, `dni`, `celular`, `correo`, `especialidad`, `autorizado_conducir`, `carga_maxima_semanal`, `estado`) VALUES
(1, 'Juan', 'Pérez García', '12345678', '+51987654321', 'juan.perez@example.com', 'Control de Plagas y Fumigación', 1, 48, 'Activo'),
(2, 'María', 'López Torres', '87654321', '+51912345678', 'maria.lopez@example.com', 'Fumigación', 1, 45, 'Activo'),
(3, 'Carlos', 'Ramírez Silva', '11223344', '+51998877665', 'carlos.ramirez@example.com', 'Control de Roedores', 0, 40, 'Activo'),
(4, 'Ana', 'Fernández Ruiz', '99887766', '+51955443322', 'ana.fernandez@example.com', 'Desinfección', 0, 35, 'Licencia');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tecnico_disponibilidad`
--

CREATE TABLE `tecnico_disponibilidad` (
  `id` int NOT NULL,
  `id_tecnico` int NOT NULL,
  `fecha` date NOT NULL,
  `tipo` enum('Laboral','Descanso','Vacaciones','Licencia','Feriado') DEFAULT 'Laboral',
  `horas_disponibles` int DEFAULT '8',
  `observaciones` varchar(255) DEFAULT NULL,
  `creado_por` int DEFAULT NULL,
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vehiculos`
--

CREATE TABLE `vehiculos` (
  `id` int NOT NULL,
  `placa` varchar(10) NOT NULL,
  `modelo` varchar(50) DEFAULT NULL,
  `marca` varchar(50) DEFAULT NULL,
  `anio` int DEFAULT NULL,
  `capacidad_carga` decimal(8,2) DEFAULT NULL,
  `estado` enum('Disponible','En Uso','Mantenimiento','Fuera de Servicio') DEFAULT 'Disponible'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `vehiculos`
--

INSERT INTO `vehiculos` (`id`, `placa`, `modelo`, `marca`, `anio`, `capacidad_carga`, `estado`) VALUES
(1, 'ABC-123', 'Hilux 4x4', 'Toyota', 2023, 1800.00, 'Disponible'),
(2, 'XYZ-456', 'Navara', 'Nissan', 2022, 1200.00, 'Disponible'),
(3, 'DEF-789', 'Ranger', 'Ford', 2024, 1400.00, 'Disponible'),
(4, 'GHI-321', 'Hilux (Antigua)', 'Toyota', 2018, 1000.00, 'Disponible');

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
  ADD KEY `fk_det_cot_pro` (`id_producto`),
  ADD KEY `cotizacion_detalle_id_catalogo_cap_aud_foreign` (`id_catalogo_cap_aud`);

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
-- Indices de la tabla `mantenimiento`
--
ALTER TABLE `mantenimiento`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_mantenimiento_equipo` (`id_equipo`),
  ADD KEY `fk_mantenimiento_act` (`id_actmanten`);

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `area`
--
ALTER TABLE `area`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `caja_chica`
--
ALTER TABLE `caja_chica`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `catalogo_capacitacion_auditoria`
--
ALTER TABLE `catalogo_capacitacion_auditoria`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `cotizacion`
--
ALTER TABLE `cotizacion`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `cotizacion_detalle`
--
ALTER TABLE `cotizacion_detalle`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `detalle_orden_producto`
--
ALTER TABLE `detalle_orden_producto`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `detalle_orden_servicio`
--
ALTER TABLE `detalle_orden_servicio`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `equipo`
--
ALTER TABLE `equipo`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `mantenimiento`
--
ALTER TABLE `mantenimiento`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `multicim`
--
ALTER TABLE `multicim`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `oei_fichas`
--
ALTER TABLE `oei_fichas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `oei_ficha_anexos`
--
ALTER TABLE `oei_ficha_anexos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `oei_ficha_monitoreo`
--
ALTER TABLE `oei_ficha_monitoreo`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `oei_informe_final`
--
ALTER TABLE `oei_informe_final`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `orden_capacitacion_auditoria`
--
ALTER TABLE `orden_capacitacion_auditoria`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `orden_producto`
--
ALTER TABLE `orden_producto`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `orden_servicio`
--
ALTER TABLE `orden_servicio`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `personal`
--
ALTER TABLE `personal`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `programacion_historial`
--
ALTER TABLE `programacion_historial`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programacion_insumos`
--
ALTER TABLE `programacion_insumos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programacion_notificaciones`
--
ALTER TABLE `programacion_notificaciones`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programacion_servicio`
--
ALTER TABLE `programacion_servicio`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `proyecciones`
--
ALTER TABLE `proyecciones`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rrhh_asistencia`
--
ALTER TABLE `rrhh_asistencia`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rrhh_horarios`
--
ALTER TABLE `rrhh_horarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rrhh_justificaciones`
--
ALTER TABLE `rrhh_justificaciones`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `servicios`
--
ALTER TABLE `servicios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `tecnicos`
--
ALTER TABLE `tecnicos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `tecnico_disponibilidad`
--
ALTER TABLE `tecnico_disponibilidad`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
  ADD CONSTRAINT `cotizacion_detalle_id_catalogo_cap_aud_foreign` FOREIGN KEY (`id_catalogo_cap_aud`) REFERENCES `catalogo_capacitacion_auditoria` (`id`) ON DELETE SET NULL,
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
-- Filtros para la tabla `tecnico_disponibilidad`
--
ALTER TABLE `tecnico_disponibilidad`
  ADD CONSTRAINT `fk_disp_creador` FOREIGN KEY (`creado_por`) REFERENCES `personal` (`id`),
  ADD CONSTRAINT `fk_disp_tec` FOREIGN KEY (`id_tecnico`) REFERENCES `tecnicos` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
